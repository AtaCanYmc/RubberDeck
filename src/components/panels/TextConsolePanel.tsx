import { useState, type FormEvent } from 'react';
import { Send, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { validateCommandForProfile } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { useDeckStore } from '../../store/useDeckStore';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';
import { StatusLed } from '../ui/StatusLed';
import { TactileButton } from '../ui/TactileButton';

const QUICK_TOKENS = [
  'type "hello" && enter',
  'delay 250',
  'press gui 50',
  'jiggler toggle',
] as const;

export function TextConsolePanel() {
  const [command, setCommand] = useState('type "hello" && enter');
  const { isBusy, profile, sendFramedCommand } = useCommandQueue();
  const logs = useDeckStore((s) => s.logs);
  const clearLogs = useDeckStore((s) => s.clearLogs);

  const validation = validateCommandForProfile(command, profile);
  const byteRatio = Math.min(
    100,
    Math.round((validation.payloadBytes / profile.maxPayloadBytes) * 100)
  );
  const overLimit = validation.payloadBytes > profile.maxPayloadBytes;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validation.valid || isBusy) {
      return;
    }
    await sendFramedCommand(command);
  };

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="05 // WIRE TERMINAL"
        title="Framed Command Console"
        subtitle={`Chaining via && and ; · Active limit ${profile.maxPayloadBytes} B (${profile.label})`}
        rightSlot={
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#121215] px-2.5 py-1 font-mono text-[11px] tabular-nums">
            <StatusLed tone={isBusy ? 'signal' : 'green'} pulse={isBusy} />
            <span className={overLimit ? 'text-red-400' : 'text-zinc-300'}>
              {validation.payloadBytes} / {profile.maxPayloadBytes} B
            </span>
          </div>
        }
      />

      {/* Command Composer */}
      <HardwareCard className="p-4">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Presets
            </span>
            {QUICK_TOKENS.map((snippet) => (
              <button
                key={snippet}
                type="button"
                onClick={() => setCommand(snippet)}
                className="rounded-md border border-white/[0.08] bg-[#18181B] px-2 py-1 font-mono text-[10px] text-zinc-400 transition-colors hover:border-white/[0.16] hover:text-zinc-100 active:scale-[0.97]"
              >
                {snippet}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-white/[0.09] bg-[#09090B] focus-within:border-[#FF5500]/60">
            <textarea
              rows={3}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder='type "hello" && delay 150 && enter'
              className="block w-full resize-none bg-transparent p-3 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="h-1 w-full bg-zinc-900">
              <div
                className={`h-full transition-[width] duration-150 ${
                  overLimit ? 'bg-red-500' : 'bg-[#FF5500]'
                }`}
                style={{ width: `${byteRatio}%` }}
              />
            </div>
          </div>

          {!validation.valid && command.trim().length > 0 && (
            <p className="rounded-lg border border-red-500/30 bg-red-950/35 px-3 py-2 font-mono text-xs text-red-300">
              {validation.error}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <TactileButton variant="ghost" onClick={clearLogs}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear Log
            </TactileButton>

            <TactileButton
              type="submit"
              variant="signal"
              disabled={!validation.valid || isBusy}
            >
              <Send className="h-3.5 w-3.5" />
              {isBusy ? 'Transmitting...' : 'Send Framed Packet'}
            </TactileButton>
          </div>
        </form>
      </HardwareCard>

      {/* Transmission Log */}
      <HardwareCard className="overflow-hidden bg-[#0A0A0D]">
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#121215] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
          <span className="inline-flex items-center gap-2">
            <TerminalIcon className="h-3.5 w-3.5 text-zinc-400" />
            TX / RX Wire Log
          </span>
          <span className="tabular-nums">{logs.length} ENTRIES</span>
        </div>

        <div className="h-64 overflow-y-auto p-3.5 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-zinc-600">
              // Queue idle. Connect a transport and dispatch a frame to inspect traffic.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {logs.map((entry) => {
                const badgeClass =
                  entry.direction === 'tx'
                    ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30'
                    : entry.direction === 'rx'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : entry.direction === 'error'
                        ? 'bg-red-500/15 text-red-300 border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-white/[0.08]';

                const textClass =
                  entry.direction === 'error'
                    ? 'text-red-300'
                    : entry.direction === 'rx'
                      ? 'text-emerald-200'
                      : entry.direction === 'tx'
                        ? 'text-zinc-100'
                        : 'text-zinc-400';

                return (
                  <li key={entry.id} className="flex items-start gap-2.5">
                    <span className="shrink-0 text-[11px] text-zinc-600 tabular-nums">
                      {entry.timestamp}
                    </span>
                    <span
                      className={`inline-flex w-10 shrink-0 justify-center rounded border px-1 py-0.5 text-[9px] font-semibold uppercase ${badgeClass}`}
                    >
                      {entry.direction}
                    </span>
                    <span className={`break-all leading-relaxed ${textClass}`}>
                      {entry.message}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </HardwareCard>
    </section>
  );
}
