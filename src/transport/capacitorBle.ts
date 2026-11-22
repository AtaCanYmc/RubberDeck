import { Capacitor } from '@capacitor/core';
import { BleClient, type ScanResult } from '@capacitor-community/bluetooth-le';
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

export class CapacitorBleTransport implements Transport {
  readonly kind = 'capacitor-ble' as const;

  private initialized = false;
  private state: ConnectionState = 'disconnected';
  private connectedDevice: TransportDevice | null = null;
  private readonly dataListeners = new Set<DataListener>();
  private readonly stateListeners = new Set<StateListener>();

  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  getState(): ConnectionState {
    return this.state;
  }

  getConnectedDevice(): TransportDevice | null {
    return this.connectedDevice;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await BleClient.initialize({ androidNeverForLocation: true });
    this.initialized = true;
  }

  async scan(onDevice: (device: TransportDevice) => void): Promise<void> {
    await this.ensureInitialized();
    this.setState('scanning');

    await BleClient.requestLEScan(
      {
        services: [BLE_SERVICE_UUID],
        allowDuplicates: false,
      },
      (result: ScanResult) => {
        onDevice({
          id: result.device.deviceId,
          name: result.localName ?? result.device.name ?? 'RubberDeck BLE',
          transport: this.kind,
          rssi: result.rssi,
        });
      }
    );
  }

  async stopScan(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    await BleClient.stopLEScan();
    if (this.state === 'scanning') {
      this.setState('disconnected');
    }
  }

  async connect(deviceId?: string): Promise<TransportDevice> {
    await this.ensureInitialized();
    this.setState('connecting');

    try {
      let targetId = deviceId;
      let targetName = 'RubberDeck BLE';

      if (!targetId) {
        const picked = await BleClient.requestDevice({
          services: [BLE_SERVICE_UUID],
          optionalServices: [BLE_SERVICE_UUID],
        });
        targetId = picked.deviceId;
        targetName = picked.name ?? targetName;
      }

      await BleClient.connect(targetId, () => {
        this.connectedDevice = null;
        this.setState('disconnected');
      });

      await BleClient.startNotifications(
        targetId,
        BLE_SERVICE_UUID,
        BLE_CHARACTERISTIC_UUID,
        (value: DataView) => {
          const bytes = new Uint8Array(
            value.buffer,
            value.byteOffset,
            value.byteLength
          );
          const copy = new Uint8Array(bytes);
          this.dataListeners.forEach((listener) => listener(copy));
        }
      );

      this.connectedDevice = {
        id: targetId,
        name: targetName,
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
    if (this.connectedDevice) {
      const id = this.connectedDevice.id;
      try {
        await BleClient.stopNotifications(
          id,
          BLE_SERVICE_UUID,
          BLE_CHARACTERISTIC_UUID
        );
      } catch {
        // Ignore cleanup errors.
      }
      try {
        await BleClient.disconnect(id);
      } catch {
        // Ignore cleanup errors.
      }
    }
    this.connectedDevice = null;
    this.setState('disconnected');
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.connectedDevice || this.state !== 'connected') {
      throw new Error('Capacitor BLE transport is not connected.');
    }

    for (let offset = 0; offset < data.length; offset += BLE_MTU_CHUNK_SIZE) {
      const chunk = data.slice(offset, offset + BLE_MTU_CHUNK_SIZE);
      const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      await BleClient.writeWithoutResponse(
        this.connectedDevice.id,
        BLE_SERVICE_UUID,
        BLE_CHARACTERISTIC_UUID,
        view
      );
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
