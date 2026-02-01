import { chord, chordPitchClasses, type Chord } from './chords';
import { noteName } from './constants';

/**
 * Diminished 7th chord groups.
 * There are only 3 unique dim7 chords (enharmonically), each containing 4 notes
 * separated by minor thirds (3 semitones). Together they cover all 12 pitch classes.
 *
 * Group 0: {C, Eb, Gb, A}    = C°7 = Eb°7 = Gb°7 = A°7
 * Group 1: {Db, E, G, Bb}    = Db°7 = E°7 = G°7 = Bb°7
 * Group 2: {D, F, Ab, B}     = D°7 = F°7 = Ab°7 = B°7
 */
export function getDiminished7thGroups(): Chord[][] {
  const groups: Chord[][] = [];
  for (let g = 0; g < 3; g++) {
    const group: Chord[] = [];
    for (let i = 0; i < 4; i++) {
      group.push(chord(g + i * 3, 'dim7'));
    }
    groups.push(group);
  }
  return groups;
}

/**
 * Get the 4 major chords reachable by half-step resolution from a dim7 chord.
 * Each note of the dim7 can resolve up by half-step to become the root of a major chord.
 * E.g. C°7 = {C, Eb, Gb, A} → resolves to Db, E, G, Bb major
 */
export function getDiminishedResolutions(dim7: Chord): Chord[] {
  const pcs = chordPitchClasses(dim7);
  return pcs.map(pc => chord((pc + 1) % 12, 'major'));
}

/**
 * Augmented triad reachability.
 * An augmented triad has 3 notes separated by major thirds (4 semitones).
 * By moving any one note by ±1 semitone, you can reach 6 different triads.
 *
 * E.g. C+ = {C, E, G#}
 *   C→B:  E major (B, E, G#)   — wait, that's actually... let's be precise:
 *   Move C down  → B:  gives {B, E, G#}  = E major (1st inv)  → E major
 *   Move C up    → C#: gives {C#, E, G#} = C# minor           → C# minor (enharmonic Db minor)
 *   Move E down  → Eb: gives {C, Eb, G#} = Ab major (1st inv) → Ab major
 *   Move E up    → F:  gives {C, F, G#}  = F minor (1st inv)  → F minor
 *   Move G# down → G:  gives {C, E, G}   = C major            → C major
 *   Move G# up   → A:  gives {C, E, A}   = A minor (1st inv)  → A minor
 */
export interface AugmentedReachability {
  augChord: Chord;
  reachableTriads: {
    triad: Chord;
    movedNote: number;     // The pitch class that was moved
    direction: 'up' | 'down';
    description: string;   // e.g. "G# ↓ G"
  }[];
}

export function getAugmentedReachability(augRoot: number): AugmentedReachability {
  const augChord = chord(augRoot, 'augmented');
  const notes = chordPitchClasses(augChord); // [root, root+4, root+8]
  const reachableTriads: AugmentedReachability['reachableTriads'] = [];

  for (const note of notes) {
    // Move down by 1 semitone
    const down = (note + 11) % 12;
    const downTriad = identifyTriadFromPitches(
      notes.map(n => n === note ? down : n)
    );
    if (downTriad) {
      reachableTriads.push({
        triad: downTriad,
        movedNote: note,
        direction: 'down',
        description: `${noteName(note)} \u2193 ${noteName(down)}`,
      });
    }

    // Move up by 1 semitone
    const up = (note + 1) % 12;
    const upTriad = identifyTriadFromPitches(
      notes.map(n => n === note ? up : n)
    );
    if (upTriad) {
      reachableTriads.push({
        triad: upTriad,
        movedNote: note,
        direction: 'up',
        description: `${noteName(note)} \u2191 ${noteName(up)}`,
      });
    }
  }

  return { augChord, reachableTriads };
}

/**
 * Identify a triad (major or minor) from 3 pitch classes.
 * Tries all 3 rotations to find root position.
 */
function identifyTriadFromPitches(pcs: number[]): Chord | null {
  const sorted = [...pcs].map(p => ((p % 12) + 12) % 12);
  // Try each note as root
  for (const root of sorted) {
    const intervals = sorted.map(p => ((p - root) % 12 + 12) % 12).sort((a, b) => a - b);
    const key = intervals.join(',');
    if (key === '0,4,7') return chord(root, 'major');
    if (key === '0,3,7') return chord(root, 'minor');
  }
  return null;
}

/**
 * Tritone substitution pairs.
 * For each dominant 7th chord, its tritone sub shares the same tritone (3rd and 7th swap).
 * There are 6 unique pairs since roots are a tritone (6 semitones) apart.
 *
 * E.g. G7 (G, B, D, F) and Db7 (Db, F, Ab, Cb/B) — shared tritone is B-F
 */
export interface TritoneSubPair {
  dom7: Chord;
  tritoneSubDom7: Chord;
  sharedTritone: [number, number]; // The two shared pitch classes (3rd of one = 7th of other)
  commonResolution: Chord;         // Both resolve to same major chord
}

export function getTritoneSubPairs(): TritoneSubPair[] {
  const pairs: TritoneSubPair[] = [];
  for (let root = 0; root < 6; root++) {
    const dom = chord(root, 'dom7');
    const subRoot = (root + 6) % 12;
    const sub = chord(subRoot, 'dom7');

    // The third of dom (root + 4) = seventh of sub (subRoot + 10)
    // The seventh of dom (root + 10) = third of sub (subRoot + 4)
    const third = (root + 4) % 12;
    const seventh = (root + 10) % 12;

    // Both resolve down a fifth to the same tonic
    // dom resolves to (root + 5) % 12, sub resolves to (subRoot + 5) % 12
    // Actually dom resolves to root-7 semitones = root+5, sub resolves to subRoot+5
    // root+5 and (root+6)+5 = root+11 — different!
    // Correction: V7→I means dom resolves down a fifth, sub also resolves down a fifth
    // G7→C and Db7→Gb, but they share resolution to C (G7→C naturally, Db7→C as tritone sub)
    const resolution = chord((root + 5) % 12, 'major');

    pairs.push({
      dom7: dom,
      tritoneSubDom7: sub,
      sharedTritone: [third, seventh],
      commonResolution: resolution,
    });
  }
  return pairs;
}

/**
 * Get the 4 unique augmented triads (C+, Db+, D+, Eb+).
 * Each subsequent one covers 3 different pitch classes,
 * and together the 4 unique ones cover all 12 pitch classes.
 */
export function getUniqueAugmentedTriads(): Chord[] {
  return [0, 1, 2, 3].map(r => chord(r, 'augmented'));
}
