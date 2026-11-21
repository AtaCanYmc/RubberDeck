export type TransportKind = 'web-bluetooth' | 'web-serial' | 'capacitor-ble' | 'mock';

export type ConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface TransportDevice {
  readonly id: string;
  readonly name: string;
  readonly transport: TransportKind;
  readonly rssi?: number;
}

export type Unsubscribe = () => void;
export type DataListener = (chunk: Uint8Array) => void;
export type StateListener = (state: ConnectionState, error?: string) => void;

export interface Transport {
  readonly kind: TransportKind;
  isSupported(): boolean;
  getState(): ConnectionState;
  getConnectedDevice(): TransportDevice | null;
  scan?(onDevice: (device: TransportDevice) => void): Promise<void>;
  stopScan?(): Promise<void>;
  connect(deviceId?: string): Promise<TransportDevice>;
  disconnect(): Promise<void>;
  write(data: Uint8Array): Promise<void>;
  onData(listener: DataListener): Unsubscribe;
  onStateChange(listener: StateListener): Unsubscribe;
}
