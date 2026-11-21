import {
  BLE_CHARACTERISTIC_UUID,
  BLE_MTU_CHUNK_SIZE,
  BLE_SERVICE_UUID,
} from '../protocol';
import type {
  ConnectionState,
  DataListener,
  StateListener,
  Transport,
  TransportDevice,
  Unsubscribe,
} from './types';

export class WebBluetoothTransport implements Transport {
  readonly kind = 'web-bluetooth' as const;

  private state: ConnectionState = 'disconnected';
  private device: BluetoothDevice | null = null;
  private connectedDevice: TransportDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();

  private readonly handleCharacteristicValueChanged = (event: Event): void => {
    const target = event.target as BluetoothRemoteGATTCharacteristic | null;
    const value = target?.value;
    if (!value) {
      return;
    }
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const copy = new Uint8Array(bytes);
    this.dataListeners.forEach((listener) => listener(copy));
  };

  private readonly handleDisconnected = (): void => {
    this.characteristic = null;
    this.connectedDevice = null;
    this.setState('disconnected');
  };

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator && Boolean(navigator.bluetooth);
  }

  getState(): ConnectionState {
    return this.state;
  }

  getConnectedDevice(): TransportDevice | null {
    return this.connectedDevice;
  }

  async connect(): Promise<TransportDevice> {
    if (!this.isSupported()) {
      const msg = 'Web Bluetooth API is not supported in this browser.';
      this.setState('error', msg);
      throw new Error(msg);
    }

    this.setState('connecting');
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BLE_SERVICE_UUID] }],
        optionalServices: [BLE_SERVICE_UUID],
      });

      bleDevice.addEventListener('gattserverdisconnected', this.handleDisconnected);
      const server = await bleDevice.gatt?.connect();
      if (!server) {
        throw new Error('Failed to open GATT server.');
      }

      const service = await server.getPrimaryService(BLE_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BLE_CHARACTERISTIC_UUID);

      if (characteristic.properties.notify || characteristic.properties.indicate) {
        await characteristic.startNotifications();
        characteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged
        );
      }

      this.device = bleDevice;
      this.characteristic = characteristic;
      this.connectedDevice = {
        id: bleDevice.id,
        name: bleDevice.name ?? 'RubberDeck BLE',
        transport: this.kind,
      };
      this.setState('connected');
      return this.connectedDevice;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.setState('error', msg);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.characteristic) {
      this.characteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleCharacteristicValueChanged
      );
      try {
        await this.characteristic.stopNotifications();
      } catch {
        // Ignore notification cleanup errors during disconnect.
      }
      this.characteristic = null;
    }

    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this.handleDisconnected);
      if (this.device.gatt?.connected) {
        this.device.gatt.disconnect();
      }
      this.device = null;
    }

    this.connectedDevice = null;
    this.setState('disconnected');
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.characteristic || this.state !== 'connected') {
      throw new Error('Web Bluetooth transport is not connected.');
    }

    for (let offset = 0; offset < data.length; offset += BLE_MTU_CHUNK_SIZE) {
      const chunk = data.slice(offset, offset + BLE_MTU_CHUNK_SIZE);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValueWithResponse(chunk);
      }
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

  private setState(state: ConnectionState, error?: string): void {
    this.state = state;
    this.stateListeners.forEach((listener) => listener(state, error));
  }
}
