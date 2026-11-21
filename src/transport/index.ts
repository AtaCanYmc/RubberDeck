import { CapacitorBleTransport } from './capacitorBle';
import { MockTransport } from './mockTransport';
import type { Transport, TransportKind } from './types';
import { WebBluetoothTransport } from './webBluetooth';
import { WebSerialTransport } from './webSerial';

export * from './types';
export { WebBluetoothTransport } from './webBluetooth';
export { WebSerialTransport } from './webSerial';
export { CapacitorBleTransport } from './capacitorBle';
export { MockTransport } from './mockTransport';

export function createTransport(kind: TransportKind): Transport {
  switch (kind) {
    case 'capacitor-ble':
      return new CapacitorBleTransport();
    case 'web-bluetooth':
      return new WebBluetoothTransport();
    case 'web-serial':
      return new WebSerialTransport();
    case 'mock':
      return new MockTransport();
  }
}

export function getAvailableTransports(): readonly TransportKind[] {
  const kinds: TransportKind[] = [];
  if (new CapacitorBleTransport().isSupported()) {
    kinds.push('capacitor-ble');
  }
  if (new WebBluetoothTransport().isSupported()) {
    kinds.push('web-bluetooth');
  }
  if (new WebSerialTransport().isSupported()) {
    kinds.push('web-serial');
  }
  kinds.push('mock');
  return kinds;
}
