[← Back to Root Repository](../README.md)

# RubberDeck Documentation

Technical reference for the RubberDeck control PWA and Capacitor 8 mobile application.

## Guides

| Document | Scope |
| :--- | :--- |
| [architecture.md](architecture.md) | Layer boundaries, state flow, UI module gating, and framed TX/ACK sequencing. |
| [protocol.md](protocol.md) | RubberOtter v1 wire format, XOR checksum, ACK error codes, quick-command table, and profile capabilities. |
| [transports.md](transports.md) | BLE 5.0 GATT, USB CDC Web Serial, Capacitor BLE, Mock transport, and mobile build configuration. |
| [app-store-review.md](app-store-review.md) | Apple App Store and Google Play review notes, `Info.plist`, `PrivacyInfo.xcprivacy`, and Android permissions. |

## Related Repositories

- RubberOtter firmware and Caterina flasher: https://github.com/AtaCanYmc/RubberOtter
- RubberOrca ESP32-S3 firmware and Web Serial flasher: https://github.com/AtaCanYmc/RubberOrca
