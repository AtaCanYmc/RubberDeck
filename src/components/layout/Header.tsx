import { Bluetooth, Cable, Moon, PlugZap, Radio, Sun, Unplug } from 'lucide-react';
import { DEVICE_PROFILES, type DeviceProfileId } from '../../protocol';
import type { TransportKind } from '../../transport';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { useDeviceConnection } from '../../hooks/useDeviceConnection';
import { triggerHaptic } from '../../services/haptics';
import { selectActiveProfile, useDeckStore } from '../../store/useDeckStore';
import { StatusLed, type LedTone } from '../ui/StatusLed';

const TRANSPORT_SHORT: Record<TransportKind, string> = {
  'capacitor-ble': 'BLE',
  'web-bluetooth': 'BLE',
  'web-serial': 'SERIAL',
  mock: 'MOCK',
};

const TRANSPORT_LABELS: Record<TransportKind, string> = {
  'capacitor-ble': 'Native BLE',
  'web-bluetooth': 'Web BLE',
  'web-serial': 'USB CDC',
  mock: 'Mock',
};

export function Header() {
  const profile = useDeckStore(selectActiveProfile);
  const setProfileId = useDeckStore((s) => s.setProfileId);
  const hapticsEnabled = useDeckStore((s) => s.hapticsEnabled);
  const theme = useDeckStore((s) => s.theme);
  const toggleTheme = useDeckStore((s) => s.toggleTheme);
  const lastTxId = useDeckStore((s) => {
    for (let i = s.logs.length - 1; i >= 0; i -= 1) {
      if (s.logs[i].direction === 'tx') return s.logs[i].id;
    }
    return 0;
  });

  const { isBusy } = useCommandQueue();
  const {
    transportKind,
    availableTransports,
    connectionState,
    connectedDevice,
    isConnected,
    setTransportKind,
    connect,
    disconnect,
  } = useDeviceConnection();

  const ledTone: LedTone =
    connectionState === 'connected'
      ? transportKind === 'mock'
        ? 'amber'
        : 'green'
      : connectionState === 'connecting' || connectionState === 'scanning'
        ? 'amber'
        : connectionState === 'error'
          ? 'red'
          : 'off';

  const ledPulse =
    connectionState === 'connecting' ||
    connectionState === 'scanning' ||
    (isConnected && isBusy);

  const handleProfileSwitch = (id: DeviceProfileId) => {
    if (id === profile.id) return;
    void triggerHaptic(hapticsEnabled);
    setProfileId(id);
  };

  const handleToggleConnection = () => {
    void triggerHaptic(hapticsEnabled);
    if (isConnected) {
      void disconnect();
    } else {
      void connect();
    }
  };

  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-white/[0.08] bg-[#09090B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        {/* Left: Wordmark + Active Profile Switcher */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-[#141418] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#FF5500]" />
            </span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                RubberDeck
              </h1>
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:inline">
                v1 · {profile.maxPayloadBytes}B
              </span>
            </div>
          </div>

          <div
            className="hidden items-center rounded-lg border border-white/[0.08] bg-[#121215] p-0.5 sm:inline-flex"
            role="group"
            aria-label="Device Profile"
          >
            {(Object.keys(DEVICE_PROFILES) as DeviceProfileId[]).map((id) => {
              const active = profile.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleProfileSwitch(id)}
                  className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-all active:scale-[0.97] ${
                    active
                      ? 'bg-[#202025] text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {DEVICE_PROFILES[id].label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: TX Telemetry + Interactive Connection Pill */}
        <div className="flex items-center gap-2">
          {/* Live TX / Queue Activity Indicator */}
          <div
            className="hidden items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#121215] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500 lg:flex"
            title={isBusy ? 'Transmitting framed packet' : 'Command queue idle'}
          >
            <Radio
              className={`h-3 w-3 transition-colors ${
                isBusy ? 'text-[#FF5500]' : 'text-zinc-600'
              }`}
            />
            <span className="tabular-nums">
              {isBusy ? 'TX BUSY' : lastTxId > 0 ? `TX #${lastTxId}` : 'TX IDLE'}
            </span>
          </div>

          {/* Connection Pill */}
          <div className="flex items-center rounded-full border border-white/[0.1] bg-[#121215] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <label className="sr-only" htmlFor="transport-select">
              Transport
            </label>
            <select
              id="transport-select"
              name="transport"
              value={transportKind}
              disabled={isConnected}
              onChange={(e) => setTransportKind(e.target.value as TransportKind)}
              className="hw-select min-w-[6.75rem] rounded-l-full bg-transparent py-1 pl-2.5 pr-1.5 font-mono text-[11px] font-medium text-zinc-300 focus:outline-none disabled:opacity-60"
            >
              {availableTransports.map((kind) => (
                <option key={kind} value={kind} className="bg-[#121215] text-zinc-100">
                  {TRANSPORT_LABELS[kind]}
                </option>
              ))}
            </select>

            <span className="mx-1 h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />

            <button
              type="button"
              onClick={handleToggleConnection}
              className={`inline-flex select-none items-center gap-2 rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-all active:scale-[0.97] ${
                isConnected
                  ? 'bg-emerald-500/12 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-[#FF5500] text-[#09090B] hover:bg-[#ff6a1f]'
              }`}
            >
              <StatusLed
                tone={ledTone}
                pulse={ledPulse}
                label={`Connection ${connectionState}`}
              />
              {isConnected ? (
                <>
                  <span className="max-w-[96px] truncate">
                    {connectedDevice ? connectedDevice.name : TRANSPORT_SHORT[transportKind]}
                  </span>
                  <Unplug className="h-3 w-3 opacity-80" />
                </>
              ) : (
                <>
                  {transportKind === 'web-serial' ? (
                    <Cable className="h-3 w-3" />
                  ) : transportKind === 'mock' ? (
                    <PlugZap className="h-3 w-3" />
                  ) : (
                    <Bluetooth className="h-3 w-3" />
                  )}
                  <span>Connect</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                void triggerHaptic(hapticsEnabled);
                toggleTheme();
              }}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#121215] text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Profile Switcher Row */}
      <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-1.5 sm:hidden">
        <div
          className="inline-flex rounded-md border border-white/[0.08] bg-[#121215] p-0.5"
          role="group"
          aria-label="Device Profile Mobile"
        >
          {(Object.keys(DEVICE_PROFILES) as DeviceProfileId[]).map((id) => {
            const active = profile.id === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => handleProfileSwitch(id)}
                className={`rounded px-2 py-0.5 font-mono text-[10px] font-medium transition-colors ${
                  active ? 'bg-[#202025] text-zinc-100' : 'text-zinc-500'
                }`}
              >
                {DEVICE_PROFILES[id].label}
              </button>
            );
          })}
        </div>

        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 tabular-nums">
          {isBusy ? 'TX BUSY' : `${profile.maxPayloadBytes} B MAX`}
        </span>
      </div>
    </header>
  );
}
