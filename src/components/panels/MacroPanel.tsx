import { useState } from 'react';
import { Play, Save, Zap } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { triggerHaptic } from '../../services/haptics';
import { useDeckStore } from '../../store/useDeckStore';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';
import { StatusLed } from '../ui/StatusLed';
import { TactileButton } from '../ui/TactileButton';

export function MacroPanel() {
  const { isBusy, profile, sendFramedCommand, sendQuickCommand } = useCommandQueue();
  const hapticsEnabled = useDeckStore((s) => s.hapticsEnabled);
  const [slot, setSlot] = useState(0);
  const [body, setBody] = useState('type "status" && enter');

  const slots = Array.from({ length: profile.capabilities.maxNvsMacros }, (_, i) => i);

  const selectSlot = (index: number) => {
    void triggerHaptic(hapticsEnabled);
    setSlot(index);
  };

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="06 // MACRO DECK"
        title="Programmable Keycaps & NVS Slots"
        subtitle="Single-byte quick trigger and persistent ESP32-S3 NVS banks"
      />

      {/* Quick Macro Pad */}
      <HardwareCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-[#18181B] text-[#FF5500] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">
                Standard Quick Macro
              </h3>
              <p className="font-mono text-[11px] text-zinc-500">
                Code 0x41 · Supported on RubberOtter &amp; RubberOrca
              </p>
            </div>
          </div>

          <TactileButton
            variant="default"
            onClick={() => void sendQuickCommand(QUICK_CMD.GAME_CS_BUY)}
            className="font-mono"
          >
            <Play className="h-3.5 w-3.5 text-[#FF5500]" />
            Trigger 0x41
          </TactileButton>
        </div>
      </HardwareCard>

      {profile.capabilities.nvsMacros ? (
        <HardwareCard className="space-y-5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">
                ESP32 NVS Macro Bank (m0..m{profile.capabilities.maxNvsMacros - 1})
              </h3>
              <p className="font-mono text-[11px] text-zinc-500">
                Select a backlit pad to edit or execute from flash
              </p>
            </div>
            <span className="rounded-md border border-[#FF5500]/30 bg-[#FF5500]/10 px-2 py-0.5 font-mono text-[11px] font-medium text-[#FF5500]">
              SLOT M{String(slot).padStart(2, '0')}
            </span>
          </div>

          {/* Stream-Deck Style Tactile Keycap Grid */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {slots.map((index) => {
              const active = slot === index;
              return (
                <button
                  key={index}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectSlot(index)}
                  className={`relative flex h-16 select-none flex-col items-start justify-between rounded-xl p-2.5 font-mono transition-all active:scale-[0.96] ${
                    active
                      ? 'border border-[#FF5500]/65 bg-[#1C1714] text-zinc-50 shadow-[inset_0_1px_0_rgba(255,140,80,0.2),0_0_14px_-4px_rgba(255,85,0,0.45)]'
                      : 'hw-keycap text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-[9px] tracking-widest text-zinc-500">
                      {String(index).padStart(2, '0')}
                    </span>
                    <StatusLed tone={active ? 'signal' : 'off'} size="sm" />
                  </div>
                  <span className="text-xs font-semibold tracking-tight">m{index}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Slot Editor */}
          <div className="space-y-3 border-t border-white/[0.07] pt-4">
            <label
              htmlFor="nvs-macro-body"
              className="block font-mono text-[11px] text-zinc-400"
            >
              macro define <span className="text-[#FF5500]">m{slot}</span> {'{ ... }'}
            </label>
            <textarea
              id="nvs-macro-body"
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="hw-textarea w-full rounded-lg border border-white/[0.09] bg-[#09090B] p-3 font-mono text-xs text-zinc-100 focus:border-[#FF5500]/60 focus:outline-none"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <TactileButton
                variant="signal"
                disabled={isBusy || body.trim().length === 0}
                onClick={() =>
                  void sendFramedCommand(`macro define m${slot} { ${body.trim()} }`)
                }
              >
                <Save className="h-3.5 w-3.5" />
                Save to m{slot}
              </TactileButton>
              <TactileButton
                variant="default"
                disabled={isBusy}
                onClick={() => void sendFramedCommand(`macro run m${slot}`)}
              >
                <Play className="h-3.5 w-3.5 text-[#FF5500]" />
                Run m{slot}
              </TactileButton>
            </div>
          </div>
        </HardwareCard>
      ) : (
        <HardwareCard className="p-4 font-mono text-xs text-zinc-500">
          NVS macro slots (m0..m15) require the RubberOrca profile. Switch profiles in the
          header telemetry bar to program persistent flash macros.
        </HardwareCard>
      )}
    </section>
  );
}
