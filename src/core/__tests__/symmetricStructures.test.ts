import { describe, it, expect } from 'vitest';
import {
  getDiminished7thGroups,
  getDiminishedResolutions,
  getAugmentedReachability,
  getTritoneSubPairs,
  getUniqueAugmentedTriads,
} from '../symmetricStructures';
import { chordPitchClasses } from '../chords';

describe('getDiminished7thGroups', () => {
  it('returns 3 groups', () => {
    const groups = getDiminished7thGroups();
    expect(groups).toHaveLength(3);
  });

  it('each group has 4 chords', () => {
    const groups = getDiminished7thGroups();
    for (const group of groups) {
      expect(group).toHaveLength(4);
    }
  });

  it('all chords are dim7', () => {
    const groups = getDiminished7thGroups();
    for (const group of groups) {
      for (const chord of group) {
        expect(chord.quality).toBe('dim7');
      }
    }
  });

  it('all 3 groups together cover all 12 pitch classes', () => {
    const groups = getDiminished7thGroups();
    const allPCs = new Set<number>();
    for (const group of groups) {
      // Each dim7 chord in a group has the same pitch classes
      const pcs = chordPitchClasses(group[0]);
      for (const pc of pcs) allPCs.add(pc);
    }
    expect(allPCs.size).toBe(12);
  });

  it('chords within a group are enharmonically equivalent', () => {
    const groups = getDiminished7thGroups();
    for (const group of groups) {
      const refPCs = new Set(chordPitchClasses(group[0]));
      for (const chord of group) {
        const pcs = chordPitchClasses(chord);
        for (const pc of pcs) {
          expect(refPCs.has(pc)).toBe(true);
        }
      }
    }
  });
});

describe('getDiminishedResolutions', () => {
  it('returns 4 resolutions for each dim7', () => {
    const resolutions = getDiminishedResolutions({ root: 0, quality: 'dim7' });
    expect(resolutions).toHaveLength(4);
  });

  it('all resolutions are major chords', () => {
    const resolutions = getDiminishedResolutions({ root: 0, quality: 'dim7' });
    for (const chord of resolutions) {
      expect(chord.quality).toBe('major');
    }
  });

  it('resolution roots are each half step above a dim7 note', () => {
    const dim7 = { root: 0, quality: 'dim7' as const };
    const pcs = chordPitchClasses(dim7); // [0, 3, 6, 9]
    const resolutions = getDiminishedResolutions(dim7);
    const resRoots = resolutions.map(c => c.root).sort((a, b) => a - b);
    const expected = pcs.map(pc => (pc + 1) % 12).sort((a, b) => a - b);
    expect(resRoots).toEqual(expected);
  });
});

describe('getAugmentedReachability', () => {
  it('returns 6 reachable triads', () => {
    const reach = getAugmentedReachability(0); // C+
    expect(reach.reachableTriads).toHaveLength(6);
  });

  it('augmented chord is correct', () => {
    const reach = getAugmentedReachability(0);
    expect(reach.augChord.root).toBe(0);
    expect(reach.augChord.quality).toBe('augmented');
  });

  it('all reachable triads are major or minor', () => {
    const reach = getAugmentedReachability(0);
    for (const t of reach.reachableTriads) {
      expect(['major', 'minor']).toContain(t.triad.quality);
    }
  });

  it('has both up and down directions', () => {
    const reach = getAugmentedReachability(0);
    const directions = reach.reachableTriads.map(t => t.direction);
    expect(directions).toContain('up');
    expect(directions).toContain('down');
  });
});

describe('getTritoneSubPairs', () => {
  it('returns 6 pairs', () => {
    const pairs = getTritoneSubPairs();
    expect(pairs).toHaveLength(6);
  });

  it('each pair has two dom7 chords a tritone apart', () => {
    const pairs = getTritoneSubPairs();
    for (const pair of pairs) {
      expect(pair.dom7.quality).toBe('dom7');
      expect(pair.tritoneSubDom7.quality).toBe('dom7');
      const interval = ((pair.tritoneSubDom7.root - pair.dom7.root) % 12 + 12) % 12;
      expect(interval).toBe(6);
    }
  });

  it('shared tritone contains two pitch classes', () => {
    const pairs = getTritoneSubPairs();
    for (const pair of pairs) {
      expect(pair.sharedTritone).toHaveLength(2);
    }
  });

  it('common resolution is a major chord', () => {
    const pairs = getTritoneSubPairs();
    for (const pair of pairs) {
      expect(pair.commonResolution.quality).toBe('major');
    }
  });
});

describe('getUniqueAugmentedTriads', () => {
  it('returns 4 augmented triads', () => {
    const triads = getUniqueAugmentedTriads();
    expect(triads).toHaveLength(4);
  });

  it('all are augmented quality', () => {
    const triads = getUniqueAugmentedTriads();
    for (const t of triads) {
      expect(t.quality).toBe('augmented');
    }
  });

  it('roots are 0,1,2,3', () => {
    const triads = getUniqueAugmentedTriads();
    const roots = triads.map(t => t.root);
    expect(roots).toEqual([0, 1, 2, 3]);
  });
});
