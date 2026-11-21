export type DeviceProfileId = 'rubberotter' | 'rubberorca';

export type KeyboardLayout = 'us' | 'tr_q';

export interface DeviceCapabilities {
  readonly keyboard: boolean;
  readonly mouse: boolean;
  readonly media: boolean;
  readonly jiggler: boolean;
  readonly haptics: boolean;
  readonly singleByteShortcuts: boolean;
  readonly commandChaining: boolean;
  readonly nvsMacros: boolean;
  readonly maxNvsMacros: number;
  readonly keyboardLayouts: readonly KeyboardLayout[];
  readonly bleNameConfig: boolean;
  readonly blePasskeyConfig: boolean;
}

export interface DeviceProfile {
  readonly id: DeviceProfileId;
  readonly label: string;
  readonly mcu: string;
  readonly maxPayloadBytes: number;
  readonly flasherUrl: string;
  readonly repoUrl: string;
  readonly capabilities: DeviceCapabilities;
}

export const DEVICE_PROFILES: Record<DeviceProfileId, DeviceProfile> = {
  rubberotter: {
    id: 'rubberotter',
    label: 'RubberOtter',
    mcu: 'ATmega32U4 + HM-10 / ESP32',
    maxPayloadBytes: 384,
    flasherUrl: 'https://atacanymc.github.io/RubberOtter/',
    repoUrl: 'https://github.com/AtaCanYmc/RubberOtter',
    capabilities: {
      keyboard: true,
      mouse: true,
      media: true,
      jiggler: true,
      haptics: true,
      singleByteShortcuts: true,
      commandChaining: true,
      nvsMacros: false,
      maxNvsMacros: 0,
      keyboardLayouts: ['us'],
      bleNameConfig: false,
      blePasskeyConfig: false,
    },
  },
  rubberorca: {
    id: 'rubberorca',
    label: 'RubberOrca',
    mcu: 'ESP32-S3',
    maxPayloadBytes: 1024,
    flasherUrl: 'https://atacanymc.github.io/RubberOrca/',
    repoUrl: 'https://github.com/AtaCanYmc/RubberOrca',
    capabilities: {
      keyboard: true,
      mouse: true,
      media: true,
      jiggler: true,
      haptics: true,
      singleByteShortcuts: true,
      commandChaining: true,
      nvsMacros: true,
      maxNvsMacros: 16,
      keyboardLayouts: ['us', 'tr_q'],
      bleNameConfig: true,
      blePasskeyConfig: true,
    },
  },
};

export function getDeviceProfile(id: DeviceProfileId): DeviceProfile {
  return DEVICE_PROFILES[id];
}
