import { ArrowLeft, ArrowRight, EyeOff, Maximize } from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { SectionLabel } from '../ui/SectionLabel';
import { TactileButton } from '../ui/TactileButton';

export function PresentationPanel() {
  const { sendQuickCommand } = useCommandQueue();

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="03 // STAGE CONTROLLER"
        title="Presentation Deck"
        subtitle="Blind one-handed slide navigation shortcuts (0x21..0x24)"
      />

      {/* Asymmetric Stage Pads: Oversized Next Slide */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[0.85fr_1.4fr]">
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_PREV_SLIDE)}
          className="h-36 flex-col gap-2 sm:h-52"
        >
          <ArrowLeft className="h-7 w-7 text-zinc-300" />
          <span className="text-sm font-medium text-zinc-200">Previous Slide</span>
          <span className="font-mono text-[11px] text-zinc-500">0x22</span>
        </TactileButton>

        <TactileButton
          variant="signal"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_NEXT_SLIDE)}
          className="h-44 flex-col gap-2.5 rounded-xl sm:h-52"
        >
          <ArrowRight className="h-9 w-9 stroke-[2.25]" />
          <span className="text-base font-semibold tracking-tight">Next Slide</span>
          <span className="font-mono text-[11px] opacity-80">PRIMARY ADVANCE · 0x21</span>
        </TactileButton>
      </div>

      {/* Stage Utility Keys */}
      <div className="grid grid-cols-2 gap-3">
        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_FULLSCREEN)}
          className="h-16 justify-between px-4"
        >
          <span className="flex items-center gap-2.5 text-xs font-medium text-zinc-100">
            <Maximize className="h-4 w-4 text-zinc-400" />
            Fullscreen (F5)
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x23</span>
        </TactileButton>

        <TactileButton
          variant="keycap"
          onClick={() => void sendQuickCommand(QUICK_CMD.PRES_BLANK_SCREEN)}
          className="h-16 justify-between px-4"
        >
          <span className="flex items-center gap-2.5 text-xs font-medium text-zinc-100">
            <EyeOff className="h-4 w-4 text-zinc-400" />
            Blank Screen
          </span>
          <span className="font-mono text-[10px] text-zinc-500">0x24</span>
        </TactileButton>
      </div>
    </section>
  );
}
