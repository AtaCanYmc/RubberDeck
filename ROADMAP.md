# Roadmap

Milestones reflect concrete engineering work tracked by version tag. Scope may adjust based on hardware protocol changes in RubberOtter and RubberOrca.

## v0.1.x: Core Control Console

- [x] RubberOtter v1 framed wire protocol codec, XOR checksum, and 6-byte ACK parser (`src/protocol/`).
- [x] Device profile definitions and capability gating for `rubberotter` and `rubberorca`.
- [x] Sequential command queue with retry and timeout handling.
- [x] Decoupled transports for Web Bluetooth, Web Serial, Capacitor BLE, and Mock testing.
- [x] Standalone PWA build with GitHub Pages deployment and Capacitor 8 mobile configuration.
- [x] Repository governance, CI verification, and automated release pipeline.

## v0.2.0: Macro Management and Diagnostics

- [ ] Import and export for RubberOrca NVS macro banks (`m0..m15`) as JSON.
- [ ] Live packet inspector showing raw TX/RX frames, sequence IDs, and ACK error codes.
- [ ] Reconnect recovery for transient BLE GATT drops on Android and iOS.
- [ ] Expanded unit tests for transport adapters and command queue edge cases.

## v1.0.0: Production Mobile and Desktop Release

- [ ] Signed Android APK and iOS TestFlight build pipelines via Capacitor 8.
- [ ] Protocol v1 stability freeze verified against both RubberOtter and RubberOrca hardware revisions.
- [ ] Keyboard shortcut bindings for desktop PWA trackpad, presentation, and media panels.
