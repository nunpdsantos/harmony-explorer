/**
 * Upper Structure Triads (USTs): triads played over dominant 7th bass notes.
 * Creates sophisticated extensions and alterations.
 */

import { noteName } from './constants';

export interface UpperStructureTriad {
  /** Interval from dom7 root to UST root */
  rootInterval: number;
  /** Quality of the upper triad */
  quality: 'major' | 'minor';
  /** Notes of the upper triad (pitch classes, 0-based) */
  notes: number[];
  /** Bass notes (root + 3rd + 7th of dom7) */
  bassNotes: number[];
  /** Extensions produced by the UST */
  extensions: string[];
  /** Label (UST II, UST ♭III, etc.) */
  label: string;
  /** Tension level 1-4 */
  tensionLevel: number;
}

/**
 * Standard upper structure triad definitions over a dominant 7th chord.
 * Interval is from the dom7 root; "quality" is the UST triad type.
 */
const UST_DEFINITIONS: Omit<UpperStructureTriad, 'notes' | 'bassNotes'>[] = [
  { rootInterval: 2,  quality: 'major', extensions: ['9', '♯11', '13'],      label: 'UST II',   tensionLevel: 2 },
  { rootInterval: 3,  quality: 'minor', extensions: ['♯9', '♯11', '13'],     label: 'UST ♭iii', tensionLevel: 3 },
  { rootInterval: 3,  quality: 'major', extensions: ['♯9', '5', '♭7'],       label: 'UST ♭III', tensionLevel: 3 },
  { rootInterval: 6,  quality: 'major', extensions: ['♯11', '13', '♭9(oct)'],label: 'UST ♯IV',  tensionLevel: 3 },
  { rootInterval: 8,  quality: 'major', extensions: ['♭13', '♭9(oct)', '3'], label: 'UST ♭VI',  tensionLevel: 4 },
  { rootInterval: 10, quality: 'major', extensions: ['♭7', '9', '♯11'],      label: 'UST ♭VII', tensionLevel: 2 },
  { rootInterval: 9,  quality: 'major', extensions: ['13', '♭9(oct)', '♯9'], label: 'UST VI',   tensionLevel: 3 },
];

/**
 * Get all upper structure triads for a dominant 7th chord.
 */
export function getUpperStructureTriads(dom7Root: number): UpperStructureTriad[] {
  const root = dom7Root % 12;

  // Dom7 bass = root, 3rd (M3=4), 7th (m7=10)
  const bassNotes = [root, (root + 4) % 12, (root + 10) % 12];

  return UST_DEFINITIONS.map(def => {
    const ustRoot = (root + def.rootInterval) % 12;
    const triadIntervals = def.quality === 'major' ? [0, 4, 7] : [0, 3, 7];
    const notes = triadIntervals.map(i => (ustRoot + i) % 12);

    return {
      ...def,
      notes,
      bassNotes,
    };
  });
}

/**
 * Format an upper structure triad for display.
 */
export function formatUST(ust: UpperStructureTriad, dom7Root: number): string {
  const ustRoot = (dom7Root + ust.rootInterval) % 12;
  const quality = ust.quality === 'major' ? '' : 'm';
  return `${noteName(ustRoot)}${quality} / ${noteName(dom7Root)}7`;
}
