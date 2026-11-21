import {
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { QUICK_CMD } from '../../protocol';
import { useCommandQueue } from '../../hooks/useCommandQueue';

export function MediaPanel() {
  const { sendQuickCommand } = useCommandQueue();

  const controls = [
    { label: 'Previous', hex: '0x13', code: QUICK_CMD.MEDIA_PREV_TRACK, icon: SkipBack },
    { label: 'Play / Pause', hex: '0x11', code: QUICK_CMD.MEDIA_PLAY_PAUSE, icon: Play },
    { label: 'Next', hex: '0x12', code: QUICK_CMD.MEDIA_NEXT_TRACK, icon: SkipForward },
    { label: 'Volume Down', hex: '0x15', code: QUICK_CMD.MEDIA_VOL_DOWN, icon: Volume1 },
    { label: 'Mute', hex: '0x16', code: QUICK_CMD.MEDIA_MUTE, icon: VolumeX },
    { label: 'Volume Up', hex: '0x14', code: QUICK_CMD.MEDIA_VOL_UP, icon: Volume2 },
  ] as const;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Media Controls</h2>
        <p className="font-mono text-xs text-zinc-500">
          USB HID Consumer Control single-byte shortcuts (0x11..0x16)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {controls.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.hex}
              type="button"
              onClick={() => void sendQuickCommand(item.code)}
              className="flex flex-col items-center justify-center gap-2 border border-zinc-800 bg-zinc-900 px-3 py-6 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/80"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
              <span className="font-mono text-[11px] text-zinc-500">{item.hex}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
