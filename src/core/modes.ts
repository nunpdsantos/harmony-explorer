/**
 * Comprehensive mode and scale system.
 * Covers modes of major, melodic minor, harmonic minor,
 * and symmetric/other scales.
 */

// ── Mode template interface ──

export interface ModeTemplate {
  intervals: readonly number[];
  name: string;
  parent: 'major' | 'melodicMinor' | 'harmonicMinor' | 'symmetric' | 'other';
  degree: number; // 1-based degree within parent (0 for non-modal)
  characteristicTones: readonly number[]; // intervals that define this mode's character
}

// ── Mode types ──

export type MajorMode =
  | 'ionian' | 'dorian' | 'phrygian' | 'lydian'
  | 'mixolydian' | 'aeolian' | 'locrian';

export type MelodicMinorMode =
  | 'melodicMinor' | 'dorianFlat2' | 'lydianAugmented'
  | 'lydianDominant' | 'mixolydianFlat6' | 'locrianNatural2'
  | 'altered';

export type HarmonicMinorMode =
  | 'harmonicMinor' | 'locrianNatural6' | 'ionianSharp5'
  | 'dorianSharp4' | 'phrygianDominant' | 'lydianSharp2'
  | 'ultraLocrian';

export type SymmetricScale =
  | 'wholeHalfDim' | 'halfWholeDim' | 'wholeTone' | 'augmentedScale'
  | 'bebopDominant' | 'bebopMajor' | 'bebopDorian'
  | 'pentatonicMajor' | 'pentatonicMinor' | 'blues';

export type ModeType = MajorMode | MelodicMinorMode | HarmonicMinorMode | SymmetricScale;

// ── Mode templates ──

export const MODE_TEMPLATES: Record<ModeType, ModeTemplate> = {
  // ── 7 Modes of Major Scale ──
  ionian:       { intervals: [0, 2, 4, 5, 7, 9, 11], name: 'Ionian (Major)', parent: 'major', degree: 1, characteristicTones: [11] },
  dorian:       { intervals: [0, 2, 3, 5, 7, 9, 10], name: 'Dorian', parent: 'major', degree: 2, characteristicTones: [9] },
  phrygian:     { intervals: [0, 1, 3, 5, 7, 8, 10], name: 'Phrygian', parent: 'major', degree: 3, characteristicTones: [1] },
  lydian:       { intervals: [0, 2, 4, 6, 7, 9, 11], name: 'Lydian', parent: 'major', degree: 4, characteristicTones: [6] },
  mixolydian:   { intervals: [0, 2, 4, 5, 7, 9, 10], name: 'Mixolydian', parent: 'major', degree: 5, characteristicTones: [10] },
  aeolian:      { intervals: [0, 2, 3, 5, 7, 8, 10], name: 'Aeolian (Natural Minor)', parent: 'major', degree: 6, characteristicTones: [3, 8] },
  locrian:      { intervals: [0, 1, 3, 5, 6, 8, 10], name: 'Locrian', parent: 'major', degree: 7, characteristicTones: [1, 6] },

  // ── 7 Modes of Melodic Minor ──
  melodicMinor:     { intervals: [0, 2, 3, 5, 7, 9, 11], name: 'Melodic Minor', parent: 'melodicMinor', degree: 1, characteristicTones: [3, 11] },
  dorianFlat2:      { intervals: [0, 1, 3, 5, 7, 9, 10], name: 'Dorian ♭2', parent: 'melodicMinor', degree: 2, characteristicTones: [1, 9] },
  lydianAugmented:  { intervals: [0, 2, 4, 6, 8, 9, 11], name: 'Lydian Augmented', parent: 'melodicMinor', degree: 3, characteristicTones: [6, 8] },
  lydianDominant:   { intervals: [0, 2, 4, 6, 7, 9, 10], name: 'Lydian Dominant', parent: 'melodicMinor', degree: 4, characteristicTones: [6, 10] },
  mixolydianFlat6:  { intervals: [0, 2, 4, 5, 7, 8, 10], name: 'Mixolydian ♭6', parent: 'melodicMinor', degree: 5, characteristicTones: [8, 10] },
  locrianNatural2:  { intervals: [0, 2, 3, 5, 6, 8, 10], name: 'Locrian ♮2', parent: 'melodicMinor', degree: 6, characteristicTones: [2, 6] },
  altered:          { intervals: [0, 1, 3, 4, 6, 8, 10], name: 'Altered (Super Locrian)', parent: 'melodicMinor', degree: 7, characteristicTones: [1, 3, 6, 8] },

  // ── 7 Modes of Harmonic Minor ──
  harmonicMinor:    { intervals: [0, 2, 3, 5, 7, 8, 11], name: 'Harmonic Minor', parent: 'harmonicMinor', degree: 1, characteristicTones: [3, 11] },
  locrianNatural6:  { intervals: [0, 1, 3, 5, 6, 9, 10], name: 'Locrian ♮6', parent: 'harmonicMinor', degree: 2, characteristicTones: [1, 6, 9] },
  ionianSharp5:     { intervals: [0, 2, 4, 5, 8, 9, 11], name: 'Ionian ♯5', parent: 'harmonicMinor', degree: 3, characteristicTones: [8, 11] },
  dorianSharp4:     { intervals: [0, 2, 3, 6, 7, 9, 10], name: 'Dorian ♯4', parent: 'harmonicMinor', degree: 4, characteristicTones: [6, 9] },
  phrygianDominant: { intervals: [0, 1, 4, 5, 7, 8, 10], name: 'Phrygian Dominant', parent: 'harmonicMinor', degree: 5, characteristicTones: [1, 4] },
  lydianSharp2:     { intervals: [0, 3, 4, 6, 7, 9, 11], name: 'Lydian ♯2', parent: 'harmonicMinor', degree: 6, characteristicTones: [3, 6] },
  ultraLocrian:     { intervals: [0, 1, 3, 4, 6, 8, 9],  name: 'Ultra Locrian', parent: 'harmonicMinor', degree: 7, characteristicTones: [1, 4, 6, 9] },

  // ── Symmetric Scales ──
  wholeHalfDim:     { intervals: [0, 2, 3, 5, 6, 8, 9, 11], name: 'Whole-Half Diminished', parent: 'symmetric', degree: 0, characteristicTones: [2, 3] },
  halfWholeDim:     { intervals: [0, 1, 3, 4, 6, 7, 9, 10], name: 'Half-Whole Diminished', parent: 'symmetric', degree: 0, characteristicTones: [1, 4] },
  wholeTone:        { intervals: [0, 2, 4, 6, 8, 10],        name: 'Whole Tone', parent: 'symmetric', degree: 0, characteristicTones: [2, 6, 8] },
  augmentedScale:   { intervals: [0, 3, 4, 7, 8, 11],        name: 'Augmented', parent: 'symmetric', degree: 0, characteristicTones: [3, 4, 8] },

  // ── Bebop Scales ──
  bebopDominant:    { intervals: [0, 2, 4, 5, 7, 9, 10, 11], name: 'Bebop Dominant', parent: 'other', degree: 0, characteristicTones: [10, 11] },
  bebopMajor:       { intervals: [0, 2, 4, 5, 7, 8, 9, 11],  name: 'Bebop Major', parent: 'other', degree: 0, characteristicTones: [8, 9] },
  bebopDorian:      { intervals: [0, 2, 3, 4, 5, 7, 9, 10],  name: 'Bebop Dorian', parent: 'other', degree: 0, characteristicTones: [3, 4] },

  // ── Pentatonic & Blues ──
  pentatonicMajor:  { intervals: [0, 2, 4, 7, 9],            name: 'Pentatonic Major', parent: 'other', degree: 0, characteristicTones: [2, 9] },
  pentatonicMinor:  { intervals: [0, 3, 5, 7, 10],           name: 'Pentatonic Minor', parent: 'other', degree: 0, characteristicTones: [3, 10] },
  blues:            { intervals: [0, 3, 5, 6, 7, 10],        name: 'Blues', parent: 'other', degree: 0, characteristicTones: [3, 6, 10] },
};

/**
 * Derive a mode from a parent scale by rotating to a given degree.
 * E.g., deriveMode([0,2,4,5,7,9,11], 2) gives dorian intervals.
 */
export function deriveMode(parentIntervals: readonly number[], degree: number): number[] {
  const n = parentIntervals.length;
  const offset = parentIntervals[degree - 1] ?? 0;
  return Array.from({ length: n }, (_, i) => {
    return ((parentIntervals[(i + degree - 1) % n] - offset) % 12 + 12) % 12;
  });
}

/**
 * Get the pitch classes (0-11) for a mode starting on a given root.
 */
export function modePitchClasses(root: number, mode: ModeType): number[] {
  const template = MODE_TEMPLATES[mode];
  return template.intervals.map(i => ((root + i) % 12 + 12) % 12);
}

/** Get all modes grouped by parent scale */
export function getModesByParent(): Record<string, ModeType[]> {
  const groups: Record<string, ModeType[]> = {
    major: [],
    melodicMinor: [],
    harmonicMinor: [],
    symmetric: [],
    other: [],
  };
  for (const [key, template] of Object.entries(MODE_TEMPLATES)) {
    groups[template.parent].push(key as ModeType);
  }
  return groups;
}
