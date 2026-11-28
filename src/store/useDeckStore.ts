import { create } from 'zustand';
import {
  DEVICE_PROFILES,
  type DeviceProfile,
  type DeviceProfileId,
} from '../protocol';
import type {
  ConnectionState,
  TransportDevice,
  TransportKind,
} from '../transport';

export type LogDirection = 'tx' | 'rx' | 'info' | 'error';

export interface ConsoleLogEntry {
  readonly id: number;
  readonly timestamp: string;
  readonly direction: LogDirection;
  readonly message: string;
}

export type ActiveTab =
  | 'trackpad'
  | 'media'
  | 'presentation'
  | 'security'
  | 'console'
  | 'macros'
  | 'device'
  | 'firmware';

export type ThemeMode = 'dark' | 'light';

interface DeckState {
  profileId: DeviceProfileId;
  activeTab: ActiveTab;
  transportKind: TransportKind;
  connectionState: ConnectionState;
  connectedDevice: TransportDevice | null;
  lastError: string | null;
  hapticsEnabled: boolean;
  trackpadSensitivity: number;
  theme: ThemeMode;
  logs: readonly ConsoleLogEntry[];

  setProfileId: (id: DeviceProfileId) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTransportKind: (kind: TransportKind) => void;
  setConnectionState: (state: ConnectionState, error?: string | null) => void;
  setConnectedDevice: (device: TransportDevice | null) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setTrackpadSensitivity: (value: number) => void;
  toggleTheme: () => void;
  appendLog: (direction: LogDirection, message: string) => void;
  clearLogs: () => void;
}

let logSeq = 0;

function nowTime(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export const useDeckStore = create<DeckState>((set) => ({
  profileId: 'rubberorca',
  activeTab: 'trackpad',
  transportKind: 'web-bluetooth',
  connectionState: 'disconnected',
  connectedDevice: null,
  lastError: null,
  hapticsEnabled: true,
  trackpadSensitivity: 1.4,
  theme:
    typeof window !== 'undefined' && window.localStorage.getItem('rubberdeck-theme') === 'light'
      ? 'light'
      : 'dark',
  logs: [],

  setProfileId: (profileId) =>
    set((state) => {
      const profile = DEVICE_PROFILES[profileId];
      // If user switches away from RubberOrca while on the Device Config tab, return to Trackpad.
      const nextTab =
        state.activeTab === 'device' && !profile.capabilities.bleNameConfig
          ? 'trackpad'
          : state.activeTab;
      return { profileId, activeTab: nextTab };
    }),

  setActiveTab: (activeTab) => set({ activeTab }),
  setTransportKind: (transportKind) => set({ transportKind }),
  setConnectionState: (connectionState, error = null) =>
    set({ connectionState, lastError: error }),
  setConnectedDevice: (connectedDevice) => set({ connectedDevice }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setTrackpadSensitivity: (trackpadSensitivity) => set({ trackpadSensitivity }),
  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rubberdeck-theme', next);
      }
      return { theme: next };
    }),

  appendLog: (direction, message) =>
    set((state) => {
      logSeq += 1;
      const entry: ConsoleLogEntry = {
        id: logSeq,
        timestamp: nowTime(),
        direction,
        message,
      };
      const nextLogs = [...state.logs.slice(-199), entry];
      return { logs: nextLogs };
    }),

  clearLogs: () => set({ logs: [] }),
}));

export function selectActiveProfile(state: DeckState): DeviceProfile {
  return DEVICE_PROFILES[state.profileId];
}
