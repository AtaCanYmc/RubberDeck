import { useRef, useState, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { useDeckStore } from '../../store/useDeckStore';
import { SectionLabel } from '../ui/SectionLabel';
import { StatusLed } from '../ui/StatusLed';
import { TactileButton } from '../ui/TactileButton';

export function TrackpadPanel() {
  const { sendQuickCommand, sendMouseMove } = useCommandQueue();
  const sensitivity = useDeckStore((s) => s.trackpadSensitivity);
  const setSensitivity = useDeckStore((s) => s.setTrackpadSensitivity);

  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [delta, setDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState<{ x: number; y: number } | null>(null);

  const updateGlow = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPos.current = { x: e.clientX, y: e.clientY };
    setIsTracking(true);
    setDelta({ x: 0, y: 0 });
    updateGlow(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!lastPos.current) {
      return;
    }
    const dx = (e.clientX - lastPos.current.x) * sensitivity;
    const dy = (e.clientY - lastPos.current.y) * sensitivity;
    lastPos.current = { x: e.clientX, y: e.clientY };
    updateGlow(e);

    if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
      setDelta({ x: Math.round(dx), y: Math.round(dy) });
      void sendMouseMove(dx, dy);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    lastPos.current = null;
    setIsTracking(false);
    setGlowPos(null);
    setDelta({ x: 0, y: 0 });
  };

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="01 // HID POINTER"
        title="Precision Trackpad"
        subtitle="0x80 relative motion frames (-128..127)"
        rightSlot={
          <label className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-[#121215] px-3 py-1.5 font-mono text-[11px] text-zinc-400">
            <span className="uppercase tracking-wider text-zinc-500">Gain</span>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-20 accent-[#FF5500]"
            />
            <span className="w-8 text-right font-medium text-zinc-200 tabular-nums">
              {sensitivity.toFixed(1)}x
            </span>
          </label>
        }
      />

      <div className="grid grid-cols-[1fr_56px] gap-2.5">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_LEFT_CLICK)}
          className={`trackpad-grid relative flex h-72 touch-none select-none items-center justify-center overflow-hidden rounded-xl border transition-colors sm:h-80 ${
            isTracking
              ? 'border-[#FF5500]/50 shadow-[inset_0_0_24px_rgba(255,85,0,0.08)]'
              : 'border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
          }`}
        >
          {glowPos && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full"
              style={{
                left: glowPos.x,
                top: glowPos.y,
                background:
                  'radial-gradient(circle, rgba(255,85,0,0.22) 0%, rgba(255,85,0,0) 70%)',
              }}
            />
          )}

          {/* Top-left coordinate telemetry HUD */}
          <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-3 rounded-md border border-white/[0.07] bg-[#09090B]/80 px-2.5 py-1 font-mono text-[10px] text-zinc-400 tabular-nums backdrop-blur-sm">
            <span>
              ΔX{' '}
              <strong className={isTracking ? 'text-[#FF5500]' : 'text-zinc-300'}>
                {delta.x >= 0 ? `+${delta.x}` : delta.x}
              </strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span>
              ΔY{' '}
              <strong className={isTracking ? 'text-[#FF5500]' : 'text-zinc-300'}>
                {delta.y >= 0 ? `+${delta.y}` : delta.y}
              </strong>
            </span>
          </div>

          {/* Top-right active LED */}
          <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-[#09090B]/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <StatusLed tone={isTracking ? 'signal' : 'off'} />
            <span>{isTracking ? 'TRACK' : 'READY'}</span>
          </div>

          <span className="pointer-events-none font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-600">
            Drag Surface · Double-Tap Click
          </span>
        </div>

        {/* Scroll Rocker */}
        <div className="flex flex-col gap-2">
          <TactileButton
            variant="keycap"
            onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_SCROLL_UP)}
            className="flex-1 flex-col gap-1 px-0"
            aria-label="Scroll Up"
          >
            <ArrowUp className="h-4 w-4 text-zinc-300" />
            <span className="font-mono text-[9px] text-zinc-500">UP</span>
          </TactileButton>
          <TactileButton
            variant="keycap"
            onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_SCROLL_DOWN)}
            className="flex-1 flex-col gap-1 px-0"
            aria-label="Scroll Down"
          >
            <span className="font-mono text-[9px] text-zinc-500">DN</span>
            <ArrowDown className="h-4 w-4 text-zinc-300" />
          </TactileButton>
        </div>
      </div>

      {/* Physical Mouse Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_LEFT_CLICK)}
          className="flex-col gap-0.5 py-3.5"
        >
          <span className="text-xs font-medium text-zinc-100">Left Click</span>
          <span className="font-mono text-[10px] text-zinc-500">0x81</span>
        </TactileButton>
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_MIDDLE_CLICK)}
          className="flex-col gap-0.5 py-3.5"
        >
          <span className="text-xs font-medium text-zinc-100">Middle</span>
          <span className="font-mono text-[10px] text-zinc-500">0x83</span>
        </TactileButton>
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_RIGHT_CLICK)}
          className="flex-col gap-0.5 py-3.5"
        >
          <span className="text-xs font-medium text-zinc-100">Right Click</span>
          <span className="font-mono text-[10px] text-zinc-500">0x82</span>
        </TactileButton>
      </div>
    </section>
  );
}
