import { describe, it, expect } from 'vitest';
import {
  getScalesForChord,
  getScalesForChordInContext,
  getTensionLabels,
} from '../chordScaleTheory';

describe('getScalesForChord', () => {
  it('returns ionian for major', () => {
    const result = getScalesForChord('major');
    expect(result.primaryScale).toBe('ionian');
  });

  it('returns dorian for min7', () => {
    const result = getScalesForChord('min7');
    expect(result.primaryScale).toBe('dorian');
  });

  it('returns mixolydian for dom7', () => {
    const result = getScalesForChord('dom7');
    expect(result.primaryScale).toBe('mixolydian');
  });

  it('returns altered for alt7', () => {
    const result = getScalesForChord('alt7');
    expect(result.primaryScale).toBe('altered');
  });

  it('returns locrian for halfDim7', () => {
    const result = getScalesForChord('halfDim7');
    expect(result.primaryScale).toBe('locrian');
  });

  it('returns wholeTone for augmented', () => {
    const result = getScalesForChord('augmented');
    expect(result.primaryScale).toBe('wholeTone');
  });

  it('returns halfWholeDim for dom7flat9', () => {
    const result = getScalesForChord('dom7flat9');
    expect(result.primaryScale).toBe('halfWholeDim');
  });

  it('includes alternates for common qualities', () => {
    const result = getScalesForChord('dom7');
    expect(result.alternates.length).toBeGreaterThan(0);
  });

  it('returns a default mapping for unknown qualities', () => {
    // Access with a quality that exists but might not have explicit mapping
    const result = getScalesForChord('sus2');
    expect(result.primaryScale).toBeTruthy();
  });

  it('returns avoid notes for major chord', () => {
    const result = getScalesForChord('major');
    expect(result.avoidNotes).toContain(5); // 4th degree (F over C)
  });
});

describe('getScalesForChordInContext', () => {
  it('min7 as ii gets dorian', () => {
    const result = getScalesForChordInContext('min7', 0, 1);
    expect(result.primaryScale).toBe('dorian');
  });

  it('min7 as vi gets aeolian', () => {
    const result = getScalesForChordInContext('min7', 0, 5);
    expect(result.primaryScale).toBe('aeolian');
  });

  it('min7 as iii gets phrygian', () => {
    const result = getScalesForChordInContext('min7', 0, 2);
    expect(result.primaryScale).toBe('phrygian');
  });

  it('maj7 as I gets ionian', () => {
    const result = getScalesForChordInContext('maj7', 0, 0);
    expect(result.primaryScale).toBe('ionian');
  });

  it('maj7 as IV gets lydian', () => {
    const result = getScalesForChordInContext('maj7', 0, 3);
    expect(result.primaryScale).toBe('lydian');
  });

  it('dom7 as V gets mixolydian', () => {
    const result = getScalesForChordInContext('dom7', 0, 4);
    expect(result.primaryScale).toBe('mixolydian');
  });

  it('falls back to static mapping for unmatched degree', () => {
    const result = getScalesForChordInContext('dom7', 0, 6);
    expect(result.primaryScale).toBe('mixolydian');
  });
});

describe('getTensionLabels', () => {
  it('returns tension labels for C mixolydian', () => {
    const labels = getTensionLabels(0, 'mixolydian');
    expect(labels.get(2)).toBe('9');   // D = 9
    expect(labels.get(9)).toBe('13');  // A = 13
  });

  it('returns ♯11 for lydian', () => {
    const labels = getTensionLabels(0, 'lydian');
    expect(labels.get(6)).toBe('♯11'); // F# = ♯11
  });

  it('returns ♭9 for phrygian', () => {
    const labels = getTensionLabels(0, 'phrygian');
    expect(labels.get(1)).toBe('♭9'); // Db = ♭9
  });

  it('returns map with at least one entry for any mode', () => {
    const labels = getTensionLabels(0, 'dorian');
    expect(labels.size).toBeGreaterThan(0);
  });
});
