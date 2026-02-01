import React from 'react';
import { useStore, type VisualizationMode } from '../state/store';

interface VizOption {
  value: VisualizationMode;
  label: string;
  shortLabel: string;
}

interface VizCategory {
  name: string;
  options: VizOption[];
}

const VIZ_CATEGORIES: VizCategory[] = [
  {
    name: 'Circle-based',
    options: [
      { value: 'circleOfFifths', label: 'Circle of Fifths', shortLabel: 'Circle' },
      { value: 'alternationCircle', label: 'Alternation Circle', shortLabel: 'Neo-R' },
    ],
  },
  {
    name: 'Function-based',
    options: [
      { value: 'proximityPyramid', label: 'Proximity Pyramid', shortLabel: 'Pyramid' },
      { value: 'tonalFunctionChart', label: 'Tonal Function', shortLabel: 'T/S/D' },
    ],
  },
  {
    name: 'Symmetry',
    options: [
      { value: 'diminishedSymmetry', label: 'Diminished Symmetry', shortLabel: 'Dim' },
      { value: 'augmentedStar', label: 'Augmented Star', shortLabel: 'Aug' },
      { value: 'tritoneSubDiagram', label: 'Tritone Substitution', shortLabel: 'Tri' },
    ],
  },
];

export const VizSelector: React.FC = () => {
  const { activeViz, setActiveViz } = useStore();

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
