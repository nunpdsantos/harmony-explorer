import { describe, it, expect } from 'vitest';
import {
  getColtraneTriangle,
  generateColtraneSubstitution,
  expandIIV_Coltrane,
  analyzeColtraneProgression,
} from '../coltraneChanges';
import { chord } from '../chords';

describe('getColtraneTriangle', () => {
  it('returns three tonal centers a major third apart', () => {
    const [c1, c2, c3] = getColtraneTriangle(0);
    expect(c1).toBe(0);  // C
    expect(c2).toBe(4);  // E
    expect(c3).toBe(8);  // Ab
  });

  it('returns correct centers for B (root=11)', () => {
    const [c1, c2, c3] = getColtraneTriangle(11);
    expect(c1).toBe(11); // B
    expect(c2).toBe(3);  // Eb
    expect(c3).toBe(7);  // G
  });

  it('returns correct centers for G (root=7)', () => {
    const [c1, c2, c3] = getColtraneTriangle(7);
    expect(c1).toBe(7);  // G
    expect(c2).toBe(11); // B
    expect(c3).toBe(3);  // Eb
  });

  it('all centers are mod 12', () => {
    for (let root = 0; root < 12; root++) {
      const triangle = getColtraneTriangle(root);
      for (const center of triangle) {
        expect(center).toBeGreaterThanOrEqual(0);
        expect(center).toBeLessThan(12);
      }
    }
  });

  it('centers are exactly 4 semitones apart', () => {
    for (let root = 0; root < 12; root++) {
      const [c1, c2, c3] = getColtraneTriangle(root);
      expect((c2 - c1 + 12) % 12).toBe(4);
      expect((c3 - c2 + 12) % 12).toBe(4);
      expect((c1 - c3 + 12) % 12).toBe(4);
    }
  });
});

describe('generateColtraneSubstitution', () => {
  it('returns 7 chords', () => {
    const chords = generateColtraneSubstitution(0);
    expect(chords).toHaveLength(7);
  });

  it('starts and ends on the tonic maj7', () => {
    const chords = generateColtraneSubstitution(0);
    expect(chords[0].root).toBe(0);
    expect(chords[0].quality).toBe('maj7');
    expect(chords[6].root).toBe(0);
    expect(chords[6].quality).toBe('maj7');
  });

  it('alternates between maj7 and dom7', () => {
    const chords = generateColtraneSubstitution(0);
    // Pattern: maj7, dom7, maj7, dom7, maj7, dom7, maj7
    expect(chords[0].quality).toBe('maj7');
    expect(chords[1].quality).toBe('dom7');
    expect(chords[2].quality).toBe('maj7');
    expect(chords[3].quality).toBe('dom7');
    expect(chords[4].quality).toBe('maj7');
    expect(chords[5].quality).toBe('dom7');
    expect(chords[6].quality).toBe('maj7');
  });

  it('contains all three tonal centers as maj7 chords', () => {
    const chords = generateColtraneSubstitution(0);
    const [c1, c2, c3] = getColtraneTriangle(0);
    const maj7Roots = chords.filter(c => c.quality === 'maj7').map(c => c.root);
    expect(maj7Roots).toContain(c1);
    expect(maj7Roots).toContain(c2);
    expect(maj7Roots).toContain(c3);
  });

  it('each dom7 is V7 of the following maj7', () => {
    const chords = generateColtraneSubstitution(0);
    // chords[1] (dom7) should be V7 of chords[2] (maj7)
    // V7 root = target root + 7
    expect(chords[1].root).toBe((chords[2].root + 7) % 12);
    expect(chords[3].root).toBe((chords[4].root + 7) % 12);
    expect(chords[5].root).toBe((chords[6].root + 7) % 12);
  });

  it('works for B tonic (classic Giant Steps key)', () => {
    const chords = generateColtraneSubstitution(11);
    expect(chords[0].root).toBe(11);
    expect(chords[0].quality).toBe('maj7');
    expect(chords).toHaveLength(7);
  });
});

describe('expandIIV_Coltrane', () => {
  it('returns 7 chords', () => {
    const chords = expandIIV_Coltrane(0);
    expect(chords).toHaveLength(7);
  });

  it('starts with ii-V of center 2', () => {
    const chords = expandIIV_Coltrane(0);
    const [, c2] = getColtraneTriangle(0);
    // First chord: ii of c2 = c2 + 5 semitones, min7
    expect(chords[0].root).toBe((c2 + 5) % 12);
    expect(chords[0].quality).toBe('min7');
    // Second chord: V7 of c2
    expect(chords[1].root).toBe((c2 + 7) % 12);
    expect(chords[1].quality).toBe('dom7');
  });

  it('ends on the home tonic', () => {
    const chords = expandIIV_Coltrane(0);
    expect(chords[6].root).toBe(0);
    expect(chords[6].quality).toBe('maj7');
  });

  it('contains all three tonal centers', () => {
    const chords = expandIIV_Coltrane(0);
    const [c1, c2, c3] = getColtraneTriangle(0);
    const roots = chords.map(c => c.root);
    expect(roots).toContain(c1);
    expect(roots).toContain(c2);
    expect(roots).toContain(c3);
  });
});

describe('analyzeColtraneProgression', () => {
  it('detects a Coltrane progression', () => {
    const chords = generateColtraneSubstitution(0);
    const result = analyzeColtraneProgression(chords);
    expect(result.detected).toBe(true);
    expect(result.tonalCenters.length).toBeGreaterThanOrEqual(3);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('returns detected=false for short progressions', () => {
    const result = analyzeColtraneProgression([chord(0, 'major'), chord(7, 'major')]);
    expect(result.detected).toBe(false);
  });

  it('returns detected=false for non-Coltrane progression', () => {
    const progression = [
      chord(0, 'major'),
      chord(5, 'major'),
      chord(7, 'major'),
      chord(0, 'major'),
    ];
    const result = analyzeColtraneProgression(progression);
    // I-IV-V-I has no major third relationships
    expect(result.detected).toBe(false);
  });

  it('detects tonal centers that are major thirds apart', () => {
    const chords = generateColtraneSubstitution(11);
    const result = analyzeColtraneProgression(chords);
    expect(result.detected).toBe(true);
    const centers = new Set(result.tonalCenters);
    expect(centers.has(11)).toBe(true); // B
    expect(centers.has(3)).toBe(true);  // Eb
    expect(centers.has(7)).toBe(true);  // G
  });

  it('returns empty tonalCenters for non-detection', () => {
    const result = analyzeColtraneProgression([]);
    expect(result.tonalCenters).toEqual([]);
    expect(result.confidence).toBe(0);
  });

  it('confidence increases with V7 chords present', () => {
    // Just major chords at third-apart centers
    const noV7 = [
      chord(0, 'maj7'),
      chord(4, 'maj7'),
      chord(8, 'maj7'),
    ];
    const withV7 = [
      chord(0, 'maj7'),
      chord(11, 'dom7'), // V7 of E
      chord(4, 'maj7'),
      chord(3, 'dom7'),  // V7 of Ab
      chord(8, 'maj7'),
      chord(7, 'dom7'),  // V7 of C
      chord(0, 'maj7'),
    ];

    const r1 = analyzeColtraneProgression(noV7);
    const r2 = analyzeColtraneProgression(withV7);
    expect(r2.confidence).toBeGreaterThanOrEqual(r1.confidence);
  });
});
