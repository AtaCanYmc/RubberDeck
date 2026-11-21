import {
  Cpu,
  Download,
  Layers,
  MousePointer2,
  Play,
  Presentation,
  Shield,
  Terminal,
} from 'lucide-react';
import {
  type ActiveTab,
  selectActiveProfile,
  useDeckStore,
} from '../../store/useDeckStore';

interface NavItem {
  readonly id: ActiveTab;
  readonly label: string;
  readonly icon: typeof MousePointer2;
  readonly requiresDeviceConfig?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'trackpad', label: 'Trackpad', icon: MousePointer2 },
  { id: 'media', label: 'Media', icon: Play },
  { id: 'presentation', label: 'Slides', icon: Presentation },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'console', label: 'Console', icon: Terminal },
  { id: 'macros', label: 'Macros', icon: Layers },
  { id: 'device', label: 'Device', icon: Cpu, requiresDeviceConfig: true },
  { id: 'firmware', label: 'Firmware', icon: Download },
];

export function NavBar() {
  const activeTab = useDeckStore((s) => s.activeTab);
  const setActiveTab = useDeckStore((s) => s.setActiveTab);
  const profile = useDeckStore(selectActiveProfile);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requiresDeviceConfig) {
      return profile.capabilities.bleNameConfig || profile.capabilities.blePasskeyConfig;
    }
    return true;
  });

  return (
    <nav
      className="border-b border-zinc-800 bg-zinc-950"
      aria-label="Control Panels"
    >
      <div className="mx-auto flex max-w-5xl overflow-x-auto px-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-zinc-100 text-zinc-50'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
