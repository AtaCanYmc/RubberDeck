# Contributing to RubberDeck

RubberDeck uses a strict verification pipeline and Conventional Commits for automated releases. Follow the workflow below for all pull requests.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Android Studio or Xcode only if testing Capacitor native builds

## Local Setup

```bash
git clone https://github.com/AtaCanYmc/RubberDeck.git
cd RubberDeck
npm install
npm run dev
```

## Branch Naming

Create branches from `main` using a descriptive prefix:

- `feat/<short-description>` for new features or panel capabilities
- `fix/<short-description>` for bug fixes
- `docs/<short-description>` for documentation updates
- `refactor/<short-description>` for internal structural changes
- `test/<short-description>` for test coverage additions

## Commit Convention

All commits must follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/). Release Please uses commit types to generate `CHANGELOG.md` and version bumps.

| Type | Purpose |
| :--- | :--- |
| `feat` | New capability, transport, or UI panel |
| `fix` | Bug fix in protocol, transport, store, or UI |
| `perf` | Performance improvement |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `docs` | Documentation-only changes |
| `test` | Adding or updating Vitest unit tests |
| `ci` | GitHub Actions workflow or automation changes |
| `chore` | Dependency updates or repository maintenance |

Example commit messages:

```text
feat(protocol): validate max payload size per device profile
fix(transport): clear pending ACK timers on Web Serial disconnect
docs: document BLE GATT UUIDs and ACK error codes
```

## Verification Before Opening a Pull Request

Run all four checks locally and ensure zero errors:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architectural Boundaries

- Keep `src/protocol/` free of browser, DOM, and Capacitor imports so protocol logic remains pure TypeScript and testable in Node.
- Gate hardware-specific UI features through `DeviceProfile.capabilities` rather than hardcoding device names in components.
- Do not commit firmware binaries (`.hex` or `.bin`), flash manifests, or flashing code to this repository. Firmware flashing lives in the RubberOtter and RubberOrca repositories.

## Pull Request Checklist

- Commits follow Conventional Commits.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` pass locally.
- Protocol or transport changes include unit tests in `tests/`.
- Documentation reflects any user-facing or architectural change.
