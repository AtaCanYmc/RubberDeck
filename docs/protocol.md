[← Back to Docs Index](README.md)

# RubberOtter v1 Wire Protocol

RubberDeck implements the RubberOtter v1 binary and text-framed protocol defined in `src/protocol/`.

## Framed Packet Layout

Each framed command carries `7` bytes of framing overhead (`FRAME_OVERHEAD_BYTES`):

```text
[STX: 0x02] [VER: 0x01] [SEQ: 1B] [LEN_HI: 1B] [LEN_LO: 1B] [PAYLOAD: N B] [XOR: 1B] [ETX: 0x03]
```

| Field | Size | Value / Rule |
| :--- | :--- | :--- |
| `STX` | 1 byte | `0x02` (`PACKET_STX`) |
| `VER` | 1 byte | `0x01` (`PROTOCOL_VERSION`) |
| `SEQ` | 1 byte | Monotonic sequence number (`0x00`..`0xFF`) |
| `LEN_HI`, `LEN_LO` | 2 bytes | Big-endian unsigned payload byte length `N` |
| `PAYLOAD` | `N` bytes | UTF-8 command string (`N <= profile.maxPayloadBytes`) |
| `XOR` | 1 byte | Bitwise XOR over `VER`, `SEQ`, `LEN_HI`, `LEN_LO`, and all `PAYLOAD` bytes |
| `ETX` | 1 byte | `0x03` (`PACKET_ETX`) |

## 6-Byte ACK Frame

The hardware replies with a fixed 6-byte frame (`ACK_FRAME_LENGTH`):

```text
[0x02, 0x01, SEQ, OK, CODE, 0x03]
```

| `CODE` | Constant | Meaning |
| :--- | :--- | :--- |
| `0` | `ACK_ERROR_CODE.NONE` | Command accepted and executed |
| `1` | `ACK_ERROR_CODE.INVALID_VERSION_OR_COMMAND` | Unsupported protocol version or malformed command |
| `2` | `ACK_ERROR_CODE.PAYLOAD_OVERFLOW` | Payload exceeds hardware buffer limit |
| `3` | `ACK_ERROR_CODE.XOR_MISMATCH` | Checksum verification failed |

## Command Chaining

Multiple text commands can be chained inside a single framed payload using `&&` or `;`:

```text
type "git status" && delay 150 && enter
```

`src/protocol/commandValidator.ts` enforces profile byte limits and blocks unsupported commands before transmission.

## Single-Byte Quick Commands (`0x11`..`0x85`)

Low-latency actions bypass full text framing and send a single byte (or 3 bytes for relative pointer movement `0x80 <dx> <dy>` where `dx` and `dy` are signed 8-bit integers in `-128..127`).

| Hex | Constant | Label | ASCII Equivalent |
| :--- | :--- | :--- | :--- |
| `0x11` | `MEDIA_PLAY_PAUSE` | Media: Play / Pause | `media play_pause` |
| `0x12` | `MEDIA_NEXT_TRACK` | Media: Next Track | `media next` |
| `0x13` | `MEDIA_PREV_TRACK` | Media: Previous Track | `media prev` |
| `0x14` | `MEDIA_VOL_UP` | Media: Volume Up | `media volume_up` |
| `0x15` | `MEDIA_VOL_DOWN` | Media: Volume Down | `media volume_down` |
| `0x16` | `MEDIA_MUTE` | Media: Mute | `media mute` |
| `0x21` | `PRES_NEXT_SLIDE` | Presentation: Next Slide | `press right` |
| `0x22` | `PRES_PREV_SLIDE` | Presentation: Previous Slide | `press left` |
| `0x23` | `PRES_FULLSCREEN` | Presentation: Fullscreen (F5) | `press f5` |
| `0x24` | `PRES_BLANK_SCREEN` | Presentation: Blank Screen | `type "b"` |
| `0x31` | `SEC_LOCK_WORKSTATION` | Security: Lock Workstation | `press gui l` |
| `0x32` | `SEC_JIGGLER_TOGGLE` | Security: Toggle Jiggler | `jiggler toggle` |
| `0x33` | `SEC_TASK_MANAGER` | Security: Task Manager | `press ctrl shift esc` |
| `0x34` | `SEC_SHOW_DESKTOP` | Security: Show Desktop | `press gui d` |
| `0x35` | `SEC_VIBRATE_PULSE` | Haptic: Vibrate Pulse | `vibrate 100` |
| `0x41` | `GAME_CS_BUY` | Macro: Quick Buy Sequence | `type "b" && delay 120 && type "4" && delay 120 && type "2"` |
| `0x80` | `MOUSE_MOVE_PACKET` | Mouse: Relative Move (`0x80 <dx> <dy>`) | Binary 3-byte packet |
| `0x81` | `MOUSE_LEFT_CLICK` | Mouse: Left Click | `mouse click left` |
| `0x82` | `MOUSE_RIGHT_CLICK` | Mouse: Right Click | `mouse click right` |
| `0x83` | `MOUSE_MIDDLE_CLICK` | Mouse: Middle Click | `mouse click middle` |
| `0x84` | `MOUSE_SCROLL_UP` | Mouse: Scroll Up | `mouse scroll 1` |
| `0x85` | `MOUSE_SCROLL_DOWN` | Mouse: Scroll Down | `mouse scroll -1` |

## Device Profile Matrix

Defined in `src/protocol/profiles.ts`:

| Capability | `rubberotter` | `rubberorca` |
| :--- | :--- | :--- |
| Target MCU | ATmega32U4 + HM-10 / ESP32 | ESP32-S3 |
| Max Payload | `384 B` | `1024 B` |
| Keyboard, Mouse, Media, Jiggler, Haptics | Yes | Yes |
| Single-Byte Shortcuts & Chaining | Yes | Yes |
| Persistent NVS Macros (`m0..m15`) | No (`0`) | Yes (`16`) |
| Keyboard Layouts | `us` | `us`, `tr_q` |
| BLE Name & Passkey Config | No | Yes |
