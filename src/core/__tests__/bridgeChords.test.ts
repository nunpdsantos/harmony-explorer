import { describe, it, expect } from 'vitest';
import {
  suggestBridgeChords,
  findChromaticBassLines,
  suggestBridgesForProgression,
} from '../bridgeChords';
import { chord } from '../chords';

// Pitch class constants for readability
const C = 0, Db = 1, D = 2, Eb = 3, E = 4, F = 5,
      Gb = 6, G = 7, Ab = 8, A = 9, B = 11;

describe('bridgeChords', () => {
  describe('suggestBridgeChords', () => {
    it('suggests tritone sub, passing dim, and secondary dominant', () => {
      // G major → C major: V7/C = G7 (excluded: same as from root), so use D→G instead
      // D major → G major: V7/G = D7 (excluded: same as from root)
      // Use C → D: V7/D = A7 (root=9), tritone sub = Eb7 (root=3)
      const results = suggestBridgeChords(chord(C, 'major'), chord(D, 'major'));
      const types = results.map(r => r.type);
      expect(types).toContain('tritone-sub');
      expect(types).toContain('passing-dim');
      expect(types).toContain('secondary-dom');
    });

    it('tritone sub has dom7 quality', () => {
      const results = suggestBridgeChords(chord(C, 'major'), chord(F, 'major'));
      const tritoneSub = results.find(r => r.type === 'tritone-sub')!;
      expect(tritoneSub.chord.quality).toBe('dom7');
    });

    it('secondary dominant is V7 of target', () => {
      // V7 of Dm (root=2) → root a P5 above = 2+7=9 = A
      const results = suggestBridgeChords(chord(C, 'major'), chord(D, 'minor'));
      const secDom = results.find(r => r.type === 'secondary-dom')!;
      expect(secDom.chord.root).toBe(A); // A7 is V7 of Dm
      expect(secDom.chord.quality).toBe('dom7');
    });

    it('passing dim below has root one semitone below target', () => {
      // Target = D (root=2), dim below root = 1 = Db
      const results = suggestBridgeChords(chord(G, 'major'), chord(D, 'major'));
      const dimBelow = results.find(
        r => r.type === 'passing-dim' && r.reason.includes('resolves up'),
      )!;
      expect(dimBelow.chord.root).toBe(Db);
      expect(dimBelow.chord.quality).toBe('dim7');
    });

    it('passing dim above has root one semitone above target', () => {
      // Target = D (root=2), dim above root = 3 = Eb
      const results = suggestBridgeChords(chord(G, 'major'), chord(D, 'major'));
      const dimAbove = results.find(
        r => r.type === 'passing-dim' && r.reason.includes('resolves down'),
      )!;
      expect(dimAbove.chord.root).toBe(Eb);
      expect(dimAbove.chord.quality).toBe('dim7');
    });

    it('detects chromatic bass for tritone sub (descending)', () => {
      // Db7 resolves down to C: if from = D, tritone sub root = Db
      // D → Db → C — descending chromatic
      // Target = C (root=0), V7 root = 7 (G), tritone sub root = 1 (Db)
      // from = D (root=2): fromBass - tritoneSubRoot = 2-1 = 1, tritoneSubRoot - toBass = 1-0 = 1
      const results = suggestBridgeChords(chord(D, 'major'), chord(C, 'major'));
      const tritoneSub = results.find(r => r.type === 'tritone-sub')!;
      expect(tritoneSub.chord.root).toBe(Db);
      expect(tritoneSub.createsChromaticBass).toBe(true);
    });

    it('marks non-chromatic tritone sub correctly', () => {
      // C → G: V7/G root = D(2), tritone sub root = Ab(8)
      // fromBass(0) - 8 = -8 mod 12 = 4, not 1 or 11
      const results = suggestBridgeChords(chord(C, 'major'), chord(G, 'major'));
      const tritoneSub = results.find(r => r.type === 'tritone-sub')!;
      expect(tritoneSub.createsChromaticBass).toBe(false);
    });

    it('secondary dominant never has chromatic bass', () => {
      // C → D: V7/D = A7, root A ≠ C and A ≠ D so it's included
      const results = suggestBridgeChords(chord(C, 'major'), chord(D, 'major'));
      const secDom = results.find(r => r.type === 'secondary-dom')!;
      expect(secDom.createsChromaticBass).toBe(false);
    });

    it('omits tritone sub when its root equals from chord root', () => {
      // Target = Gb (root=6), V7 root = 6+7=13%12=1 (Db), tritone sub root = 1+6=7 (G)
      // from = G (root=7) — tritone sub root === fromBass, should be omitted
      const results = suggestBridgeChords(chord(G, 'major'), chord(Gb, 'major'));
      const tritoneSub = results.find(r => r.type === 'tritone-sub');
      expect(tritoneSub).toBeUndefined();
    });

    it('omits secondary dom when its root equals from chord root', () => {
      // Target = F (root=5), V7 root = 5+7=12%12=0 (C)
      // from = C (root=0) — secDom root === fromBass, should be omitted
      const results = suggestBridgeChords(chord(C, 'major'), chord(F, 'major'));
      const secDom = results.find(r => r.type === 'secondary-dom');
      expect(secDom).toBeUndefined();
    });

    it('includes reason string with chord names', () => {
      const results = suggestBridgeChords(chord(C, 'major'), chord(D, 'minor'));
      for (const r of results) {
        expect(r.reason.length).toBeGreaterThan(0);
      }
    });

    it('returns non-empty array for typical chord pairs', () => {
      // Most chord pairs should produce at least one suggestion
      const pairs: [number, number][] = [[C, G], [G, C], [D, A], [E, B]];
      for (const [fromRoot, toRoot] of pairs) {
        const results = suggestBridgeChords(chord(fromRoot, 'major'), chord(toRoot, 'major'));
        expect(results.length).toBeGreaterThan(0);
      }
    });
  });

  describe('findChromaticBassLines', () => {
    it('returns empty for fewer than 2 chords', () => {
      expect(findChromaticBassLines([])).toEqual([]);
      expect(findChromaticBassLines([chord(C, 'major')])).toEqual([]);
    });

    it('returns empty for 2 chords (need at least 3 for a span)', () => {
      // 2 chords = 1 step, need at least 2 steps (3 chords)
      expect(findChromaticBassLines([
        chord(C, 'major'), chord(Db, 'major'),
      ])).toEqual([]);
    });

    it('detects ascending chromatic bass (3 chords)', () => {
      // C → Db → D: ascending
      const spans = findChromaticBassLines([
        chord(C, 'major'), chord(Db, 'major'), chord(D, 'major'),
      ]);
      expect(spans).toHaveLength(1);
      expect(spans[0]).toEqual({ start: 0, end: 2, direction: 'ascending' });
    });

    it('detects descending chromatic bass (3 chords)', () => {
      // D → Db → C: descending (interval 11 in mod 12)
      const spans = findChromaticBassLines([
        chord(D, 'major'), chord(Db, 'major'), chord(C, 'major'),
      ]);
      expect(spans).toHaveLength(1);
      expect(spans[0]).toEqual({ start: 0, end: 2, direction: 'descending' });
    });

    it('detects longer ascending span (4 chords)', () => {
      // C → Db → D → Eb
      const spans = findChromaticBassLines([
        chord(C, 'major'), chord(Db, 'minor'), chord(D, 'major'), chord(Eb, 'minor'),
      ]);
      expect(spans).toHaveLength(1);
      expect(spans[0]).toEqual({ start: 0, end: 3, direction: 'ascending' });
    });

    it('does not mix ascending and descending into one span', () => {
      // C → Db → D → Db: ascending then descending
      const spans = findChromaticBassLines([
        chord(C, 'major'), chord(Db, 'major'), chord(D, 'major'), chord(Db, 'major'),
      ]);
      // The ascending part C→Db→D is 3 chords (valid span)
      // The descending part D→Db is only 2 chords (not a valid span)
      expect(spans).toHaveLength(1);
      expect(spans[0].direction).toBe('ascending');
    });

    it('returns empty when no chromatic movement exists', () => {
      // C → E → G: intervals 4 and 3, not chromatic
      const spans = findChromaticBassLines([
        chord(C, 'major'), chord(E, 'major'), chord(G, 'major'),
      ]);
      expect(spans).toEqual([]);
    });

    it('finds multiple separate spans', () => {
      // C → Db → D (ascending), G (break), A → Ab → G (descending)
      const spans = findChromaticBassLines([
        chord(C, 'major'),
        chord(Db, 'major'),
        chord(D, 'major'),
        chord(G, 'major'),  // break
        chord(A, 'major'),
        chord(Ab, 'major'),
        chord(G, 'major'),
      ]);
      expect(spans).toHaveLength(2);
      expect(spans[0]).toEqual({ start: 0, end: 2, direction: 'ascending' });
      expect(spans[1]).toEqual({ start: 4, end: 6, direction: 'descending' });
    });

    it('ignores 2-chord chromatic segments (too short)', () => {
      // C → Db → F → Gb: two separate 2-chord segments, both too short
      const spans = findChromaticBassLines([
        chord(C, 'major'), chord(Db, 'major'), chord(F, 'major'), chord(Gb, 'major'),
      ]);
      expect(spans).toEqual([]);
    });

    it('handles wrapping around pitch class boundary', () => {
      // B → C → Db: ascending (11→0→1)
      const spans = findChromaticBassLines([
        chord(B, 'major'), chord(C, 'major'), chord(Db, 'major'),
      ]);
      expect(spans).toHaveLength(1);
      expect(spans[0].direction).toBe('ascending');
    });

    it('handles wrapping descending around pitch class boundary', () => {
      // Db → C → B: descending (1→0→11)
      const spans = findChromaticBassLines([
        chord(Db, 'major'), chord(C, 'major'), chord(B, 'major'),
      ]);
      expect(spans).toHaveLength(1);
      expect(spans[0].direction).toBe('descending');
    });
  });

  describe('suggestBridgesForProgression', () => {
    it('returns empty for fewer than 2 chords', () => {
      expect(suggestBridgesForProgression([])).toEqual([]);
      expect(suggestBridgesForProgression([chord(C, 'major')])).toEqual([]);
    });

    it('returns one suggestion per consecutive pair', () => {
      const prog = [chord(C, 'major'), chord(G, 'major'), chord(A, 'minor')];
      const suggestions = suggestBridgesForProgression(prog);
      // 2 pairs: C→G and G→Am
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].position).toBe(0);
      expect(suggestions[1].position).toBe(1);
    });

    it('each suggestion has a valid bridge chord', () => {
      const prog = [chord(C, 'major'), chord(F, 'major'), chord(G, 'dom7'), chord(C, 'major')];
      const suggestions = suggestBridgesForProgression(prog);
      for (const s of suggestions) {
        expect(s.bridge.chord).toBeDefined();
        expect(s.bridge.type).toMatch(/^(tritone-sub|passing-dim|secondary-dom)$/);
        expect(s.bridge.reason.length).toBeGreaterThan(0);
      }
    });

    it('prioritizes chromatic-bass tritone-sub over others', () => {
      // D → C: tritone sub of V7/C = Db7, and D→Db→C is chromatic descending
      const suggestions = suggestBridgesForProgression([chord(D, 'major'), chord(C, 'major')]);
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].bridge.type).toBe('tritone-sub');
      expect(suggestions[0].bridge.createsChromaticBass).toBe(true);
    });

    it('position indices are correct', () => {
      const prog = [chord(C, 'major'), chord(D, 'minor'), chord(G, 'dom7'), chord(C, 'major')];
      const suggestions = suggestBridgesForProgression(prog);
      // Should have positions 0, 1, 2
      const positions = suggestions.map(s => s.position);
      expect(positions).toEqual([0, 1, 2]);
    });
  });
});
