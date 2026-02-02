import { CHORD_TEMPLATES, type ChordQuality } from './constants';

// ---------------------------------------------------------------------------
// Guitar tuning & fretboard utilities
// ---------------------------------------------------------------------------

/** Standard tuning MIDI note numbers for open strings (low to high) */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4

export type Tuning = number[];

/** Named tunings */
export const TUNINGS: Record<string, Tuning> = {
  standard: [40, 45, 50, 55, 59, 64],
  dropD: [38, 45, 50, 55, 59, 64],
  openG: [38, 43, 50, 55, 59, 62],
  openD: [38, 45, 50, 54, 57, 62],
  dadgad: [38, 45, 50, 55, 57, 62],
};

export const TUNING_NAMES: string[] = Object.keys(TUNINGS);

/**
 * Get the MIDI note for a given string and fret.
 * String 0 = lowest (E2 in standard), fret 0 = open.
 */
export function midiNote(stringIndex: number, fret: number, tuning: Tuning = STANDARD_TUNING): number {
  return tuning[stringIndex] + fret;
}

/**
 * Get the pitch class (0-11) for a given string and fret.
 */
export function pitchClass(stringIndex: number, fret: number, tuning: Tuning = STANDARD_TUNING): number {
  return midiNote(stringIndex, fret, tuning) % 12;
}

// ---------------------------------------------------------------------------
// Chord shape representation
// ---------------------------------------------------------------------------

/**
 * A guitar chord shape.
 * frets[i] = fret number for string i (0 = open, -1 = muted/not played).
 * String 0 = lowest (6th string in standard).
 */
export interface GuitarChordShape {
  /** Fret for each string. -1 means muted. */
  frets: number[];
  /** Minimum fret position (for barre indicator). 0 = open position. */
  baseFret: number;
  /** Human-readable name for the voicing variant */
  label: string;
}

// ---------------------------------------------------------------------------
// Common chord shapes (root-relative, root = pitch class 0)
// Then transposed by adding semitones to each fret.
// ---------------------------------------------------------------------------

/**
 * Shape templates are relative to root on fret 0 of their anchor string.
 * We store the actual fret offsets for standard tuning.
 *
 * For simplicity, we precompute common open and barre shapes for each quality,
 * keyed from C (root=0). To get any root, we'll compute on the fly.
 */

interface ShapeTemplate {
  quality: ChordQuality;
  /** Frets for each of 6 strings from low E. -1 = muted. */
  frets: number[];
  /** Which string is the root (0-5) */
  rootString: number;
  label: string;
}

const SHAPE_TEMPLATES: ShapeTemplate[] = [
  // Major - E form barre (root on 6th string)
  { quality: 'major', frets: [0, 2, 2, 1, 0, 0], rootString: 0, label: 'E form' },
  // Major - A form barre (root on 5th string)
  { quality: 'major', frets: [-1, 0, 2, 2, 2, 0], rootString: 1, label: 'A form' },

  // Minor - Em form barre (root on 6th string)
  { quality: 'minor', frets: [0, 2, 2, 0, 0, 0], rootString: 0, label: 'Em form' },
  // Minor - Am form barre (root on 5th string)
  { quality: 'minor', frets: [-1, 0, 2, 2, 1, 0], rootString: 1, label: 'Am form' },

  // dom7 - E7 form (root on 6th string)
  { quality: 'dom7', frets: [0, 2, 0, 1, 0, 0], rootString: 0, label: 'E7 form' },
  // dom7 - A7 form (root on 5th string)
  { quality: 'dom7', frets: [-1, 0, 2, 0, 2, 0], rootString: 1, label: 'A7 form' },

  // maj7 - form (root on 6th string)
  { quality: 'maj7', frets: [0, 2, 1, 1, 0, 0], rootString: 0, label: 'Emaj7 form' },
  // maj7 - form (root on 5th string)
  { quality: 'maj7', frets: [-1, 0, 2, 1, 2, 0], rootString: 1, label: 'Amaj7 form' },

  // min7 - Em7 form (root on 6th string)
  { quality: 'min7', frets: [0, 2, 0, 0, 0, 0], rootString: 0, label: 'Em7 form' },
  // min7 - Am7 form (root on 5th string)
  { quality: 'min7', frets: [-1, 0, 2, 0, 1, 0], rootString: 1, label: 'Am7 form' },

  // diminished
  { quality: 'diminished', frets: [-1, -1, 0, 1, 0, 1], rootString: 2, label: 'Dim' },

  // augmented
  { quality: 'augmented', frets: [-1, -1, 2, 1, 1, 0], rootString: 2, label: 'Aug' },

  // dim7
  { quality: 'dim7', frets: [-1, -1, 0, 1, 0, 1], rootString: 2, label: 'Dim7' },

  // halfDim7
  { quality: 'halfDim7', frets: [-1, -1, 0, 1, 0, 1], rootString: 2, label: 'm7b5' },

  // sus4
  { quality: 'sus4', frets: [0, 2, 2, 2, 0, 0], rootString: 0, label: 'Sus4' },

  // sus2
  { quality: 'sus2', frets: [0, 2, 2, -1, 0, 0], rootString: 0, label: 'Sus2' },
];

/**
 * Compute guitar chord shapes for a given root and quality.
 * Transposes the template shapes to the target root pitch class.
 *
 * @returns Array of playable chord shapes (may be empty for exotic qualities)
 */
export function getGuitarShapes(
  root: number,
  quality: ChordQuality,
  tuning: Tuning = STANDARD_TUNING,
): GuitarChordShape[] {
  const templates = SHAPE_TEMPLATES.filter(t => t.quality === quality);

  if (templates.length === 0) {
    // For exotic qualities, generate a basic shape from intervals
    return generateFromIntervals(root, quality, tuning);
  }

  const shapes: GuitarChordShape[] = [];

  for (const template of templates) {
    // The template is designed so that the root string at fret 0 = pitch class 0 (C).
    // To get the desired root, we shift all frets by the offset needed.
    const openPc = tuning[template.rootString] % 12;
    const offset = ((root - openPc) % 12 + 12) % 12;

    const frets = template.frets.map(f => (f === -1 ? -1 : f + offset));

    // Skip if any fret goes too high for practical playing
    const maxFret = Math.max(...frets.filter(f => f >= 0));
    if (maxFret > 15) continue;

    const baseFret = Math.min(...frets.filter(f => f > 0), maxFret);

    shapes.push({
      frets,
      baseFret: baseFret > 3 ? baseFret : 0,
      label: template.label,
    });
  }

  return shapes;
}

/**
 * Fallback: generate a shape from chord intervals when no template exists.
 */
function generateFromIntervals(
  root: number,
  quality: ChordQuality,
  tuning: Tuning,
): GuitarChordShape[] {
  const template = CHORD_TEMPLATES[quality];
  if (!template) return [];

  const targetPcs = new Set(template.intervals.map((i: number) => (root + i) % 12));
  const frets: number[] = [];

  // For each string, find the lowest fret (0-7) that gives a target pitch class
  for (let s = 0; s < tuning.length; s++) {
    let found = -1;
    for (let f = 0; f <= 7; f++) {
      if (targetPcs.has((tuning[s] + f) % 12)) {
        found = f;
        break;
      }
    }
    frets.push(found);
  }

  const playedFrets = frets.filter(f => f >= 0);
  if (playedFrets.length < 3) return [];

  const baseFret = Math.min(...playedFrets.filter(f => f > 0), 0);

  return [{
    frets,
    baseFret: baseFret > 3 ? baseFret : 0,
    label: 'Auto',
  }];
}

/**
 * Get the MIDI notes produced by a chord shape.
 */
export function shapeMidiNotes(
  shape: GuitarChordShape,
  tuning: Tuning = STANDARD_TUNING,
): number[] {
  const notes: number[] = [];
  for (let s = 0; s < shape.frets.length; s++) {
    if (shape.frets[s] >= 0) {
      notes.push(midiNote(s, shape.frets[s], tuning));
    }
  }
  return notes;
}

/**
 * Get pitch classes produced by a chord shape.
 */
export function shapePitchClasses(
  shape: GuitarChordShape,
  tuning: Tuning = STANDARD_TUNING,
): number[] {
  return shapeMidiNotes(shape, tuning).map(n => n % 12);
}
