import { describe, it, expect } from 'vitest';
import { ARP_PATTERNS, ARP_PATTERN_NAMES } from '../arpeggiation';

const cMajorVoicing = [60, 64, 67]; // C4, E4, G4

describe('Arpeggiation patterns', () => {
  it('exports all pattern names', () => {
    expect(ARP_PATTERN_NAMES).toHaveLength(6);
    expect(ARP_PATTERN_NAMES).toContain('block');
    expect(ARP_PATTERN_NAMES).toContain('up');
    expect(ARP_PATTERN_NAMES).toContain('down');
    expect(ARP_PATTERN_NAMES).toContain('upDown');
    expect(ARP_PATTERN_NAMES).toContain('random');
    expect(ARP_PATTERN_NAMES).toContain('alberti');
  });

  it('all patterns have names', () => {
    for (const name of ARP_PATTERN_NAMES) {
      expect(ARP_PATTERNS[name].name).toBeTruthy();
    }
  });

  describe('block', () => {
    it('returns all notes simultaneously', () => {
      const result = ARP_PATTERNS.block.generate(cMajorVoicing);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cMajorVoicing);
    });
  });

  describe('up', () => {
    it('returns notes ascending', () => {
      const result = ARP_PATTERNS.up.generate(cMajorVoicing);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([60]);
      expect(result[1]).toEqual([64]);
      expect(result[2]).toEqual([67]);
    });

    it('sorts unsorted input', () => {
      const result = ARP_PATTERNS.up.generate([67, 60, 64]);
      expect(result[0]).toEqual([60]);
      expect(result[1]).toEqual([64]);
      expect(result[2]).toEqual([67]);
    });
  });

  describe('down', () => {
    it('returns notes descending', () => {
      const result = ARP_PATTERNS.down.generate(cMajorVoicing);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([67]);
      expect(result[1]).toEqual([64]);
      expect(result[2]).toEqual([60]);
    });
  });

  describe('upDown', () => {
    it('goes up then back down without repeating extremes', () => {
      const result = ARP_PATTERNS.upDown.generate(cMajorVoicing);
      // C, E, G, E (up then middle going back down)
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual([60]);
      expect(result[1]).toEqual([64]);
      expect(result[2]).toEqual([67]);
      expect(result[3]).toEqual([64]);
    });

    it('handles 2-note chord', () => {
      const result = ARP_PATTERNS.upDown.generate([60, 67]);
      expect(result).toHaveLength(2);
    });

    it('handles single note', () => {
      const result = ARP_PATTERNS.upDown.generate([60]);
      expect(result).toHaveLength(1);
    });
  });

  describe('random', () => {
    it('returns all notes in some order', () => {
      const result = ARP_PATTERNS.random.generate(cMajorVoicing);
      expect(result).toHaveLength(3);
      const notes = result.map(r => r[0]).sort((a, b) => a - b);
      expect(notes).toEqual([60, 64, 67]);
    });
  });

  describe('alberti', () => {
    it('returns low-high-mid-high pattern', () => {
      const result = ARP_PATTERNS.alberti.generate(cMajorVoicing);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual([60]); // low
      expect(result[1]).toEqual([67]); // high
      expect(result[2]).toEqual([64]); // mid
      expect(result[3]).toEqual([67]); // high
    });

    it('handles 2-note chord gracefully', () => {
      const result = ARP_PATTERNS.alberti.generate([60, 67]);
      expect(result).toHaveLength(2); // falls back to simple arp
    });
  });

  it('all patterns return non-empty arrays for valid input', () => {
    for (const name of ARP_PATTERN_NAMES) {
      const result = ARP_PATTERNS[name].generate(cMajorVoicing);
      expect(result.length).toBeGreaterThan(0);
      for (const notes of result) {
        expect(notes.length).toBeGreaterThan(0);
      }
    }
  });
});
