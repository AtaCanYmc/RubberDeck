import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Header } from './components/layout/Header';
import { NavBar } from './components/layout/NavBar';
import { DeviceConfigPanel } from './components/panels/DeviceConfigPanel';
import { FirmwareLinksPanel } from './components/panels/FirmwareLinksPanel';
import { MacroPanel } from './components/panels/MacroPanel';
import { MediaPanel } from './components/panels/MediaPanel';
import { PresentationPanel } from './components/panels/PresentationPanel';
import { SecurityPanel } from './components/panels/SecurityPanel';
import { TextConsolePanel } from './components/panels/TextConsolePanel';
import { TrackpadPanel } from './components/panels/TrackpadPanel';
import { useDeckStore } from './store/useDeckStore';

export function App() {
  const activeTab = useDeckStore((s) => s.activeTab);
  const lastError = useDeckStore((s) => s.lastError);
  const theme = useDeckStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090B] text-zinc-100">
      <Header />

      {lastError && (
        <div
          role="alert"
          className="border-b border-red-500/25 bg-red-950/40 px-4 py-2 font-mono text-xs text-red-200"
        >
          <div className="mx-auto flex max-w-6xl items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span className="truncate">{lastError}</span>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <NavBar />

        <main className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 md:py-7 md:pb-10">
          <div key={activeTab} className="panel-enter mx-auto max-w-3xl">
            {activeTab === 'trackpad' && <TrackpadPanel />}
            {activeTab === 'media' && <MediaPanel />}
            {activeTab === 'presentation' && <PresentationPanel />}
            {activeTab === 'security' && <SecurityPanel />}
            {activeTab === 'console' && <TextConsolePanel />}
            {activeTab === 'macros' && <MacroPanel />}
            {activeTab === 'device' && <DeviceConfigPanel />}
            {activeTab === 'firmware' && <FirmwareLinksPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
