import { Cpu, ExternalLink, GitBranch, ShieldCheck } from 'lucide-react';
import { DEVICE_PROFILES } from '../../protocol';
import { HardwareCard } from '../ui/HardwareCard';
import { SectionLabel } from '../ui/SectionLabel';

export function FirmwareLinksPanel() {
  const profiles = Object.values(DEVICE_PROFILES);

  return (
    <section className="space-y-5">
      <SectionLabel
        kicker="08 // EXTERNAL FLASHERS"
        title="Firmware & Board Repositories"
        subtitle="RubberDeck excludes firmware binaries by design. Flash hardware from its dedicated Web Serial portal."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {profiles.map((profile) => (
          <HardwareCard
            key={profile.id}
            variant="elevated"
            className="flex flex-col justify-between gap-5 p-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.1] bg-[#121215] text-[#FF5500]">
                    <Cpu className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {profile.label}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      PROFILE: {profile.id}
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-white/[0.08] bg-[#09090B] px-2 py-0.5 font-mono text-[10px] text-zinc-400 tabular-nums">
                  {profile.maxPayloadBytes} B MAX
                </span>
              </div>

              <div className="rounded-lg border border-white/[0.06] bg-[#0C0C0E] px-3 py-2 font-mono text-[11px] text-zinc-400">
                <span className="block text-[9px] uppercase tracking-widest text-zinc-600">
                  Target Silicon
                </span>
                <span className="text-zinc-200">{profile.mcu}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={profile.flasherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hw-keycap-signal inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold"
              >
                <span>Open Web Flasher</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={profile.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hw-keycap inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-200"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Repo</span>
              </a>
            </div>
          </HardwareCard>
        ))}
      </div>

      <HardwareCard className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Offline-only control. Zero analytics or third-party tracking.</span>
        </div>
        <a
          href={`${import.meta.env.BASE_URL}privacy.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-200 underline decoration-white/25 underline-offset-4 hover:text-[#FF5500]"
        >
          <span>Privacy Policy</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </HardwareCard>
    </section>
  );
}
