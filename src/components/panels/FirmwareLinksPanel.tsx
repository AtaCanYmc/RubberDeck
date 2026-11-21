import { ExternalLink } from 'lucide-react';
import { DEVICE_PROFILES } from '../../protocol';

export function FirmwareLinksPanel() {
  const profiles = Object.values(DEVICE_PROFILES);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Firmware Flashers</h2>
        <p className="font-mono text-xs text-zinc-500">
          RubberDeck does not host firmware binaries or Web Serial flashers. Use the
          dedicated hardware repository flasher for your board.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex flex-col justify-between gap-4 border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {profile.label} Flasher
                </h3>
                <span className="border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {profile.maxPayloadBytes} B
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-500">{profile.mcu}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={profile.flasherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-zinc-100 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-zinc-200"
              >
                Open Web Flasher
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={profile.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
              >
                Repository
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
