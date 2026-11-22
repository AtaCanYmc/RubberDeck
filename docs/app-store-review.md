[← Back to Docs Index](README.md)

# App Store and Google Play Submission Guide

Pre-submission configuration and review notes for shipping RubberDeck as a Capacitor 8 native app on iOS and Android.

## 1. Apple App Store Review Notes (Copy-Paste Template)

```text
RubberDeck is a Bluetooth Low Energy (BLE 5.0 GATT) companion controller for
open-source USB HID hardware devices (RubberOtter and RubberOrca, service 0xFFE0 /
characteristic 0xFFE1).

1. Testing Without Physical Hardware (Demo Mode):
   - In the top telemetry bar, select "Mock" in the transport selector.
   - Tap "Connect". The app connects to an in-memory hardware simulator that
     replies with real 6-byte protocol ACKs.
   - All panels (Trackpad, Media, Slides, Security, Console, Macros, and Device
     Config) can be exercised end-to-end.

2. Native Capability Justification (Guideline 4.2):
   - iOS Safari does not expose the Web Bluetooth API. Native CoreBluetooth
     access via @capacitor-community/bluetooth-le and native Taptic Engine
     feedback via @capacitor/haptics are required for physical hardware control.

3. Hardware Demonstration Video:
   - [Insert unlisted video URL showing iPhone connecting via BLE to RubberOrca
     and controlling a host computer]

4. Privacy & Accounts:
   - No login or account is required.
   - Zero analytics, tracking, or outbound network requests.
   - Privacy Policy: https://atacanymc.github.io/RubberDeck/privacy.html
```

## 2. iOS Native Requirements (After `npx cap add ios`)

Add to `ios/App/App/Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>RubberDeck uses Bluetooth Low Energy to discover and send HID commands to nearby RubberOtter and RubberOrca hardware controllers.</string>
```

Add `ios/App/App/PrivacyInfo.xcprivacy`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array/>
</dict>
</plist>
```

## 3. Android Native Requirements (After `npx cap add android`)

Ensure `android/variables.gradle` targets `targetSdkVersion = 35` or newer.
Configure `android/app/src/main/AndroidManifest.xml` so Play Console does not flag unjustified Location usage:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-feature android:name="android.hardware.bluetooth_le" android:required="false" />
```

`src/transport/capacitorBle.ts` already initializes `BleClient.initialize({ androidNeverForLocation: true })`.

## 4. Store Privacy Declarations

Because fonts are self-hosted via `@fontsource/*` and all transport communication is local BLE/USB CDC:

- **Apple App Privacy**: Data Not Collected.
- **Google Play Data Safety**: No user data collected or shared.
- **Privacy Policy URL**: `https://atacanymc.github.io/RubberDeck/privacy.html`
