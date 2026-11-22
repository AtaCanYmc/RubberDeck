import {
  Cpu,
  Download,
  Layers,
  MousePointer2,
  Play,
  Presentation,
  Shield,
  Terminal,
  Vibrate,
} from 'lucide-react';
import { triggerHaptic } from '../../services/haptics';
import {
  type ActiveTab,
  selectActiveProfile,
  useDeckStore,
} from '../../store/useDeckStore';

interface NavItem {
  readonly id: ActiveTab;
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: typeof MousePointer2;
  readonly requiresDeviceConfig?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'trackpad', label: 'Trackpad', shortLabel: 'Pad', icon: MousePointer2 },
  { id: 'media', label: 'Media', shortLabel: 'Media', icon: Play },
  { id: 'presentation', label: 'Slides', shortLabel: 'Slides', icon: Presentation },
  { id: 'security', label: 'Security', shortLabel: 'Sec', icon: Shield },
  { id: 'console', label: 'Console', shortLabel: 'Term', icon: Terminal },
  { id: 'macros', label: 'Macros', shortLabel: 'Macro', icon: Layers },
  { id: 'device', label: 'Device', shortLabel: 'Dev', icon: Cpu, requiresDeviceConfig: true },
  { id: 'firmware', label: 'Firmware', shortLabel: 'Flash', icon: Download },
];

export function NavBar() {
  const activeTab = useDeckStore((s) => s.activeTab);
  const setActiveTab = useDeckStore((s) => s.setActiveTab);
  const hapticsEnabled = useDeckStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useDeckStore((s) => s.setHapticsEnabled);
  const profile = useDeckStore(selectActiveProfile);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requiresDeviceConfig) {
      return profile.capabilities.bleNameConfig || profile.capabilities.blePasskeyConfig;
    }
    return true;
  });

  const handleSelect = (tab: ActiveTab) => {
    if (tab !== activeTab) {
      void triggerHaptic(hapticsEnabled);
      setActiveTab(tab);
    }
  };

  return (
    <>
      {/* Desktop Left Icon Rail */}
      <aside
        className="hidden w-16 shrink-0 flex-col justify-between border-r border-white/[0.08] bg-[#0C0C0E] py-4 md:flex lg:w-48"
        aria-label="Control Panels"
      >
        <nav className="flex flex-col gap-1 px-2">
          <p className="hidden px-2.5 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 lg:block">
            Deck Modules
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => handleSelect(item.id)}
                className={`group relative flex select-none items-center justify-center gap-3 rounded-lg px-2.5 py-2.5 text-xs font-medium transition-all active:scale-[0.97] lg:justify-start ${
                  active
                    ? 'bg-[#18181B] text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-[#FF5500]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? 'text-[#FF5500]' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span className="hidden truncate lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-2 pt-3">
          <button
            type="button"
            title={hapticsEnabled ? 'Haptics enabled' : 'Haptics muted'}
            aria-pressed={hapticsEnabled}
            onClick={() => {
              const next = !hapticsEnabled;
              setHapticsEnabled(next);
              if (next) void triggerHaptic(true);
            }}
            className="flex w-full select-none items-center justify-center gap-2.5 rounded-lg px-2.5 py-2 font-mono text-[11px] text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 lg:justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <Vibrate
                className={`h-3.5 w-3.5 ${hapticsEnabled ? 'text-zinc-200' : 'text-zinc-600'}`}
              />
              <span className="hidden lg:inline">Haptics</span>
            </span>
            <span
              className={`hidden rounded px-1.5 py-0.5 text-[10px] lg:inline ${
                hapticsEnabled
                  ? 'bg-[#FF5500]/15 text-[#FF5500]'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {hapticsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Floating Bottom Dock */}
      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 pb-2 md:hidden"
        aria-label="Control Panels Mobile"
      >
        <div className="mx-auto flex max-w-md items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.1] bg-[#121215]/90 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => handleSelect(item.id)}
                className={`relative flex min-w-[54px] flex-1 select-none flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all active:scale-[0.95] ${
                  active
                    ? 'bg-[#1F1F24] text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 h-0.5 w-4 rounded-full bg-[#FF5500]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 ${active ? 'text-[#FF5500]' : 'text-zinc-400'}`}
                />
                <span className="font-mono text-[9px] font-medium uppercase tracking-wider">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
