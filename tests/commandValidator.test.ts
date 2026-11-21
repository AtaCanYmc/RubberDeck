import { describe, expect, it } from 'vitest';
import {
  DEVICE_PROFILES,
  splitCommandChain,
  validateCommandForProfile,
} from '../src/protocol';

describe('CommandValidator and Profile Capabilities', () => {
  it('splits && and ; chains while preserving quoted strings and macro braces', () => {
    const chain =
      'type "a && b; c" && delay 100; macro define m0 { type "x"; enter } && macro run m0';
    expect(splitCommandChain(chain)).toEqual([
      'type "a && b; c"',
      'delay 100',
      'macro define m0 { type "x"; enter }',
      'macro run m0',
    ]);
  });

  it('blocks RubberOrca-only commands on RubberOtter profile', () => {
    const otter = DEVICE_PROFILES.rubberotter;
    expect(validateCommandForProfile('layout tr_q', otter).valid).toBe(false);
    expect(validateCommandForProfile('ble name "Otter"', otter).valid).toBe(false);
    expect(validateCommandForProfile('ble passkey 123456', otter).valid).toBe(false);
    expect(validateCommandForProfile('macro define m0 { enter }', otter).valid).toBe(
      false
    );
    expect(validateCommandForProfile('jiggler toggle && vibrate 100', otter).valid).toBe(
      true
    );
  });

  it('allows RubberOrca-specific commands and validates bounds', () => {
    const orca = DEVICE_PROFILES.rubberorca;
    expect(validateCommandForProfile('layout tr_q', orca).valid).toBe(true);
    expect(validateCommandForProfile('ble name "OrcaDeck"', orca).valid).toBe(true);
    expect(validateCommandForProfile('ble passkey 654321', orca).valid).toBe(true);
    expect(validateCommandForProfile('ble passkey off', orca).valid).toBe(true);
    expect(validateCommandForProfile('ble passkey 012345', orca).valid).toBe(false);
    expect(validateCommandForProfile('macro define m15 { enter }', orca).valid).toBe(
      true
    );
    expect(validateCommandForProfile('macro run m16', orca).valid).toBe(false);
  });
});
