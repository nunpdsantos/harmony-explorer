import { describe, it, expect } from 'vitest';
import { getSecondaryDominants, isSecondaryDominant } from '../secondaryDominants';
import { noteName } from '../constants';

describe('getSecondaryDominants', () => {
  it('returns 5 secondary dominants for C major', () => {
    const sds = getSecondaryDominants(0);
    expect(sds).toHaveLength(5);
  });

  it('C major secondaries are A7, B7, C7, D7, E7', () => {
    const sds = getSecondaryDominants(0);
    const roots = sds.map(sd => noteName(sd.dom7.root)).sort();
    expect(roots).toEqual(['A', 'B', 'C', 'D', 'E'].sort());
  });

  it('all secondary dominants have dom7 quality', () => {
    const sds = getSecondaryDominants(0);
    for (const sd of sds) {
      expect(sd.dom7.quality).toBe('dom7');
    }
  });

  it('each secondary dominant root is a fifth above its target', () => {
    const sds = getSecondaryDominants(0);
    for (const sd of sds) {
      const interval = ((sd.dom7.root - sd.target.root) % 12 + 12) % 12;
      expect(interval).toBe(7);
    }
  });

  it('labels follow V7/X pattern', () => {
    const sds = getSecondaryDominants(0);
    for (const sd of sds) {
      expect(sd.label).toMatch(/^V7\//);
    }
  });

  it('target degrees are ii, iii, IV, V, vi (1,2,3,4,5)', () => {
    const sds = getSecondaryDominants(0);
    const degrees = sds.map(sd => sd.targetDegree).sort();
    expect(degrees).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('isSecondaryDominant', () => {
  it('A7 is a secondary dominant in C major', () => {
    const result = isSecondaryDominant({ root: 9, quality: 'dom7' }, 0);
    expect(result).not.toBeNull();
    expect(result!.label).toBe('V7/ii');
  });

  it('G7 is not a secondary dominant in C major (it is the primary V7)', () => {
    // G is the diatonic V, not in the secondary dominant list
    const result = isSecondaryDominant({ root: 7, quality: 'dom7' }, 0);
    // G7 has root 7, V/V would have root (7+7)%12=2=D, so G7 is not in the list
    // Actually, check: the targets are ii(2), iii(4), IV(5), V(7), vi(9)
    // dom roots would be: V/ii=9(A), V/iii=11(B), V/IV=0(C), V/V=2(D), V/vi=4(E)
    // G=7 is not among [9,11,0,2,4], so null
    expect(result).toBeNull();
  });

  it('C major chord is not a secondary dominant', () => {
    const result = isSecondaryDominant({ root: 0, quality: 'major' }, 0);
    expect(result).toBeNull();
  });

  it('D7 is V7/V in C major', () => {
    const result = isSecondaryDominant({ root: 2, quality: 'dom7' }, 0);
    expect(result).not.toBeNull();
    expect(result!.label).toBe('V7/V');
  });
});
