import type { Chord } from '../core/chords';
import { chordName } from '../core/chords';
import { noteName } from '../core/constants';

/**
 * Progression sharing: JSON export/import and URL encoding.
 */

export interface ExportedProgression {
  name: string;
  key: number;
  chords: Chord[];
  version: 1;
}

/** Export a progression as a JSON string */
export function exportProgressionAsJson(
  chords: Chord[],
  keyRoot: number,
  name: string = 'Untitled',
): string {
  const data: ExportedProgression = {
    name,
    key: keyRoot,
    chords,
    version: 1,
  };
  return JSON.stringify(data, null, 2);
}

/** Import a progression from a JSON string. Returns null if invalid. */
export function importProgressionFromJson(json: string): ExportedProgression | null {
  try {
    const data = JSON.parse(json);
    if (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.chords) &&
      typeof data.key === 'number' &&
      data.chords.every((c: unknown) =>
        typeof c === 'object' && c !== null &&
        'root' in c && 'quality' in c &&
        typeof (c as Chord).root === 'number' &&
        typeof (c as Chord).quality === 'string'
      )
    ) {
      return {
        name: data.name ?? 'Imported',
        key: data.key,
        chords: data.chords,
        version: 1,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Trigger a browser download of a JSON file */
export function downloadJson(content: string, filename: string = 'progression.json'): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Encode a progression into a URL-safe hash string.
 * Format: key=<root>&c=<root>.<quality>,<root>.<quality>,...
 */
export function encodeProgressionToHash(chords: Chord[], keyRoot: number): string {
  if (chords.length === 0) return '';
  const chordStr = chords.map(c => `${c.root}.${c.quality}`).join(',');
  return `key=${keyRoot}&c=${chordStr}`;
}

/** Decode a progression from a URL hash string. Returns null if invalid. */
export function decodeProgressionFromHash(hash: string): { chords: Chord[]; keyRoot: number } | null {
  try {
    const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
    const params = new URLSearchParams(cleaned);
    const keyStr = params.get('key');
    const chordsStr = params.get('c');

    if (!keyStr || !chordsStr) return null;

    const keyRoot = parseInt(keyStr, 10);
    if (isNaN(keyRoot) || keyRoot < 0 || keyRoot > 11) return null;

    const chords: Chord[] = chordsStr.split(',').map(part => {
      const [rootStr, quality] = part.split('.');
      const root = parseInt(rootStr, 10);
      if (isNaN(root)) throw new Error('Invalid root');
      return { root, quality } as Chord;
    });

    if (chords.length === 0) return null;
    return { chords, keyRoot };
  } catch {
    return null;
  }
}

/** Generate a shareable URL for the current page with progression in hash */
export function generateShareUrl(chords: Chord[], keyRoot: number): string {
  const hash = encodeProgressionToHash(chords, keyRoot);
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}

/** Generate a text summary of a progression for clipboard sharing */
export function progressionToText(chords: Chord[], keyRoot: number): string {
  const names = chords.map(c => chordName(c));
  return `${names.join(' \u2192 ')} (Key: ${noteName(keyRoot)})`;
}
