import { useEffect, useRef, useState } from 'react';
import { Activity, AppWindow, Lock, Monitor, ShieldAlert, Vibrate } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';
import { TactileButton } from '../ui/TactileButton';

const HOLD_MS = 550;

export function SecurityPanel() {
  const { sendQuickCommand, sendFramedCommand } = useCommandQueue();
  const [holdingLock, setHoldingLock] = useState(false);
  const [lockProgress, setLockProgress] = useState(0);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<number>(0);

  const cancelHold = () => {
    if (holdTimer.current !== null) {
      window.cancelAnimationFrame(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldingLock(false);
    setLockProgress(0);
  };

  useEffect(() => cancelHold, []);

  const startHold = () => {
    if (holdTimer.current !== null) return;
    setHoldingLock(true);
    holdStart.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - holdStart.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_MS) * 100));
      setLockProgress(pct);
      if (elapsed >= HOLD_MS) {
        cancelHold();
        void sendQuickCommand(QUICK_CMD.SEC_LOCK_WORKSTATION);
        return;
      }
      holdTimer.current = window.requestAnimationFrame(tick);
    };

    holdTimer.current = window.requestAnimationFrame(tick);
  };

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="04 // SYSTEM & SAFETY"
        title="Security, Jiggler & Haptics"
        subtitle="Protected host shortcuts (0x31..0x35) and framed jiggler state"
      />

      {/* Guarded Workstation Lock */}
      <HardwareCard variant="hazard" className="overflow-hidden">
        <div className="hazard-stripe flex items-center justify-between border-b border-amber-500/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300/90">
          <span className="inline-flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Protected Host Action
          </span>
          <span>0x31 · WIN+L</span>
        </div>

        <div className="p-4">
          <button
            type="button"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault();
                void sendQuickCommand(QUICK_CMD.SEC_LOCK_WORKSTATION);
              }
            }}
            className="relative flex w-full select-none items-center justify-between overflow-hidden rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-4 text-left transition-colors hover:border-amber-400/55 active:scale-[0.99]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 bg-amber-500/20 transition-[width] duration-75"
              style={{ width: `${lockProgress}%` }}
            />
            <span className="relative flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300">
                <Lock className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-amber-100">
                  Lock Workstation
                </span>
                <span className="block font-mono text-[11px] text-amber-300/75">
                  {holdingLock ? 'Keep holding to lock...' : 'Hold 0.5s to execute (or press Enter)'}
                </span>
              </span>
            </span>
            <span className="relative font-mono text-xs font-medium text-amber-300 tabular-nums">
              {holdingLock ? `${lockProgress}%` : 'HOLD'}
            </span>
          </button>
        </div>
      </HardwareCard>

      {/* System Utility Keycaps */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_TASK_MANAGER)}
          className="justify-between px-4 py-4 text-left"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <AppWindow className="h-4 w-4 text-zinc-400" />
            Task Manager (Ctrl+Shift+Esc)
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x33</span>
        </TactileButton>

        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_SHOW_DESKTOP)}
          className="justify-between px-4 py-4 text-left"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Monitor className="h-4 w-4 text-zinc-400" />
            Show Desktop (Win+D)
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x34</span>
        </TactileButton>

        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.SEC_VIBRATE_PULSE)}
          className="justify-between px-4 py-4 text-left sm:col-span-2"
        >
          <span className="flex items-center gap-3 text-xs font-medium text-zinc-100">
            <Vibrate className="h-4 w-4 text-[#FF5500]" />
            Pulse Hardware Vibration Motor (100 ms)
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x35</span>
        </TactileButton>
      </div>

      {/* Mouse Jiggler Module */}
      <HardwareCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            <Activity className="h-3.5 w-3.5 text-[#FF5500]" />
            Mouse Jiggler Daemon
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x32 / FRAMED</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <TactileButton
            variant="keycap"
            onClick={() => void sendQuickCommand(QUICK_CMD.SEC_JIGGLER_TOGGLE)}
            className="py-3 font-mono text-xs"
          >
            Toggle
          </TactileButton>
          <TactileButton
            variant="keycap"
            onClick={() => void sendFramedCommand('jiggler on')}
            className="py-3 font-mono text-xs text-emerald-300"
          >
            jiggler on
          </TactileButton>
          <TactileButton
            variant="keycap"
            onClick={() => void sendFramedCommand('jiggler off')}
            className="py-3 font-mono text-xs text-zinc-400"
          >
            jiggler off
          </TactileButton>
        </div>
      </HardwareCard>
    </section>
  );
}
