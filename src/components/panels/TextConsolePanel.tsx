import { useState, type FormEvent } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { validateCommandForProfile } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { useDeckStore } from '../../store/useDeckStore';

export function TextConsolePanel() {
  const [command, setCommand] = useState('type "hello" && enter');
  const { isBusy, profile, sendFramedCommand } = useCommandQueue();
  const logs = useDeckStore((s) => s.logs);
  const clearLogs = useDeckStore((s) => s.clearLogs);

  const validation = validateCommandForProfile(command, profile);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validation.valid || isBusy) {
      return;
    }
    await sendFramedCommand(command);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Framed Command Console
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            Supports && and ; chaining. Active limit: {profile.maxPayloadBytes} B (
            {profile.label})
          </p>
        </div>
        <span
          className={`font-mono text-xs ${
            validation.payloadBytes > profile.maxPayloadBytes
              ? 'text-red-400'
              : 'text-zinc-400'
          }`}
        >
          {validation.payloadBytes} / {profile.maxPayloadBytes} B
        </span>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
        <textarea
          rows={3}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder='type "hello" && delay 150 && enter'
          className="w-full border border-zinc-800 bg-zinc-900 p-3 font-mono text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
        />

        {!validation.valid && command.trim().length > 0 && (
          <p className="border border-red-900/80 bg-red-950/40 px-3 py-2 font-mono text-xs text-red-300">
            {validation.error}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={clearLogs}
            className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Log
          </button>

          <button
            type="submit"
            disabled={!validation.valid || isBusy}
            className="inline-flex items-center gap-1.5 border border-zinc-100 bg-zinc-100 px-4 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Send Framed Packet
          </button>
        </div>
      </form>

      <div className="h-64 overflow-y-auto border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-zinc-600">No packets logged yet.</p>
        ) : (
          <ul className="space-y-1">
            {logs.map((entry) => {
              const color =
                entry.direction === 'tx'
                  ? 'text-zinc-100'
                  : entry.direction === 'rx'
                    ? 'text-emerald-400'
                    : entry.direction === 'error'
                      ? 'text-red-400'
                      : 'text-zinc-500';
              return (
                <li key={entry.id} className="flex gap-2">
                  <span className="shrink-0 text-zinc-600">{entry.timestamp}</span>
                  <span className="w-9 shrink-0 uppercase text-zinc-500">
                    [{entry.direction}]
                  </span>
                  <span className={`break-all ${color}`}>{entry.message}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
