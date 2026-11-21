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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header />
      <NavBar />

      {lastError && (
        <div className="border-b border-red-900/80 bg-red-950/50 px-4 py-2 font-mono text-xs text-red-200">
          <div className="mx-auto max-w-5xl">{lastError}</div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {activeTab === 'trackpad' && <TrackpadPanel />}
        {activeTab === 'media' && <MediaPanel />}
        {activeTab === 'presentation' && <PresentationPanel />}
        {activeTab === 'security' && <SecurityPanel />}
        {activeTab === 'console' && <TextConsolePanel />}
        {activeTab === 'macros' && <MacroPanel />}
        {activeTab === 'device' && <DeviceConfigPanel />}
        {activeTab === 'firmware' && <FirmwareLinksPanel />}
      </main>
    </div>
  );
}

export default App;
