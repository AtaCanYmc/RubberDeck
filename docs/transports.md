[← Back to Docs Index](README.md)

# Transports and Platform Support

All hardware links implement the `Transport` contract in `src/transport/types.ts`.

## Transport Matrix

| Transport | File | Link Parameters | Supported Platforms |
| :--- | :--- | :--- | :--- |
| `web-bluetooth` | `src/transport/webBluetooth.ts` | GATT `0xFFE0` / `0xFFE1`, 20-byte MTU chunking | Desktop Chromium (Chrome, Edge, Opera) and Android Chrome over HTTPS or `localhost` |
| `web-serial` | `src/transport/webSerial.ts` | USB CDC Serial at `115200` baud | Desktop Chromium (Chrome, Edge, Opera) over HTTPS or `localhost` |
| `capacitor-ble` | `src/transport/capacitorBle.ts` | `@capacitor-community/bluetooth-le`, GATT `0xFFE0` / `0xFFE1` | Capacitor 8 Android and iOS native builds |
| `mock` | `src/transport/mockTransport.ts` | In-memory loopback returning synthetic 6-byte ACKs | All browsers and Node/Vitest test environments |

## BLE GATT Specification

Defined in `src/protocol/constants.ts`:

- Service UUID: `0000ffe0-0000-1000-8000-00805f9b34fb`
- Characteristic UUID: `0000ffe1-0000-1000-8000-00805f9b34fb`
- MTU Chunk Size: `20` bytes (`BLE_MTU_CHUNK_SIZE`)

Outbound frames larger than `20` bytes are split into sequential MTU-sized writes so HM-10 and ESP32-S3 GATT buffers do not drop bytes.

## USB CDC Serial Specification

- Baud rate: `115200` (`USB_CDC_BAUD_RATE`)
- Data bits: `8`, Parity: `none`, Stop bits: `1`

## Capacitor 8 Native Builds

Configuration lives in `capacitor.config.ts` (`appId: io.github.atacanymc.rubberdeck`, `webDir: dist`).

```bash
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

### Required Native Permissions

- **Android (API 31+)**: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, and location permission fallback for older Android releases.
- **iOS**: `NSBluetoothAlwaysUsageDescription` in `Info.plist`.
