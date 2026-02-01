import React, { Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { VisualizationArea } from './components/VisualizationArea';
import { TransportBar } from './components/TransportBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStore } from './state/store';

// Lazy-load modals — not needed on initial render
const ShortcutsReference = React.lazy(() =>
  import('./components/ShortcutsReference').then(m => ({ default: m.ShortcutsReference }))
);
const OnboardingTour = React.lazy(() =>
  import('./components/OnboardingTour').then(m => ({ default: m.OnboardingTour }))
);

const App: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useStore();
  useKeyboardShortcuts();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/60 hover:text-white/80"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <span className="text-sm font-bold text-white/80">Harmony Explorer</span>
        <div className="w-6" />
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
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
    </div>
  );
};

export default App;
