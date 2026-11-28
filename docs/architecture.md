[← Back to Docs Index](README.md)

# Architecture

RubberDeck separates hardware wire protocol logic, transport I/O, client state, and UI panels into distinct unidirectional layers.

## Layer Overview

[View Layer Overview Diagram (HTML + SVG)](diagrams/architecture-layers.html)

## Non-Negotiable Boundaries

1. **Pure Protocol Layer (`src/protocol/`)**: Contains zero DOM, browser, React, or Capacitor imports. All packet encoding, XOR checksum calculation, profile validation, and ACK queueing run directly in Node under Vitest (`tests/`).
2. **Transport Decoupling (`src/transport/`)**: Every transport implements the `Transport` interface (`connect`, `disconnect`, `write`, `onData`, `onStateChange`). Upper layers never branch on browser or native BLE internals.
3. **Capability-Gated UI (`src/components/`)**: Panels and navigation tabs read `DeviceProfile.capabilities` from `useDeckStore` rather than hardcoding board names. Switching from `rubberorca` to `rubberotter` automatically hides NVS macro slots and device configuration views.
4. **Firmware Exclusion**: RubberDeck does not bundle `.hex`/`.bin` images or flashing logic. External flashers live in the RubberOtter and RubberOrca repositories and are linked via `FirmwareLinksPanel.tsx`.

## Framed Command Sequence

[View Framed Command Sequence Diagram (HTML + SVG)](diagrams/framed-command-sequence.html)

## UI Design System (`src/components/ui/`)

Reusable tactile primitives encapsulate surface styling and active feedback without coupling to transport state:

- `HardwareCard.tsx`: Layered matte graphite containers (`#121215` / `#18181B`) with `1px` hairline borders and top inner bevels.
- `TactileButton.tsx`: Physical press-state buttons (`default`, `signal`, `ghost`, `danger`, `keycap`) aligned with `triggerHaptic`.
- `StatusLed.tsx`: Physical 4px to 6px state indicators (`green`, `amber`, `red`, `signal`, `off`).
- `SectionLabel.tsx`: Monospace hardware legend header with optional telemetry slot.
