# Security Policy

## Supported Versions

| Version | Supported |
| :--- | :--- |
| `0.1.x` | Yes |
| `< 0.1.0` | No |

## Scope

Security reports for RubberDeck cover:

- Wire protocol parsing, framing, and checksum verification in `src/protocol/`.
- Transport handling across Web Bluetooth, Web Serial, and Capacitor BLE in `src/transport/`.
- Command validation, payload length enforcement, and unintended HID command execution.
- Service worker caching, PWA manifest permissions, and build pipeline integrity.

Firmware vulnerabilities in target hardware belong to their dedicated repositories:

- RubberOtter: https://github.com/AtaCanYmc/RubberOtter/security/policy
- RubberOrca: https://github.com/AtaCanYmc/RubberOrca/security/policy

## Reporting a Vulnerability

Do not open public GitHub issues for security vulnerabilities.

Report vulnerabilities privately through one of the following channels:

1. GitHub Private Vulnerability Reporting: https://github.com/AtaCanYmc/RubberDeck/security/advisories/new
2. Email: `atacanymc@gmail.com`

Include the following details in your report:

- Affected component or file path.
- Target environment, including browser or Capacitor platform and device profile.
- Step-by-step reproduction instructions or a minimal proof of concept.
- Potential impact and any suggested remediation.

## Response Timeline

- Initial acknowledgement: within 48 hours.
- Triage and severity assessment: within 5 business days.
- Fix coordination and disclosure: coordinated privately with the reporter before public release.
