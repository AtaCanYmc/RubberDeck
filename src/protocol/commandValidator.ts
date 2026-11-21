import type { DeviceProfile } from './profiles';

export interface CommandValidationResult {
  readonly valid: boolean;
  readonly commands: readonly string[];
  readonly payloadBytes: number;
  readonly error?: string;
}

const textEncoder = new TextEncoder();

/**
 * Splits a chained command string by `&&` or `;` while preserving separators
 * inside double-quoted strings and `{ ... }` macro definitions.
 */
export function splitCommandChain(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let escapeNext = false;
  let braceDepth = 0;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === '\\' && inQuotes) {
      current += ch;
      escapeNext = true;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }

    if (!inQuotes) {
      if (ch === '{') {
        braceDepth += 1;
        current += ch;
        continue;
      }
      if (ch === '}' && braceDepth > 0) {
        braceDepth -= 1;
        current += ch;
        continue;
      }
      if (braceDepth === 0) {
        if (ch === ';') {
          const trimmed = current.trim();
          if (trimmed.length > 0) {
            parts.push(trimmed);
          }
          current = '';
          continue;
        }
        if (ch === '&' && input[i + 1] === '&') {
          const trimmed = current.trim();
          if (trimmed.length > 0) {
            parts.push(trimmed);
          }
          current = '';
          i += 1;
          continue;
        }
      }
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail.length > 0) {
    parts.push(tail);
  }

  return parts;
}

function validateSingleCommand(command: string, profile: DeviceProfile): string | null {
  const lower = command.trim().toLowerCase();

  if (lower.startsWith('layout ')) {
    const arg = lower.slice('layout '.length).trim();
    if (!profile.capabilities.keyboardLayouts.includes(arg as 'us' | 'tr_q')) {
      return `Command "layout ${arg}" is not supported on ${profile.label}.`;
    }
    return null;
  }

  if (lower.startsWith('ble name')) {
    if (!profile.capabilities.bleNameConfig) {
      return `Command "ble name" is not supported on ${profile.label}.`;
    }
    return null;
  }

  if (lower.startsWith('ble passkey')) {
    if (!profile.capabilities.blePasskeyConfig) {
      return `Command "ble passkey" is not supported on ${profile.label}.`;
    }
    const arg = lower.slice('ble passkey'.length).trim();
    if (arg !== 'off') {
      const numeric = Number(arg);
      if (!/^\d{6}$/.test(arg) || numeric < 100000 || numeric > 999999) {
        return 'BLE passkey must be a 6-digit number (100000..999999) or "off".';
      }
    }
    return null;
  }

  if (lower.startsWith('macro define ') || lower.startsWith('macro run ')) {
    if (!profile.capabilities.nvsMacros) {
      return `NVS macro commands (m0..m15) are not supported on ${profile.label}.`;
    }
    const match = lower.match(/^macro\s+(?:define|run)\s+m(\d+)\b/);
    if (!match) {
      return 'Macro slot must be m0..m15.';
    }
    const slot = Number(match[1]);
    if (slot < 0 || slot >= profile.capabilities.maxNvsMacros) {
      return `Macro slot m${slot} is out of range (m0..m${profile.capabilities.maxNvsMacros - 1}).`;
    }
    return null;
  }

  return null;
}

export function validateCommandForProfile(
  rawInput: string,
  profile: DeviceProfile
): CommandValidationResult {
  const trimmed = rawInput.trim();
  const payloadBytes = textEncoder.encode(trimmed).length;

  if (trimmed.length === 0) {
    return {
      valid: false,
      commands: [],
      payloadBytes: 0,
      error: 'Command cannot be empty.',
    };
  }

  if (payloadBytes > profile.maxPayloadBytes) {
    return {
      valid: false,
      commands: [],
      payloadBytes,
      error: `Payload (${payloadBytes} B) exceeds ${profile.label} limit (${profile.maxPayloadBytes} B).`,
    };
  }

  const commands = splitCommandChain(trimmed);
  if (commands.length > 1 && !profile.capabilities.commandChaining) {
    return {
      valid: false,
      commands,
      payloadBytes,
      error: `Command chaining is not supported on ${profile.label}.`,
    };
  }

  for (const cmd of commands) {
    const err = validateSingleCommand(cmd, profile);
    if (err) {
      return {
        valid: false,
        commands,
        payloadBytes,
        error: err,
      };
    }
  }

  return {
    valid: true,
    commands,
    payloadBytes,
  };
}
