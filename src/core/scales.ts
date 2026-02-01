import { SCALE_TEMPLATES, type ScaleType, type ChordQuality } from './constants';
import { chord, type Chord } from './chords';

/** Get the pitch classes of a scale */
export function scalePitchClasses(root: number, type: ScaleType): number[] {
  return SCALE_TEMPLATES[type].map(i => ((root + i) % 12 + 12) % 12);
}

/** Diatonic chord qualities for each scale degree */
const DIATONIC_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major:         ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  naturalMinor:  ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  harmonicMinor: ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
  melodicMinor:  ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'],
};

/** Diatonic 7th chord qualities for each scale degree */
const DIATONIC_7TH_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major:         ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'halfDim7'],
  naturalMinor:  ['min7', 'halfDim7', 'maj7', 'min7', 'min7', 'maj7', 'dom7'],
  harmonicMinor: ['minMaj7', 'halfDim7', 'aug7', 'min7', 'dom7', 'maj7', 'dim7'],
  melodicMinor:  ['minMaj7', 'min7', 'aug7', 'dom7', 'dom7', 'halfDim7', 'halfDim7'],
};

/** Diatonic 9th chord qualities for each scale degree */
export const DIATONIC_9TH_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major:         ['maj9', 'min9', 'min7flat9', 'maj9', 'dom9', 'min9', 'halfDim7flat9'],
  naturalMinor:  ['min9', 'halfDim7flat9', 'maj9', 'min9', 'min7flat9', 'maj9', 'dom9'],
  harmonicMinor: ['minMaj7', 'halfDim7flat9', 'aug7', 'min9', 'dom7flat9', 'maj9', 'dim7'],
  melodicMinor:  ['minMaj7', 'min9', 'aug7', 'dom9', 'dom9', 'halfDim7flat9', 'halfDim7flat9'],
};

/** Diatonic 13th chord qualities for each scale degree */
export const DIATONIC_13TH_QUALITIES: Record<ScaleType, ChordQuality[]> = {
  major:         ['maj13', 'min13', 'min7flat9', 'maj13', 'dom13', 'min13', 'halfDim7flat9'],
  naturalMinor:  ['min13', 'halfDim7flat9', 'maj13', 'min13', 'min7flat9', 'maj13', 'dom13'],
  harmonicMinor: ['minMaj7', 'halfDim7flat9', 'aug7', 'min13', 'dom13', 'maj13', 'dim7'],
  melodicMinor:  ['minMaj7', 'min13', 'aug7', 'dom13', 'dom13', 'halfDim7flat9', 'halfDim7flat9'],
};

/** Get the diatonic triads for a scale */
export function diatonicTriads(root: number, type: ScaleType): Chord[] {
  const pcs = scalePitchClasses(root, type);
  return pcs.map((pc, i) => chord(pc, DIATONIC_QUALITIES[type][i]));
}

/** Get the diatonic 7th chords for a scale */
export function diatonic7ths(root: number, type: ScaleType): Chord[] {
  const pcs = scalePitchClasses(root, type);
  return pcs.map((pc, i) => chord(pc, DIATONIC_7TH_QUALITIES[type][i]));
}

/** Get the diatonic 9th chords for a scale */
export function diatonic9ths(root: number, type: ScaleType): Chord[] {
  const pcs = scalePitchClasses(root, type);
  return pcs.map((pc, i) => chord(pc, DIATONIC_9TH_QUALITIES[type][i]));
}

/** Get the diatonic 13th chords for a scale */
export function diatonic13ths(root: number, type: ScaleType): Chord[] {
  const pcs = scalePitchClasses(root, type);
  return pcs.map((pc, i) => chord(pc, DIATONIC_13TH_QUALITIES[type][i]));
}

/** Get the tonal function of a scale degree (0-indexed) in major */
export function tonalFunction(degree: number): 'tonic' | 'subdominant' | 'dominant' {
  // I, III, VI = tonic; II, IV = subdominant; V, VII = dominant
  if (degree === 0 || degree === 2 || degree === 5) return 'tonic';
  if (degree === 1 || degree === 3) return 'subdominant';
  return 'dominant'; // 4 (V) or 6 (VII)
}

/** Find which scale degree a chord root corresponds to (returns -1 if not diatonic) */
export function findScaleDegree(chordRoot: number, scaleRoot: number, scaleType: ScaleType): number {
  const pcs = scalePitchClasses(scaleRoot, scaleType);
  return pcs.indexOf(((chordRoot % 12) + 12) % 12);
}
