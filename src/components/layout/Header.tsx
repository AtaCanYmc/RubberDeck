import { Bluetooth, Cable, Cpu, PlugZap, Unplug } from 'lucide-react';
import { DEVICE_PROFILES, type DeviceProfileId } from '../../protocol';
import type { TransportKind } from '../../transport';
import { useDeviceConnection } from '../../hooks/useDeviceConnection';
import { selectActiveProfile, useDeckStore } from '../../store/useDeckStore';

const TRANSPORT_LABELS: Record<TransportKind, string> = {
  'capacitor-ble': 'Native BLE',
  'web-bluetooth': 'Web BLE',
  'web-serial': 'USB CDC',
  mock: 'Mock',
};

export function Header() {
  const profile = useDeckStore(selectActiveProfile);
  const setProfileId = useDeckStore((s) => s.setProfileId);
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

  const statusColor =
    connectionState === 'connected'
      ? 'bg-emerald-500'
      : connectionState === 'connecting' || connectionState === 'scanning'
        ? 'bg-amber-400'
        : connectionState === 'error'
          ? 'bg-red-500'
          : 'bg-zinc-600';

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-zinc-700 bg-zinc-900">
            <Cpu className="h-4 w-4 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-50">
                RubberDeck
              </h1>
              <span className="border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                v1
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
              <span>
                {isConnected && connectedDevice
                  ? `${connectedDevice.name} (${profile.maxPayloadBytes} B max)`
                  : `${connectionState.toUpperCase()} / ${profile.maxPayloadBytes} B max`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex border border-zinc-800 bg-zinc-900 p-0.5"
            role="group"
            aria-label="Device Profile"
          >
            {(Object.keys(DEVICE_PROFILES) as DeviceProfileId[]).map((id) => {
              const active = profile.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProfileId(id)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {DEVICE_PROFILES[id].label}
                </button>
              );
            })}
          </div>

          <label className="sr-only" htmlFor="transport-select">
            Transport
          </label>
          <select
            id="transport-select"
            value={transportKind}
            disabled={isConnected}
            onChange={(e) => setTransportKind(e.target.value as TransportKind)}
            className="border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-200 disabled:opacity-50"
          >
            {availableTransports.map((kind) => (
              <option key={kind} value={kind}>
                {TRANSPORT_LABELS[kind]}
              </option>
            ))}
          </select>

          {isConnected ? (
            <button
              type="button"
              onClick={() => void disconnect()}
              className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800"
            >
              <Unplug className="h-3.5 w-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void connect()}
              className="inline-flex items-center gap-1.5 border border-zinc-100 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200"
            >
              {transportKind === 'web-serial' ? (
                <Cable className="h-3.5 w-3.5" />
              ) : transportKind === 'mock' ? (
                <PlugZap className="h-3.5 w-3.5" />
              ) : (
                <Bluetooth className="h-3.5 w-3.5" />
              )}
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
