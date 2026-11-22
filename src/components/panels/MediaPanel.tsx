import { useState } from 'react';
import {
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { QUICK_CMD, type QuickCommandCode } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';
import { TactileButton } from '../ui/TactileButton';

export function MediaPanel() {
  const { sendQuickCommand } = useCommandQueue();
  const [lastStep, setLastStep] = useState<string | null>(null);

  const fire = (code: QuickCommandCode, label: string) => {
    setLastStep(label);
    void sendQuickCommand(code);
  };

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="02 // CONSUMER HID"
        title="Media Transport Deck"
        subtitle="Single-byte USB Consumer Control shortcuts (0x11..0x16)"
        rightSlot={
          <span className="rounded-md border border-white/[0.08] bg-[#121215] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            {lastStep ? `LAST: ${lastStep}` : 'READY'}
          </span>
        }
      />

      {/* Primary Transport Row */}
      <HardwareCard className="p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Playback Transport
        </p>
        <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-3">
          <TactileButton
            variant="keycap"
            onClick={() => fire(QUICK_CMD.MEDIA_PREV_TRACK, 'PREV 0x13')}
            className="h-28 flex-col gap-2"
          >
            <SkipBack className="h-5 w-5 text-zinc-200" />
            <span className="text-xs font-medium text-zinc-200">Previous</span>
            <span className="font-mono text-[10px] text-zinc-500">0x13</span>
          </TactileButton>

          <TactileButton
            variant="signal"
            onClick={() => fire(QUICK_CMD.MEDIA_PLAY_PAUSE, 'PLAY/PAUSE 0x11')}
            className="h-28 flex-col gap-2 rounded-xl"
          >
            <Play className="h-7 w-7 fill-current" />
            <span className="text-sm font-semibold">Play / Pause</span>
            <span className="font-mono text-[10px] opacity-75">0x11</span>
          </TactileButton>

          <TactileButton
            variant="keycap"
            onClick={() => fire(QUICK_CMD.MEDIA_NEXT_TRACK, 'NEXT 0x12')}
            className="h-28 flex-col gap-2"
          >
            <SkipForward className="h-5 w-5 text-zinc-200" />
            <span className="text-xs font-medium text-zinc-200">Next</span>
            <span className="font-mono text-[10px] text-zinc-500">0x12</span>
          </TactileButton>
        </div>
      </HardwareCard>

      {/* Output Gain / Volume Strip */}
      <HardwareCard className="p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
          Output Level
        </p>
        <div className="grid grid-cols-3 gap-3">
          <TactileButton
            variant="keycap"
            onClick={() => fire(QUICK_CMD.MEDIA_VOL_DOWN, 'VOL - 0x15')}
            className="h-20 flex-col gap-1.5"
          >
            <Volume1 className="h-5 w-5 text-zinc-200" />
            <span className="text-xs font-medium">Vol Down</span>
            <span className="font-mono text-[10px] text-zinc-500">0x15</span>
          </TactileButton>

          <TactileButton
            variant="keycap"
            onClick={() => fire(QUICK_CMD.MEDIA_MUTE, 'MUTE 0x16')}
            className="h-20 flex-col gap-1.5"
          >
            <VolumeX className="h-5 w-5 text-zinc-200" />
            <span className="text-xs font-medium">Mute</span>
            <span className="font-mono text-[10px] text-zinc-500">0x16</span>
          </TactileButton>

          <TactileButton
            variant="keycap"
            onClick={() => fire(QUICK_CMD.MEDIA_VOL_UP, 'VOL + 0x14')}
            className="h-20 flex-col gap-1.5"
          >
            <Volume2 className="h-5 w-5 text-zinc-200" />
            <span className="text-xs font-medium">Vol Up</span>
            <span className="font-mono text-[10px] text-zinc-500">0x14</span>
          </TactileButton>
        </div>
      </HardwareCard>
    </section>
  );
}
