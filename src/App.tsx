import React, { Suspense, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { VisualizationArea } from './components/VisualizationArea';
import { TransportBar } from './components/TransportBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAnnouncements } from './hooks/useAnnouncements';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useStore } from './state/store';
import { decodeProgressionFromHash } from './utils/progressionSharing';

// Lazy-load modals — not needed on initial render
const ShortcutsReference = React.lazy(() =>
  import('./components/ShortcutsReference').then(m => ({ default: m.ShortcutsReference }))
);
const OnboardingTour = React.lazy(() =>
  import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour }))
);

/** Global aria-live region for screen reader announcements */
const AriaAnnouncer: React.FC = () => {
  const lastAnnouncement = useStore(s => s.lastAnnouncement);
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {lastAnnouncement}
    </div>
  );
};

const App: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useStore();
  useKeyboardShortcuts();
  useAnnouncements();
  const { canInstall, promptInstall } = usePwaInstall();
  const isOnline = useOnlineStatus();

  // Load progression from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const result = decodeProgressionFromHash(hash);
      if (result) {
        useStore.getState().setProgression(result.chords);
        useStore.getState().setReferenceRoot(result.keyRoot);
      }
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col text-white overflow-hidden" style={{ background: 'radial-gradient(ellipse at 30% 20%, #0c1222 0%, #030712 70%)' }}>
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/60 hover:text-white/80"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {!isOnline && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Offline</span>}
          <span className="text-sm font-bold text-white/80">Harmony Explorer</span>
        </div>
        <div className="flex items-center gap-1">
          {canInstall && (
            <button
              onClick={promptInstall}
              className="text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 transition-colors"
            >
              Install
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
          <ErrorBoundary>
            <VisualizationArea />
          </ErrorBoundary>
        </main>
      </div>

      {/* Bottom transport bar */}
      <ErrorBoundary>
        <TransportBar />
      </ErrorBoundary>

      {/* Keyboard shortcuts reference modal */}
      <Suspense fallback={null}>
        <ShortcutsReference />
      </Suspense>

      {/* First-visit onboarding tour */}
      <Suspense fallback={null}>
        <OnboardingTour />
      </Suspense>

      {/* Screen reader announcements */}
      <AriaAnnouncer />
    </div>
  );
};

export default App;
