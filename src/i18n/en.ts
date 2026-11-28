export const en = {
  connect: 'Connect',
  disconnect: 'Disconnect',
  txBusy: 'TX BUSY',
  themeToLight: 'Switch to light mode',
  themeToDark: 'Switch to dark mode',
  language: 'Language',
  tabs: {
    trackpad: 'Trackpad',
    media: 'Media',
    presentation: 'Slides',
    security: 'Security',
    console: 'Console',
    macros: 'Macros',
    device: 'Device',
    firmware: 'Firmware',
  },
} as const;

export type Messages = {
  readonly connect: string;
  readonly disconnect: string;
  readonly txBusy: string;
  readonly themeToLight: string;
  readonly themeToDark: string;
  readonly language: string;
  readonly tabs: {
    readonly trackpad: string;
    readonly media: string;
    readonly presentation: string;
    readonly security: string;
    readonly console: string;
    readonly macros: string;
    readonly device: string;
    readonly firmware: string;
  };
};
