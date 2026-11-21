import { useRef, type PointerEvent } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { useDeckStore } from '../../store/useDeckStore';

export function TrackpadPanel() {
  const { sendQuickCommand, sendMouseMove } = useCommandQueue();
  const sensitivity = useDeckStore((s) => s.trackpadSensitivity);
  const setSensitivity = useDeckStore((s) => s.setTrackpadSensitivity);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!lastPos.current) {
      return;
    }
    const dx = (e.clientX - lastPos.current.x) * sensitivity;
    const dy = (e.clientY - lastPos.current.y) * sensitivity;
    lastPos.current = { x: e.clientX, y: e.clientY };

    if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
      void sendMouseMove(dx, dy);
    }
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    lastPos.current = null;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">HID Trackpad</h2>
          <p className="font-mono text-xs text-zinc-500">
            0x80 relative move packets (-128..127)
          </p>
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span>Gain {sensitivity.toFixed(1)}x</span>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className="w-24 accent-zinc-100"
          />
        </label>
      </div>

      <div className="grid grid-cols-[1fr_52px] gap-2">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_LEFT_CLICK)}
          className="flex h-72 touch-none select-none items-center justify-center border border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-500 active:border-zinc-600"
        >
          DRAG SURFACE / DOUBLE-TAP CLICK
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_SCROLL_UP)}
            className="flex flex-1 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            aria-label="Scroll Up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_SCROLL_DOWN)}
            className="flex flex-1 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            aria-label="Scroll Down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_LEFT_CLICK)}
          className="border border-zinc-800 bg-zinc-900 py-3 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
        >
          LEFT (0x81)
        </button>
        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_MIDDLE_CLICK)}
          className="border border-zinc-800 bg-zinc-900 py-3 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
        >
          MIDDLE (0x83)
        </button>
        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.MOUSE_RIGHT_CLICK)}
          className="border border-zinc-800 bg-zinc-900 py-3 font-mono text-xs text-zinc-200 hover:bg-zinc-800"
        >
          RIGHT (0x82)
        </button>
      </div>
    </section>
  );
}
