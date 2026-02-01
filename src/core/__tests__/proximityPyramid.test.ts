import { describe, it, expect } from 'vitest';
import { buildProximityPyramid } from '../proximityPyramid';
import type { Chord } from '../chords';

const C_MAJOR: Chord = { root: 0, quality: 'major' };

describe('buildProximityPyramid', () => {
  it('returns levels sorted by descending shared note count', () => {
    const levels = buildProximityPyramid(C_MAJOR);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].sharedCount).toBeLessThan(levels[i - 1].sharedCount);
    }
  });

  it('does not include the reference chord itself', () => {
    const levels = buildProximityPyramid(C_MAJOR);
    for (const level of levels) {
      for (const chord of level.chords) {
        expect(chord.root === 0 && chord.quality === 'major').toBe(false);
      }
    }
  });

  it('with major+minor, covers all non-self chords (23 total)', () => {
    const levels = buildProximityPyramid(C_MAJOR, ['major', 'minor']);
    const total = levels.reduce((sum, l) => sum + l.chords.length, 0);
    expect(total).toBe(23); // 12 major + 12 minor - 1 (self)
  });

  it('all shared counts are non-negative', () => {
    const levels = buildProximityPyramid(C_MAJOR);
    for (const level of levels) {
      expect(level.sharedCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('top level has highest shared count', () => {
    const levels = buildProximityPyramid(C_MAJOR);
    expect(levels[0].sharedCount).toBeGreaterThan(0);
  });

  it('works with custom quality list', () => {
    const levels = buildProximityPyramid(C_MAJOR, ['major']);
    const total = levels.reduce((sum, l) => sum + l.chords.length, 0);
    expect(total).toBe(11); // 12 major - 1 (self)
  });
});
