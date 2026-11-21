import { useState } from 'react';
import { Play, Save } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';

export function MacroPanel() {
  const { isBusy, profile, sendFramedCommand, sendQuickCommand } = useCommandQueue();
  const [slot, setSlot] = useState(0);
  const [body, setBody] = useState('type "status" && enter');

  const slots = Array.from({ length: profile.capabilities.maxNvsMacros }, (_, i) => i);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Macros</h2>
        <p className="font-mono text-xs text-zinc-500">
          Quick macro triggers and hardware NVS macro slots
        </p>
      </div>

      <div className="border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-zinc-200">
              Standard Quick Macro (0x41)
            </h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Supported on both RubberOtter and RubberOrca
            </p>
          </div>
          <button
            type="button"
            onClick={() => void sendQuickCommand(QUICK_CMD.GAME_CS_BUY)}
            className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-100 hover:bg-zinc-800"
          >
            <Play className="h-3.5 w-3.5" />
            Trigger 0x41
          </button>
        </div>
      </div>

      {profile.capabilities.nvsMacros ? (
        <div className="space-y-4 border border-zinc-800 bg-zinc-900/50 p-4">
          <div>
            <h3 className="text-xs font-semibold text-zinc-100">
              ESP32 NVS Macro Slots (m0..m{profile.capabilities.maxNvsMacros - 1})
            </h3>
            <p className="font-mono text-[11px] text-zinc-500">
              Persisted in RubberOrca flash storage
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {slots.map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlot(index)}
                className={`border py-1.5 font-mono text-xs ${
                  slot === index
                    ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                m{index}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="nvs-macro-body"
              className="block font-mono text-xs text-zinc-400"
            >
              macro define m{slot} {'{ ... }'}
            </label>
            <textarea
              id="nvs-macro-body"
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy || body.trim().length === 0}
              onClick={() =>
                void sendFramedCommand(`macro define m${slot} { ${body.trim()} }`)
              }
              className="inline-flex items-center gap-1.5 border border-zinc-100 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              Save m{slot}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void sendFramedCommand(`macro run m${slot}`)}
              className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" />
              Run m{slot}
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/30 p-4 font-mono text-xs text-zinc-500">
          NVS macro slots (m0..m15) are only available on the RubberOrca profile.
        </div>
      )}
    </section>
  );
}
