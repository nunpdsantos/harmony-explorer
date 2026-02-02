import React from 'react';
import { useStore, type VisualizationMode } from '../state/store';

interface VizOption {
  value: VisualizationMode;
  label: string;
  shortLabel: string;
  icon: string;
}

interface VizCategory {
  name: string;
  options: VizOption[];
}

const VIZ_CATEGORIES: VizCategory[] = [
  {
    name: 'Circle-based',
    options: [
      { value: 'circleOfFifths', label: 'Circle of Fifths', shortLabel: 'Circle', icon: '◎' },
      { value: 'alternationCircle', label: 'Alternation Circle', shortLabel: 'Neo-R', icon: '⟳' },
    ],
  },
  {
    name: 'Function-based',
    options: [
      { value: 'proximityPyramid', label: 'Proximity Pyramid', shortLabel: 'Pyramid', icon: '△' },
      { value: 'tonalFunctionChart', label: 'Tonal Function', shortLabel: 'T/S/D', icon: '▦' },
    ],
  },
  {
    name: 'Symmetry',
    options: [
      { value: 'diminishedSymmetry', label: 'Diminished Symmetry', shortLabel: 'Dim', icon: '◇' },
      { value: 'augmentedStar', label: 'Augmented Star', shortLabel: 'Aug', icon: '✦' },
      { value: 'tritoneSubDiagram', label: 'Tritone Substitution', shortLabel: 'Tri', icon: '⬡' },
    ],
  },
  {
    name: 'Scales',
    options: [
      { value: 'chordScaleMap', label: 'Chord-Scale Map', shortLabel: 'C-S', icon: '⊙' },
    ],
  },
  {
    name: 'Keys',
    options: [
      { value: 'modulationMap', label: 'Modulation Map', shortLabel: 'Mod', icon: '⊞' },
      { value: 'negativeHarmonyMirror', label: 'Negative Harmony', shortLabel: 'Neg', icon: '⇅' },
    ],
  },
  {
    name: 'Keyboard',
    options: [
      { value: 'pianoKeyboard', label: 'Piano Keyboard', shortLabel: 'Piano', icon: '🎹' },
    ],
  },
];

interface VizSelectorProps {
  compact?: boolean;
}

export const VizSelector: React.FC<VizSelectorProps> = ({ compact = false }) => {
  const { activeViz, setActiveViz } = useStore();

  if (compact) {
    // Compact mode: single column of icon buttons for the collapsed rail
    const allOptions = VIZ_CATEGORIES.flatMap(c => c.options);
    return (
      <div className="flex flex-col gap-1 items-center">
        {allOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setActiveViz(opt.value)}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={activeViz === opt.value}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
              activeViz === opt.value
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-white/50 hover:text-white/60 hover:bg-white/8 border border-transparent'
            }`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {VIZ_CATEGORIES.map(cat => (
        <div key={cat.name}>
          <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">{cat.name}</div>
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={cat.name}>
            {cat.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setActiveViz(opt.value)}
                title={opt.label}
                role="radio"
                aria-checked={activeViz === opt.value}
                aria-label={opt.label}
                className={`text-[10px] px-2 py-1 rounded transition-colors ${
                  activeViz === opt.value
                    ? 'bg-white/15 text-white font-medium border border-white/20'
                    : 'bg-white/5 text-white/50 hover:text-white/60 hover:bg-white/8 border border-transparent'
                }`}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
