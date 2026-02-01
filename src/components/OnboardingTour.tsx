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
    description: 'An interactive tool for exploring music theory concepts through visualizations, audio playback, and guided lessons. Let\'s take a quick tour!',
  },
  {
    title: 'Choose Your Key',
    description: 'Select a key from the piano-style key selector in the sidebar. All chords and visualizations will update to reflect your chosen key.',
  },
  {
    title: 'Explore Visualizations',
    description: 'Switch between 7 different visualizations: Circle of Fifths, Proximity Pyramid, Tonal Function Chart, and more. Each reveals different harmonic relationships.',
  },
  {
    title: 'Build Progressions',
    description: 'Click chords to add them to your progression at the bottom. You can play them back, loop them, adjust tempo, and export as MIDI.',
  },
  {
    title: 'Transport Controls',
    description: 'Use the transport bar to play/stop your progression, toggle looping, adjust BPM, switch instrument presets, and export to MIDI.',
  },
  {
    title: 'Learn Mode',
    description: 'Switch to Learn mode for 12 guided lessons covering scales, chords, the Circle of Fifths, secondary dominants, and more. Press ? anytime for keyboard shortcuts.',
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

          <h2 className="text-base font-bold text-white mb-2">{step.title}</h2>
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
