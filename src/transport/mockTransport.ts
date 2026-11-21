import {
  ACK_ERROR_CODE,
  FRAME_OVERHEAD_BYTES,
  PACKET_ETX,
  PACKET_STX,
  PROTOCOL_VERSION,
  computeXorChecksum,
  encodeAckPacket,
} from '../protocol';
import type {
  ConnectionState,
  DataListener,
  StateListener,
  Transport,
  TransportDevice,
  Unsubscribe,
} from './types';

export interface MockTransportOptions {
  readonly deviceName?: string;
  readonly maxPayloadBytes?: number;
  readonly autoAck?: boolean;
  readonly ackDelayMs?: number;
  readonly forcedErrorCode?: number | null;
}

export class MockTransport implements Transport {
  readonly kind = 'mock' as const;
  readonly writtenPackets: Uint8Array[] = [];

  private state: ConnectionState = 'disconnected';
  private connectedDevice: TransportDevice | null = null;
  private maxPayloadBytes: number;
  private autoAck: boolean;
  private ackDelayMs: number;
  private forcedErrorCode: number | null;
  private readonly deviceName: string;
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();

  constructor(options: MockTransportOptions = {}) {
    this.deviceName = options.deviceName ?? 'Mock HID Device';
    this.maxPayloadBytes = options.maxPayloadBytes ?? 1024;
    this.autoAck = options.autoAck ?? true;
    this.ackDelayMs = options.ackDelayMs ?? 5;
    this.forcedErrorCode = options.forcedErrorCode ?? null;
  }

  configure(options: Partial<MockTransportOptions>): void {
    if (options.maxPayloadBytes !== undefined) {
      this.maxPayloadBytes = options.maxPayloadBytes;
    }
    if (options.autoAck !== undefined) {
      this.autoAck = options.autoAck;
    }
    if (options.ackDelayMs !== undefined) {
      this.ackDelayMs = options.ackDelayMs;
    }
    if (options.forcedErrorCode !== undefined) {
      this.forcedErrorCode = options.forcedErrorCode;
    }
  }

  isSupported(): boolean {
    return true;
  }

  getState(): ConnectionState {
    return this.state;
  }

  getConnectedDevice(): TransportDevice | null {
    return this.connectedDevice;
  }

  async connect(deviceId?: string): Promise<TransportDevice> {
    this.setState('connecting');
    this.connectedDevice = {
      id: deviceId ?? 'mock-device-01',
      name: this.deviceName,
      transport: this.kind,
      rssi: -42,
    };
    this.setState('connected');
    return this.connectedDevice;
  }

  async disconnect(): Promise<void> {
    this.connectedDevice = null;
    this.setState('disconnected');
  }

  async write(data: Uint8Array): Promise<void> {
    if (this.state !== 'connected') {
      throw new Error('Mock transport is not connected.');
    }

    const copy = new Uint8Array(data);
    this.writtenPackets.push(copy);

    if (!this.autoAck) {
      return;
    }

    // Framed packet check: [STX, VER, SEQ, LEN_HI, LEN_LO, ...PAYLOAD, XOR, ETX]
    if (copy.length >= FRAME_OVERHEAD_BYTES && copy[0] === PACKET_STX) {
      const version = copy[1];
      const seq = copy[2];
      const len = (copy[3] << 8) | copy[4];

      let ack: Uint8Array;
      if (this.forcedErrorCode !== null) {
        ack = encodeAckPacket(seq, false, this.forcedErrorCode);
      } else if (version !== PROTOCOL_VERSION) {
        ack = encodeAckPacket(seq, false, ACK_ERROR_CODE.INVALID_VERSION_OR_COMMAND);
      } else if (len > this.maxPayloadBytes) {
        ack = encodeAckPacket(seq, false, ACK_ERROR_CODE.PAYLOAD_OVERFLOW);
      } else if (copy.length !== FRAME_OVERHEAD_BYTES + len || copy[copy.length - 1] !== PACKET_ETX) {
        ack = encodeAckPacket(seq, false, ACK_ERROR_CODE.INVALID_VERSION_OR_COMMAND);
      } else {
        const payload = copy.slice(5, 5 + len);
        const xor = copy[5 + len];
        if (computeXorChecksum(payload) !== xor) {
          ack = encodeAckPacket(seq, false, ACK_ERROR_CODE.XOR_MISMATCH);
        } else {
          ack = encodeAckPacket(seq, true, ACK_ERROR_CODE.NONE);
        }
      }

      this.emitDataWithDelay(ack);
    }
  }

  emitIncoming(bytes: Uint8Array): void {
    const copy = new Uint8Array(bytes);
    this.dataListeners.forEach((listener) => listener(copy));
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

  private emitDataWithDelay(bytes: Uint8Array): void {
    if (this.ackDelayMs <= 0) {
      this.emitIncoming(bytes);
      return;
    }
    setTimeout(() => {
      if (this.state === 'connected') {
        this.emitIncoming(bytes);
      }
    }, this.ackDelayMs);
  }

  private setState(state: ConnectionState, error?: string): void {
    this.state = state;
    this.stateListeners.forEach((listener) => listener(state, error));
  }
}
