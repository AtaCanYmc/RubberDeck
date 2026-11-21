# RubberDeck

Unified control PWA and Capacitor 8 (Android/iOS) application for [RubberOtter](https://github.com/AtaCanYmc/RubberOtter) and [RubberOrca](https://github.com/AtaCanYmc/RubberOrca) USB HID + BLE 5.0 hardware.

Live PWA: https://atacanymc.github.io/RubberDeck/

## Protocol and Profiles

RubberDeck implements the RubberOtter v1 wire protocol over BLE 5.0 GATT (`0000ffe0-0000-1000-8000-00805f9b34fb` / `0000ffe1-0000-1000-8000-00805f9b34fb`) and USB CDC Web Serial (`115200` baud):

- Framed packet: `[STX: 0x02] [VER: 0x01] [SEQ: 1B] [LEN_HI: 1B] [LEN_LO: 1B] [PAYLOAD: N B] [XOR: 1B] [ETX: 0x03]`
- 6-byte ACK: `[0x02, 0x01, SEQ, OK, CODE, 0x03]` (`1`: invalid version/command, `2`: payload overflow, `3`: XOR mismatch)
- Single-byte quick commands: `0x11`..`0x85` and relative mouse packet `0x80 <dx> <dy>`
- Command chaining: `&&` and `;`

| Profile | Target Hardware | Max Payload | Capabilities |
| :--- | :--- | :--- | :--- |
| `rubberotter` | ATmega32U4 + HM-10 / ESP32 | `384 B` | Keyboard, mouse, media, jiggler, haptics, quick macros |
| `rubberorca` | ESP32-S3 | `1024 B` | All RubberOtter features + 16 NVS macros (`m0..m15`), `layout us\|tr_q`, `ble name`, `ble passkey <100000..999999\|off>` |

## Firmware Flashing (External)

RubberDeck intentionally excludes firmware binaries (`.hex` / `.bin`), flash manifests, and Web Serial flasher code. Flash firmware from the dedicated hardware repositories:

- RubberOtter Flasher: https://atacanymc.github.io/RubberOtter/
- RubberOrca Flasher: https://atacanymc.github.io/RubberOrca/ (Repository: https://github.com/AtaCanYmc/RubberOrca)

## Development

```bash
npm install
npm run dev
```

Verification:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Capacitor 8 Mobile Build

```bash
npx cap add android
npx cap add ios
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

## Architecture

- `src/protocol/`: Pure TypeScript codec (`packetCodec.ts`), device profiles (`profiles.ts`), command chaining validator (`commandValidator.ts`), and sequential ACK queue (`commandQueue.ts`).
- `src/transport/`: Decoupled transport implementations (`WebBluetoothTransport`, `WebSerialTransport`, `CapacitorBleTransport`, `MockTransport`).
- `src/hooks/`: `useDeviceConnection` and `useCommandQueue`.
- `src/store/`: Zustand store (`useDeckStore.ts`).
- `src/components/`: Minimalist industrial UI panels gated by `DeviceProfile.capabilities`.
