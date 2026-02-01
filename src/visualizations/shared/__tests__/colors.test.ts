import { describe, it, expect } from 'vitest';
import { qualityColor, sharedNoteColor, relationshipOpacity } from '../colors';

describe('colors', () => {
  describe('qualityColor', () => {
    it('returns blue for major', () => {
      expect(qualityColor('major')).toBe('#3b82f6');
    });

    it('returns purple for minor', () => {
      expect(qualityColor('minor')).toBe('#8b5cf6');
    });

    it('returns red for diminished', () => {
      expect(qualityColor('diminished')).toBe('#ef4444');
    });

    it('returns amber for augmented', () => {
      expect(qualityColor('augmented')).toBe('#f59e0b');
    });

    it('returns cyan for dom7', () => {
      expect(qualityColor('dom7')).toBe('#06b6d4');
    });

    it('returns deeper blue for maj7', () => {
      expect(qualityColor('maj7')).toBe('#2563eb');
    });

    it('returns deeper purple for min7', () => {
      expect(qualityColor('min7')).toBe('#7c3aed');
    });

    it('returns deeper red for dim7', () => {
      expect(qualityColor('dim7')).toBe('#dc2626');
    });

    it('returns orange for halfDim7', () => {
      expect(qualityColor('halfDim7')).toBe('#ea580c');
    });

    it('returns gray fallback for unknown quality', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing fallback for unrecognized quality
      expect(qualityColor('unknown' as any)).toBe('#6b7280');
    });
  });

  describe('sharedNoteColor', () => {
    it('returns green for 3 shared notes', () => {
      expect(sharedNoteColor(3)).toBe('#22c55e');
    });

    it('returns blue for 2 shared notes', () => {
      expect(sharedNoteColor(2)).toBe('#3b82f6');
    });

    it('returns amber for 1 shared note', () => {
      expect(sharedNoteColor(1)).toBe('#f59e0b');
    });

    it('returns red for 0 shared notes', () => {
      expect(sharedNoteColor(0)).toBe('#ef4444');
    });

    it('returns red for negative values', () => {
      expect(sharedNoteColor(-1)).toBe('#ef4444');
    });
  });

  describe('relationshipOpacity', () => {
    it('returns 0.3 for 0 shared notes', () => {
      expect(relationshipOpacity(0)).toBeCloseTo(0.3);
    });

    it('returns 0.5 for 1 shared note', () => {
      expect(relationshipOpacity(1)).toBeCloseTo(0.5);
    });

    it('returns 0.7 for 2 shared notes', () => {
      expect(relationshipOpacity(2)).toBeCloseTo(0.7);
    });

    it('returns 0.9 for 3 shared notes', () => {
      expect(relationshipOpacity(3)).toBeCloseTo(0.9);
    });

    it('increases linearly by 0.2 per shared note', () => {
      const o0 = relationshipOpacity(0);
      const o1 = relationshipOpacity(1);
      const o2 = relationshipOpacity(2);
      expect(o1 - o0).toBeCloseTo(0.2);
      expect(o2 - o1).toBeCloseTo(0.2);
    });
  });
});
