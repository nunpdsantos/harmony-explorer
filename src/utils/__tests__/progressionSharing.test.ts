import { describe, it, expect } from 'vitest';
import {
  exportProgressionAsJson,
  importProgressionFromJson,
  encodeProgressionToHash,
  decodeProgressionFromHash,
  progressionToText,
} from '../progressionSharing';
import type { Chord } from '../../core/chords';

const cMajor: Chord = { root: 0, quality: 'major' };
const fMajor: Chord = { root: 5, quality: 'major' };
const gDom7: Chord = { root: 7, quality: 'dom7' };

describe('progressionSharing', () => {
  describe('exportProgressionAsJson / importProgressionFromJson', () => {
    it('round-trips a progression', () => {
      const json = exportProgressionAsJson([cMajor, fMajor], 0, 'Test');
      const result = importProgressionFromJson(json);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test');
      expect(result!.key).toBe(0);
      expect(result!.chords).toHaveLength(2);
      expect(result!.chords[0]).toEqual(cMajor);
    });

    it('includes version field', () => {
      const json = exportProgressionAsJson([cMajor], 0);
      const data = JSON.parse(json);
      expect(data.version).toBe(1);
    });

    it('uses default name when none provided', () => {
      const json = exportProgressionAsJson([cMajor], 0);
      const data = JSON.parse(json);
      expect(data.name).toBe('Untitled');
    });

    it('returns null for invalid JSON', () => {
      expect(importProgressionFromJson('not json')).toBeNull();
    });

    it('returns null for JSON without chords array', () => {
      expect(importProgressionFromJson('{"key": 0}')).toBeNull();
    });

    it('returns null for JSON with invalid chord objects', () => {
      expect(importProgressionFromJson('{"key": 0, "chords": [{"foo": "bar"}]}')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(importProgressionFromJson('')).toBeNull();
    });

    it('uses "Imported" as default name for imports without name', () => {
      const json = JSON.stringify({ key: 0, chords: [{ root: 0, quality: 'major' }] });
      const result = importProgressionFromJson(json);
      expect(result!.name).toBe('Imported');
    });
  });

  describe('encodeProgressionToHash / decodeProgressionFromHash', () => {
    it('round-trips a progression', () => {
      const hash = encodeProgressionToHash([cMajor, fMajor, gDom7], 0);
      const result = decodeProgressionFromHash(hash);
      expect(result).not.toBeNull();
      expect(result!.keyRoot).toBe(0);
      expect(result!.chords).toHaveLength(3);
      expect(result!.chords[0]).toEqual(cMajor);
      expect(result!.chords[2]).toEqual(gDom7);
    });

    it('returns empty string for empty progression', () => {
      expect(encodeProgressionToHash([], 0)).toBe('');
    });

    it('handles hash with leading #', () => {
      const hash = '#' + encodeProgressionToHash([cMajor], 0);
      const result = decodeProgressionFromHash(hash);
      expect(result).not.toBeNull();
      expect(result!.chords).toHaveLength(1);
    });

    it('returns null for empty hash', () => {
      expect(decodeProgressionFromHash('')).toBeNull();
    });

    it('returns null for invalid hash', () => {
      expect(decodeProgressionFromHash('garbage')).toBeNull();
    });

    it('returns null for out-of-range key', () => {
      expect(decodeProgressionFromHash('key=13&c=0.major')).toBeNull();
      expect(decodeProgressionFromHash('key=-1&c=0.major')).toBeNull();
    });

    it('encodes different keys correctly', () => {
      const hash = encodeProgressionToHash([cMajor], 7);
      const result = decodeProgressionFromHash(hash);
      expect(result!.keyRoot).toBe(7);
    });
  });

  describe('progressionToText', () => {
    it('returns readable text with chord names', () => {
      const text = progressionToText([cMajor, fMajor, gDom7], 0);
      expect(text).toContain('C');
      expect(text).toContain('F');
      expect(text).toContain('G7');
      expect(text).toContain('\u2192'); // arrow
    });

    it('includes key name', () => {
      const text = progressionToText([cMajor], 0);
      expect(text).toContain('Key: C');
    });
  });
});
