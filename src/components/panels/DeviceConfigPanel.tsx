import { useState } from 'react';
import { Bluetooth, Check, KeyRound, Keyboard } from 'lucide-react';
import type { KeyboardLayout } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';
import { TactileButton } from '../ui/TactileButton';

export function DeviceConfigPanel() {
  const { isBusy, profile, sendFramedCommand } = useCommandQueue();
  const [layout, setLayout] = useState<KeyboardLayout>('us');
  const [bleName, setBleName] = useState('RubberOrca');
  const [passkey, setPasskey] = useState('');

  if (!profile.capabilities.bleNameConfig && !profile.capabilities.blePasskeyConfig) {
    return (
      <section className="space-y-4">
        <SectionLabel
          kicker="07 // HARDWARE NVS"
          title="Device Configuration"
          subtitle="ESP32-S3 persistent hardware parameters"
        />
        <HardwareCard className="p-4 font-mono text-xs text-zinc-500">
          Hardware configuration commands (layout, ble name, ble passkey) require the
          RubberOrca profile.
        </HardwareCard>
      </section>
    );
  }

  const isPasskeyValid =
    passkey.trim().toLowerCase() === 'off' ||
    (/^\d{6}$/.test(passkey.trim()) &&
      Number(passkey.trim()) >= 100000 &&
      Number(passkey.trim()) <= 999999);

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="07 // HARDWARE NVS"
        title="RubberOrca Configuration"
        subtitle="Persisted in ESP32-S3 Non-Volatile Storage across reboots"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Keyboard Layout Card */}
        <HardwareCard className="flex flex-col justify-between gap-4 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <Keyboard className="h-3.5 w-3.5 text-[#FF5500]" />
              USB HID Keymap
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">Keyboard Layout</h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Active keycode table for UTF-8 typing
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {profile.capabilities.keyboardLayouts.map((item) => {
                const active = layout === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setLayout(item)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 font-mono text-xs transition-all active:scale-[0.97] ${
                      active
                        ? 'border-[#FF5500]/60 bg-[#FF5500]/12 text-zinc-50'
                        : 'border-white/[0.08] bg-[#18181B] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{item === 'us' ? 'US (us)' : 'TR-Q (tr_q)'}</span>
                    {active && <Check className="h-3.5 w-3.5 text-[#FF5500]" />}
                  </button>
                );
              })}
            </div>

            <TactileButton
              variant="default"
              disabled={isBusy}
              onClick={() => void sendFramedCommand(`layout ${layout}`)}
              className="w-full"
            >
              Apply Layout ({layout})
            </TactileButton>
          </div>
        </HardwareCard>

        {/* BLE Name Card */}
        <HardwareCard className="flex flex-col justify-between gap-4 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <Bluetooth className="h-3.5 w-3.5 text-[#FF5500]" />
              GATT Identity
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              BLE Advertising Name
            </h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Up to 24 ASCII characters broadcast on 0xFFE0
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              maxLength={24}
              value={bleName}
              onChange={(e) => setBleName(e.target.value)}
              className="w-full rounded-lg border border-white/[0.09] bg-[#09090B] px-3 py-2.5 font-mono text-xs text-zinc-100 focus:border-[#FF5500]/60 focus:outline-none"
            />
            <TactileButton
              variant="signal"
              disabled={isBusy || bleName.trim().length === 0}
              onClick={() =>
                void sendFramedCommand(`ble name "${bleName.trim().replace(/"/g, '')}"`)
              }
              className="w-full"
            >
              Write BLE Name
            </TactileButton>
          </div>
        </HardwareCard>

        {/* BLE Passkey Card (Full Width) */}
        <HardwareCard className="space-y-4 p-4 md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <KeyRound className="h-3.5 w-3.5 text-[#FF5500]" />
                Link-Layer Security
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                BLE Bonding Passkey
              </h3>
              <p className="font-mono text-[11px] text-zinc-500">
                Static 6-digit PIN (100000..999999) or &quot;off&quot; to disable bonding
              </p>
            </div>

            {passkey.trim().length > 0 && (
              <span
                className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase ${
                  isPasskeyValid
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                {isPasskeyValid ? 'VALID' : 'INVALID FORMAT'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <input
              type="text"
              placeholder="123456 or off"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="min-w-[180px] flex-1 rounded-lg border border-white/[0.09] bg-[#09090B] px-3 py-2.5 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#FF5500]/60 focus:outline-none"
            />
            <TactileButton
              variant="signal"
              disabled={isBusy || !isPasskeyValid}
              onClick={() =>
                void sendFramedCommand(`ble passkey ${passkey.trim().toLowerCase()}`)
              }
            >
              Set Passkey
            </TactileButton>
            <TactileButton
              variant="ghost"
              disabled={isBusy}
              onClick={() => void sendFramedCommand('ble passkey off')}
            >
              Disable Bonding
            </TactileButton>
          </div>
        </HardwareCard>
      </div>
    </section>
  );
}
