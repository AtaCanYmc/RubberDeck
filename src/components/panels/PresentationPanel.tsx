import { ArrowLeft, ArrowRight, EyeOff, Maximize } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';

export function PresentationPanel() {
  const { sendQuickCommand } = useCommandQueue();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Presentation</h2>
        <p className="font-mono text-xs text-zinc-500">
          Slide navigation shortcuts (0x21..0x24)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_PREV_SLIDE)}
          className="flex h-36 flex-col items-center justify-center gap-2 border border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-sm font-medium">Previous Slide</span>
          <span className="font-mono text-xs text-zinc-500">0x22</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_NEXT_SLIDE)}
          className="flex h-36 flex-col items-center justify-center gap-2 border border-zinc-100 bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-sm font-medium">Next Slide</span>
          <span className="font-mono text-xs text-zinc-600">0x21</span>
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_FULLSCREEN)}
          className="flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900 py-4 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <Maximize className="h-4 w-4" />
          Fullscreen (F5 / 0x23)
        </button>

        <button
          type="button"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_BLANK_SCREEN)}
          className="flex items-center justify-center gap-2 border border-zinc-800 bg-zinc-900 py-4 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          <EyeOff className="h-4 w-4" />
          Blank Screen (0x24)
        </button>
      </div>
    </section>
  );
}
