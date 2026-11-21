import { Activity, AppWindow, Lock, Monitor, Vibrate } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';

export function SecurityPanel() {
  const { sendQuickCommand, sendFramedCommand } = useCommandQueue();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">
          Security, Jiggler and Haptics
        </h2>
        <p className="font-mono text-xs text-zinc-500">
          System shortcuts (0x31..0x35) and framed jiggler controls
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_LOCK_WORKSTATION)}
          className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:border-zinc-600"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Lock className="h-4 w-4" />
            Lock Workstation (Win+L)
          </span>
          <span className="font-mono text-xs text-zinc-500">0x31</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_JIGGLER_TOGGLE)}
          className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:border-zinc-600"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Activity className="h-4 w-4" />
            Toggle Mouse Jiggler
          </span>
          <span className="font-mono text-xs text-zinc-500">0x32</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_TASK_MANAGER)}
          className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:border-zinc-600"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <AppWindow className="h-4 w-4" />
            Task Manager (Ctrl+Shift+Esc)
          </span>
          <span className="font-mono text-xs text-zinc-500">0x33</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_SHOW_DESKTOP)}
          className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:border-zinc-600"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Monitor className="h-4 w-4" />
            Show Desktop (Win+D)
          </span>
          <span className="font-mono text-xs text-zinc-500">0x34</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_VIBRATE_PULSE)}
          className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-4 py-4 text-left hover:border-zinc-600"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Vibrate className="h-4 w-4" />
            Pulse Vibration Motor (100 ms)
          </span>
          <span className="font-mono text-xs text-zinc-500">0x35</span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void sendFramedCommand('jiggler on')}
            className="flex-1 border border-zinc-800 bg-zinc-900 px-3 py-4 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
          >
            jiggler on
          </button>
          <button
            type="button"
            onClick={() => void sendFramedCommand('jiggler off')}
            className="flex-1 border border-zinc-800 bg-zinc-900 px-3 py-4 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
          >
            jiggler off
          </button>
        </div>
      </div>
    </section>
  );
}
