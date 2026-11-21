import { USB_CDC_BAUD_RATE } from '../protocol';
import type {
  ConnectionState,
  DataListener,
  StateListener,
  Transport,
  TransportDevice,
  Unsubscribe,
} from './types';

interface SerialPortInfo {
  readonly usbVendorId?: number;
  readonly usbProductId?: number;
}

interface WebSerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  getInfo(): SerialPortInfo;
  readonly readable: ReadableStream<Uint8Array> | null;
  readonly writable: WritableStream<Uint8Array> | null;
}

interface WebSerialNavigator {
  readonly serial?: {
    requestPort(): Promise<WebSerialPort>;
  };
}

function getSerialApi(): WebSerialNavigator['serial'] {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  return (navigator as unknown as WebSerialNavigator).serial;
}

export class WebSerialTransport implements Transport {
  readonly kind = 'web-serial' as const;

  private state: ConnectionState = 'disconnected';
  private port: WebSerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private connectedDevice: TransportDevice | null = null;
  private readLoopActive = false;
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();

  isSupported(): boolean {
    return Boolean(getSerialApi());
  }

  getState(): ConnectionState {
    return this.state;
  }

  getConnectedDevice(): TransportDevice | null {
    return this.connectedDevice;
  }

  async connect(): Promise<TransportDevice> {
    const serial = getSerialApi();
    if (!serial) {
      const msg = 'Web Serial API is not supported in this browser.';
      this.setState('error', msg);
      throw new Error(msg);
    }

    this.setState('connecting');
    try {
      const port = await serial.requestPort();
      await port.open({ baudRate: USB_CDC_BAUD_RATE });
      this.port = port;

      const info = port.getInfo();
      const vid = info.usbVendorId ? `0x${info.usbVendorId.toString(16)}` : 'USB';
      const pid = info.usbProductId ? `0x${info.usbProductId.toString(16)}` : 'CDC';
      this.connectedDevice = {
        id: `serial-${vid}-${pid}`,
        name: `USB CDC (${vid}:${pid})`,
        transport: this.kind,
      };

      this.setState('connected');
      void this.startReadLoop(port);
      return this.connectedDevice;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.setState('error', msg);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this.readLoopActive = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch {
        // Ignore reader cancel errors.
      }
      this.reader.releaseLock();
      this.reader = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignore port close errors.
      }
      this.port = null;
    }

    this.connectedDevice = null;
    this.setState('disconnected');
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.port?.writable || this.state !== 'connected') {
      throw new Error('Web Serial transport is not connected.');
    }

    const writer = this.port.writable.getWriter();
    try {
      await writer.write(data);
    } finally {
      writer.releaseLock();
    }
  }

  onData(listener: DataListener): Unsubscribe {
    this.dataListeners.add(listener);
    return () => {
      this.dataListeners.delete(listener);
    };
  }

  onStateChange(listener: StateListener): Unsubscribe {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private async startReadLoop(port: WebSerialPort): Promise<void> {
    if (!port.readable) {
      return;
    }
    this.readLoopActive = true;
    const reader = port.readable.getReader();
    this.reader = reader;

    try {
      while (this.readLoopActive) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        if (value && value.length > 0) {
          const copy = new Uint8Array(value);
          this.dataListeners.forEach((listener) => listener(copy));
        }
      }
    } catch {
      if (this.readLoopActive) {
        this.setState('disconnected');
      }
    } finally {
      reader.releaseLock();
      if (this.reader === reader) {
        this.reader = null;
      }
    }
  }

  private setState(state: ConnectionState, error?: string): void {
    this.state = state;
    this.stateListeners.forEach((listener) => listener(state, error));
  }
}
