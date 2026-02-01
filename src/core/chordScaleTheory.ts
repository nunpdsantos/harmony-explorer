/**
 * Chord-Scale Theory: maps chord qualities to appropriate scales,
 * with context-aware recommendations and avoid-note computation.
 */

import { CHORD_TEMPLATES, type ChordQuality } from './constants';
import type { ModeType } from './modes';
import { MODE_TEMPLATES, modePitchClasses } from './modes';

export interface ChordScaleMapping {
  primaryScale: ModeType;
  avoidNotes: number[];       // intervals to avoid (minor 9th from chord tone)
  alternates: ModeType[];     // other usable scales
}

/**
 * Static mapping: chord quality → default primary scale + alternates.
 * Used when we don't know the chord's context in a key.
 */
const STATIC_MAPPINGS: Partial<Record<ChordQuality, ChordScaleMapping>> = {
  // Major family
  major:     { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian', 'pentatonicMajor'] },
  maj7:      { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian', 'bebopMajor'] },
  maj9:      { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian'] },
  maj13:     { primaryScale: 'lydian', avoidNotes: [], alternates: ['ionian'] },
  sixth:     { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian', 'pentatonicMajor'] },
  sixNine:   { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian'] },
  add9:      { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian'] },

  // Minor family
  minor:     { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian', 'pentatonicMinor'] },
  min7:      { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian', 'phrygian', 'bebopDorian'] },
  min9:      { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
  min11:     { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
  min13:     { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
  min6:      { primaryScale: 'dorian', avoidNotes: [], alternates: ['melodicMinor'] },
  minAdd9:   { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
  minMaj7:   { primaryScale: 'melodicMinor', avoidNotes: [], alternates: ['harmonicMinor'] },

  // Dominant family
  dom7:      { primaryScale: 'mixolydian', avoidNotes: [5], alternates: ['bebopDominant', 'lydianDominant', 'blues'] },
  dom9:      { primaryScale: 'mixolydian', avoidNotes: [5], alternates: ['bebopDominant', 'lydianDominant'] },
  dom11:     { primaryScale: 'mixolydian', avoidNotes: [], alternates: ['bebopDominant'] },
  dom13:     { primaryScale: 'mixolydian', avoidNotes: [], alternates: ['lydianDominant', 'bebopDominant'] },
  dom7sus4:  { primaryScale: 'mixolydian', avoidNotes: [4], alternates: ['pentatonicMinor'] },
  dom9sus4:  { primaryScale: 'mixolydian', avoidNotes: [4], alternates: [] },

  // Altered dominant family
  alt7:              { primaryScale: 'altered', avoidNotes: [], alternates: ['wholeTone', 'halfWholeDim'] },
  dom7flat9:         { primaryScale: 'halfWholeDim', avoidNotes: [], alternates: ['phrygianDominant', 'altered'] },
  dom7sharp9:        { primaryScale: 'altered', avoidNotes: [], alternates: ['halfWholeDim', 'blues'] },
  dom7sharp11:       { primaryScale: 'lydianDominant', avoidNotes: [], alternates: ['wholeTone'] },
  dom7flat13:        { primaryScale: 'mixolydianFlat6', avoidNotes: [], alternates: ['altered'] },
  dom7flat5:         { primaryScale: 'lydianDominant', avoidNotes: [], alternates: ['wholeTone', 'altered'] },
  dom7sharp5flat9:   { primaryScale: 'altered', avoidNotes: [], alternates: ['wholeTone'] },
  dom7sharp5sharp9:  { primaryScale: 'altered', avoidNotes: [], alternates: ['wholeTone'] },

  // Diminished family
  diminished:   { primaryScale: 'wholeHalfDim', avoidNotes: [], alternates: ['locrian'] },
  dim7:         { primaryScale: 'wholeHalfDim', avoidNotes: [], alternates: [] },
  halfDim7:     { primaryScale: 'locrian', avoidNotes: [1], alternates: ['locrianNatural2'] },
  halfDim7flat9:{ primaryScale: 'locrian', avoidNotes: [], alternates: [] },

  // Augmented family
  augmented:    { primaryScale: 'wholeTone', avoidNotes: [], alternates: ['lydianAugmented'] },
  aug7:         { primaryScale: 'wholeTone', avoidNotes: [], alternates: ['lydianAugmented'] },

  // Suspended
  sus4:         { primaryScale: 'mixolydian', avoidNotes: [4], alternates: ['dorian'] },
  sus2:         { primaryScale: 'mixolydian', avoidNotes: [], alternates: ['dorian'] },

  // Special
  min7flat9:    { primaryScale: 'phrygian', avoidNotes: [], alternates: ['aeolian'] },
};

/**
 * Get scales for a chord quality (static, no key context).
 */
export function getScalesForChord(quality: ChordQuality): ChordScaleMapping {
  return STATIC_MAPPINGS[quality] ?? {
    primaryScale: 'ionian',
    avoidNotes: [],
    alternates: [],
  };
}

/**
 * Context-aware chord-scale recommendation.
 * A min7 as ii gets dorian, as vi gets aeolian, as iii gets phrygian, etc.
 */
export function getScalesForChordInContext(
  quality: ChordQuality,
  _keyRoot: number,
  degree: number, // 0-indexed scale degree
): ChordScaleMapping {
  // Degree-specific overrides for common cases
  const degreeOverrides: Partial<Record<ChordQuality, Record<number, ChordScaleMapping>>> = {
    min7: {
      1: { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian', 'bebopDorian'] },      // ii
      2: { primaryScale: 'phrygian', avoidNotes: [1], alternates: ['dorian'] },                    // iii
      5: { primaryScale: 'aeolian', avoidNotes: [8], alternates: ['dorian', 'pentatonicMinor'] },  // vi
    },
    minor: {
      1: { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
      2: { primaryScale: 'phrygian', avoidNotes: [1], alternates: ['dorian'] },
      5: { primaryScale: 'aeolian', avoidNotes: [], alternates: ['dorian', 'pentatonicMinor'] },
    },
    min9: {
      1: { primaryScale: 'dorian', avoidNotes: [], alternates: ['aeolian'] },
      5: { primaryScale: 'aeolian', avoidNotes: [], alternates: ['dorian'] },
    },
    major: {
      0: { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian', 'pentatonicMajor'] },   // I
      3: { primaryScale: 'lydian', avoidNotes: [], alternates: ['ionian'] },                        // IV
    },
    maj7: {
      0: { primaryScale: 'ionian', avoidNotes: [5], alternates: ['lydian', 'bebopMajor'] },
      3: { primaryScale: 'lydian', avoidNotes: [], alternates: ['ionian'] },
    },
    dom7: {
      4: { primaryScale: 'mixolydian', avoidNotes: [5], alternates: ['bebopDominant', 'blues'] },  // V
    },
    halfDim7: {
      6: { primaryScale: 'locrian', avoidNotes: [1], alternates: ['locrianNatural2'] },             // vii
    },
  };

  const override = degreeOverrides[quality]?.[degree];
  if (override) return override;

  return getScalesForChord(quality);
}

/**
 * Compute avoid notes for a chord in a given scale context.
 * Avoid notes are scale tones that form a minor 9th (semitone in upper register)
 * above a chord tone.
 */
export function computeAvoidNotes(chordRoot: number, quality: ChordQuality, scaleMode: ModeType): number[] {
  const chordIntervals = getChordIntervals(quality);
  const scaleIntervals = MODE_TEMPLATES[scaleMode].intervals;
  const avoids: number[] = [];

  // For each chord tone, check if any scale tone is 1 semitone above (minor 9th = 13 semitones)
  for (const ct of chordIntervals) {
    const ctPC = ct % 12;
    for (const st of scaleIntervals) {
      const stPC = st % 12;
      // Check if scale tone is 1 semitone above the chord tone
      if (((stPC - ctPC) % 12 + 12) % 12 === 1) {
        // This scale tone is an avoid note
        if (!chordIntervals.includes(st % 12) && !avoids.includes(((chordRoot + st) % 12 + 12) % 12)) {
          avoids.push(((chordRoot + st) % 12 + 12) % 12);
        }
      }
    }
  }

  return avoids;
}

/** Helper to get chord intervals from quality string */
function getChordIntervals(quality: ChordQuality): number[] {
  return [...CHORD_TEMPLATES[quality].intervals];
}

/**
 * Get tension labels for scale tones relative to a chord.
 * Returns map of pitch class → tension label (9, ♯9, 11, ♯11, 13, etc.)
 */
export function getTensionLabels(chordRoot: number, mode: ModeType): Map<number, string> {
  const labels = new Map<number, string>();
  const scalePCs = modePitchClasses(chordRoot, mode);

  const TENSION_NAMES: Record<number, string> = {
    1: '♭9', 2: '9', 3: '♯9',
    5: '11', 6: '♯11',
    8: '♭13', 9: '13',
  };

  for (const pc of scalePCs) {
    const interval = ((pc - chordRoot) % 12 + 12) % 12;
    const label = TENSION_NAMES[interval];
    if (label) {
      labels.set(pc, label);
    }
  }

  return labels;
}
