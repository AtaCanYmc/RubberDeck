import { useState } from 'react';
import type { KeyboardLayout } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';

export function DeviceConfigPanel() {
  const { isBusy, profile, sendFramedCommand } = useCommandQueue();
  const [layout, setLayout] = useState<KeyboardLayout>('us');
  const [bleName, setBleName] = useState('RubberOrca');
  const [passkey, setPasskey] = useState('');

  if (!profile.capabilities.bleNameConfig && !profile.capabilities.blePasskeyConfig) {
    return (
      <section className="border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs text-zinc-500">
        Hardware configuration commands (layout, ble name, ble passkey) require the
        RubberOrca profile.
      </section>
    );
  }

  const isPasskeyValid =
    passkey.trim().toLowerCase() === 'off' ||
    (/^\d{6}$/.test(passkey.trim()) &&
      Number(passkey.trim()) >= 100000 &&
      Number(passkey.trim()) <= 999999);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">
          RubberOrca Device Configuration
        </h2>
        <p className="font-mono text-xs text-zinc-500">
          Persisted in ESP32-S3 NVS across reboots
        </p>
      </div>

      <div className="space-y-3 border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="text-xs font-semibold text-zinc-200">
          USB HID Keyboard Layout
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {profile.capabilities.keyboardLayouts.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLayout(item)}
              className={`border px-3 py-1.5 font-mono text-xs ${
                layout === item
                  ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300'
              }`}
            >
              {item === 'us' ? 'US (us)' : 'Turkish Q (tr_q)'}
            </button>
          ))}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void sendFramedCommand(`layout ${layout}`)}
            className="border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"
          >
            Apply Layout
          </button>
        </div>
      </div>

      <div className="space-y-3 border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="text-xs font-semibold text-zinc-200">
          BLE Advertising Name
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            maxLength={24}
            value={bleName}
            onChange={(e) => setBleName(e.target.value)}
            className="flex-1 border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={isBusy || bleName.trim().length === 0}
            onClick={() =>
              void sendFramedCommand(`ble name "${bleName.trim().replace(/"/g, '')}"`)
            }
            className="border border-zinc-100 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            Set Name
          </button>
        </div>
      </div>

      <div className="space-y-3 border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="text-xs font-semibold text-zinc-200">
          BLE Bonding Passkey
        </h3>
        <p className="font-mono text-[11px] text-zinc-500">
          6-digit static passkey (100000..999999) or &quot;off&quot;
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="123456 or off"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="flex-1 border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={isBusy || !isPasskeyValid}
            onClick={() =>
              void sendFramedCommand(`ble passkey ${passkey.trim().toLowerCase()}`)
            }
            className="border border-zinc-100 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            Set Passkey
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void sendFramedCommand('ble passkey off')}
            className="border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
          >
            Disable
          </button>
        </div>
      </div>
    </section>
  );
}
