import React from 'react';
import { Sidebar } from './components/Sidebar';
import { VisualizationArea } from './components/VisualizationArea';
import { TransportBar } from './components/TransportBar';
import { useStore } from './state/store';

const App: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/10">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/60 hover:text-white/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-sm font-bold text-white/80">Harmony Explorer</h1>
        <div className="w-6" />
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <VisualizationArea />
        </main>
      </div>

      {/* Bottom transport bar */}
      <TransportBar />
    </div>
  );
};

export default App;
