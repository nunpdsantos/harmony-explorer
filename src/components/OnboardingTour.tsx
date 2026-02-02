import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';

interface TourStep {
  title: string;
  description: string;
  targetSelector?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Harmony Explorer',
    description: 'An interactive tool for exploring tonal and jazz harmony through 11 linked visualizations, audio playback, and 22 guided lessons. Let\'s take a quick tour!',
  },
  {
    title: 'Choose Your Key',
    description: 'Select a key from the key selector in the sidebar. All chords, visualizations, and analysis will update to reflect your chosen key.',
  },
  {
    title: 'Explore Visualizations',
    description: 'Switch between 11 visualizations across 5 categories: Circle of Fifths, Tonal Function Chart, Proximity Pyramid, Modulation Map, Chord-Scale Map, Negative Harmony Mirror, and more.',
  },
  {
    title: 'Build Progressions',
    description: 'Click chords to build a progression. The Next Moves panel suggests where to go next. Drag to reorder, use templates as starting points, and see voice-leading quality in real time.',
  },
  {
    title: 'Overlays & Analysis',
    description: 'Toggle overlays in the transport bar: Voices (V) shows voice-leading paths, Bridges (B) suggests chromatic passing chords, and Modal Interchange (M) reveals borrowed chords from parallel modes.',
  },
  {
    title: 'Advanced Theory',
    description: 'Explore chord extensions (9ths\u201313ths), all modes, chord-scale relationships, altered dominants, Coltrane changes (J), upper structure triads, and negative harmony.',
  },
  {
    title: 'Transport Controls',
    description: 'Play/stop your progression, toggle looping, adjust BPM, switch between 5 instrument presets, and undo/redo changes with Cmd+Z. Export to MIDI when ready.',
  },
  {
    title: 'Learn Mode',
    description: 'Switch to Learn mode for 22 guided lessons \u2014 from basic scales to Coltrane changes. Each lesson includes interactive exercises. Press ? anytime for keyboard shortcuts.',
  },
];

export const OnboardingTour: React.FC = () => {
  const tour = useOnboarding(TOUR_STEPS.length);

  if (!tour.isActive) return null;

  const step = TOUR_STEPS[tour.currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Card */}
      <div
        className="relative bg-gray-900 border border-white/15 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Tour step ${tour.currentStep + 1} of ${tour.totalSteps}`}
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((tour.currentStep + 1) / tour.totalSteps) * 100}%` }}
          />
        </div>

        <div className="px-6 py-5">
          {/* Step counter */}
          <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">
            Step {tour.currentStep + 1} of {tour.totalSteps}
          </div>

          <h2 className="text-base font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{step.title}</h2>
          <p className="text-sm text-white/60 leading-relaxed">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={tour.skip}
            className="text-xs text-white/50 hover:text-white/60 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {tour.currentStep > 0 && (
              <button
                onClick={tour.back}
                className="text-xs px-3 py-1.5 rounded bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={tour.next}
              className="text-xs px-4 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              {tour.currentStep === tour.totalSteps - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
