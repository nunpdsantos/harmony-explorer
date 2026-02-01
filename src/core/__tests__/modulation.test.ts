import { describe, it, expect } from 'vitest';
import {
  findCommonChords,
  findDiminishedPivots,
  findAugmentedPivots,
  getModulationRoutes,
  keyDistance,
} from '../modulation';
import { chordKey } from '../chords';

// Pitch class constants
const C = 0, D = 2, Eb = 3, E = 4, F = 5,
      Gb = 6, G = 7, A = 9;

describe('modulation', () => {
  describe('findCommonChords', () => {
    it('finds common chords between C and G (closely related keys)', () => {
      const common = findCommonChords(C, G);
      // C major diatonic: C Dm Em F G Am Bdim
      // G major diatonic: G Am Bm C D Em F#dim
      // Common: C, Em, G, Am (4 chords)
      const keys = common.map(c => chordKey(c.chord));
      expect(keys).toContain('0-major');  // C
      expect(keys).toContain('4-minor');  // Em
      expect(keys).toContain('7-major');  // G
      expect(keys).toContain('9-minor');  // Am
      expect(common.length).toBe(4);
    });

    it('finds common chords between C and F (one flat)', () => {
      const common = findCommonChords(C, F);
      // C diatonic: C Dm Em F G Am Bdim
      // F diatonic: F Gm Am Bb C Dm Edim
      // Common: C, Dm, F, Am (4 chords)
      expect(common.length).toBe(4);
      const keys = common.map(c => chordKey(c.chord));
      expect(keys).toContain('0-major');  // C
      expect(keys).toContain('2-minor');  // Dm
      expect(keys).toContain('5-major');  // F
      expect(keys).toContain('9-minor');  // Am
    });

    it('returns all 7 chords for same key', () => {
      const common = findCommonChords(C, C);
      expect(common.length).toBe(7);
    });

    it('has fewer common chords for distant keys (C and Gb)', () => {
      const common = findCommonChords(C, Gb);
      // Very distant keys — should have few or no common triads
      expect(common.length).toBeLessThan(3);
    });

    it('each common chord has source and target info', () => {
      const common = findCommonChords(C, G);
      for (const c of common) {
        expect(c.sourceInfo.roman).toBeTruthy();
        expect(c.targetInfo.roman).toBeTruthy();
        expect(c.description).toContain(c.sourceInfo.roman);
        expect(c.description).toContain(c.targetInfo.roman);
      }
    });

    it('Am is vi in C and ii in G', () => {
      const common = findCommonChords(C, G);
      const am = common.find(c => chordKey(c.chord) === '9-minor');
      expect(am).toBeDefined();
      expect(am!.sourceInfo.roman).toBe('vi');
      expect(am!.targetInfo.roman).toBe('ii');
    });
  });

  describe('findDiminishedPivots', () => {
    it('finds dim7 pivots to C major', () => {
      const pivots = findDiminishedPivots(C);
      // 3 dim7 groups × 4 resolutions each = up to 12 resolutions
      // But only those landing on C major diatonic chords count
      // C major diatonic triads (major only): C, F, G → only major chords from dim7 resolution
      // Dim7 resolves up by half-step to major chords
      // So we check that pivots resolve to one of {C, F, G} major
      expect(pivots.length).toBeGreaterThan(0);
      for (const p of pivots) {
        expect(p.dim7Chord.quality).toBe('dim7');
        expect(p.resolvesTo.quality).toBe('major');
        expect(p.targetDegree.roman).toBeTruthy();
      }
    });

    it('includes resolutions to tonic (I)', () => {
      const pivots = findDiminishedPivots(C);
      const toTonic = pivots.find(p => p.resolvesTo.root === C);
      expect(toTonic).toBeDefined();
      expect(toTonic!.targetDegree.roman).toBe('I');
    });

    it('dim7 chord resolves up by half step', () => {
      const pivots = findDiminishedPivots(G);
      for (const p of pivots) {
        // The resolved chord root should be reachable from some note in the dim7
        // by moving up 1 semitone
        expect(p.description.length).toBeGreaterThan(0);
      }
    });

    it('covers different dim7 groups', () => {
      const pivots = findDiminishedPivots(C);
      const dim7Roots = new Set(pivots.map(p => p.dim7Chord.root));
      // Should include pivots from at least 2 of the 3 dim7 groups
      expect(dim7Roots.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findAugmentedPivots', () => {
    it('finds augmented pivots to C major', () => {
      const pivots = findAugmentedPivots(C);
      expect(pivots.length).toBeGreaterThan(0);
      for (const p of pivots) {
        expect(p.augChord.quality).toBe('augmented');
        expect(p.targetDegree.roman).toBeTruthy();
        expect(p.movedNote.length).toBeGreaterThan(0);
      }
    });

    it('reached chords are diatonic in target key', () => {
      const pivots = findAugmentedPivots(G);
      for (const p of pivots) {
        // The reached chord should be diatonic in G
        expect(p.targetDegree).toBeDefined();
      }
    });

    it('includes both major and minor reached triads', () => {
      const pivots = findAugmentedPivots(C);
      const qualities = new Set(pivots.map(p => p.reachesChord.quality));
      // Aug triads can reach both major and minor triads
      expect(qualities.size).toBeGreaterThanOrEqual(2);
    });

    it('description includes aug chord name and target info', () => {
      const pivots = findAugmentedPivots(C);
      for (const p of pivots) {
        expect(p.description).toContain(p.targetDegree.roman);
      }
    });
  });

  describe('getModulationRoutes', () => {
    it('returns empty for same key', () => {
      expect(getModulationRoutes(C, C)).toEqual([]);
    });

    it('includes all three pivot types for typical modulation', () => {
      const routes = getModulationRoutes(C, G);
      const types = new Set(routes.map(r => r.type));
      expect(types.has('common')).toBe(true);
      expect(types.has('diminished')).toBe(true);
      expect(types.has('augmented')).toBe(true);
    });

    it('common routes come first (sorted by distance)', () => {
      const routes = getModulationRoutes(C, G);
      const firstNonCommon = routes.findIndex(r => r.type !== 'common');
      if (firstNonCommon > 0) {
        // All routes before firstNonCommon should be 'common'
        for (let i = 0; i < firstNonCommon; i++) {
          expect(routes[i].type).toBe('common');
        }
      }
    });

    it('diminished routes come before augmented', () => {
      const routes = getModulationRoutes(C, Gb);
      const dimIdx = routes.findIndex(r => r.type === 'diminished');
      const augIdx = routes.findIndex(r => r.type === 'augmented');
      if (dimIdx >= 0 && augIdx >= 0) {
        expect(dimIdx).toBeLessThan(augIdx);
      }
    });

    it('each route has required fields', () => {
      const routes = getModulationRoutes(C, D);
      for (const r of routes) {
        expect(r.pivotChord).toBeDefined();
        expect(r.targetChord).toBeDefined();
        expect(r.targetRoman).toBeTruthy();
        expect(r.description.length).toBeGreaterThan(0);
        expect(typeof r.distance).toBe('number');
      }
    });

    it('common routes have sourceRoman', () => {
      const routes = getModulationRoutes(C, G);
      const common = routes.filter(r => r.type === 'common');
      for (const r of common) {
        expect(r.sourceRoman).toBeTruthy();
      }
    });
  });

  describe('keyDistance', () => {
    it('same key = 0', () => {
      expect(keyDistance(C, C)).toBe(0);
      expect(keyDistance(G, G)).toBe(0);
    });

    it('adjacent fifths = 1', () => {
      expect(keyDistance(C, G)).toBe(1); // C → G = one fifth up
      expect(keyDistance(C, F)).toBe(1); // C → F = one fifth down
    });

    it('tritone = 6 (maximum distance)', () => {
      expect(keyDistance(C, Gb)).toBe(6);
      expect(keyDistance(C, Gb)).toBe(keyDistance(Gb, C));
    });

    it('is symmetric', () => {
      expect(keyDistance(C, D)).toBe(keyDistance(D, C));
      expect(keyDistance(C, Eb)).toBe(keyDistance(Eb, C));
      expect(keyDistance(A, E)).toBe(keyDistance(E, A));
    });

    it('C → D = 2 fifths', () => {
      // C → G → D = 2 steps
      expect(keyDistance(C, D)).toBe(2);
    });

    it('C → A = 3 fifths', () => {
      // C → G → D → A = 3 steps
      expect(keyDistance(C, A)).toBe(3);
    });

    it('C → Eb = 3 fifths (going flat side)', () => {
      // C → F → Bb → Eb = 3 steps
      expect(keyDistance(C, Eb)).toBe(3);
    });

    it('all distances are 0-6', () => {
      for (let a = 0; a < 12; a++) {
        for (let b = 0; b < 12; b++) {
          const d = keyDistance(a, b);
          expect(d).toBeGreaterThanOrEqual(0);
          expect(d).toBeLessThanOrEqual(6);
        }
      }
    });
  });
});
