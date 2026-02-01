import { describe, it, expect } from 'vitest';
import {
  isDominantFamily,
  getAlteredDominantInfo,
  suggestResolutions,
  suggestAlterations,
  getAlteredVariants,
} from '../alteredDominants';
import type { Chord } from '../chords';

describe('isDominantFamily', () => {
  it('returns true for dom7', () => {
    expect(isDominantFamily('dom7')).toBe(true);
  });

  it('returns true for dom9', () => {
    expect(isDominantFamily('dom9')).toBe(true);
  });

  it('returns true for alt7', () => {
    expect(isDominantFamily('alt7')).toBe(true);
  });

  it('returns true for dom7flat9', () => {
    expect(isDominantFamily('dom7flat9')).toBe(true);
  });

  it('returns true for dom7sharp11', () => {
    expect(isDominantFamily('dom7sharp11')).toBe(true);
  });

  it('returns false for major', () => {
    expect(isDominantFamily('major')).toBe(false);
  });

  it('returns false for minor', () => {
    expect(isDominantFamily('minor')).toBe(false);
  });

  it('returns false for min7', () => {
    expect(isDominantFamily('min7')).toBe(false);
  });

  it('returns false for maj7', () => {
    expect(isDominantFamily('maj7')).toBe(false);
  });

  it('returns false for diminished', () => {
    expect(isDominantFamily('diminished')).toBe(false);
  });
});

describe('getAlteredDominantInfo', () => {
  it('returns info for dom7', () => {
    const info = getAlteredDominantInfo('dom7');
    expect(info).not.toBeNull();
    expect(info!.quality).toBe('dom7');
    expect(info!.tensionLevel).toBe(1);
    expect(info!.associatedScale).toBe('Mixolydian');
  });

  it('returns info for alt7 with tension 4', () => {
    const info = getAlteredDominantInfo('alt7');
    expect(info).not.toBeNull();
    expect(info!.tensionLevel).toBe(4);
    expect(info!.associatedScale).toBe('Altered');
  });

  it('returns info with alterations for dom7flat9', () => {
    const info = getAlteredDominantInfo('dom7flat9');
    expect(info).not.toBeNull();
    expect(info!.alterations).toContain('♭9');
  });

  it('returns info with ♯11 for dom7sharp11', () => {
    const info = getAlteredDominantInfo('dom7sharp11');
    expect(info).not.toBeNull();
    expect(info!.alterations).toContain('♯11');
    expect(info!.tensionLevel).toBe(2);
  });

  it('returns null for non-dominant quality', () => {
    expect(getAlteredDominantInfo('major')).toBeNull();
    expect(getAlteredDominantInfo('minor')).toBeNull();
    expect(getAlteredDominantInfo('min7')).toBeNull();
  });

  it('returns empty resolutionTargets array', () => {
    const info = getAlteredDominantInfo('dom7');
    expect(info!.resolutionTargets).toEqual([]);
  });

  it('covers dom7sharp9', () => {
    const info = getAlteredDominantInfo('dom7sharp9');
    expect(info).not.toBeNull();
    expect(info!.alterations).toContain('♯9');
    expect(info!.tensionLevel).toBe(3);
  });

  it('covers dom7flat5', () => {
    const info = getAlteredDominantInfo('dom7flat5');
    expect(info).not.toBeNull();
    expect(info!.alterations).toContain('♭5');
  });
});

describe('suggestResolutions', () => {
  it('returns 4 resolution targets for G7 (standard, minor I, tritone, deceptive)', () => {
    const G7: Chord = { root: 7, quality: 'dom7' };
    const resolutions = suggestResolutions(G7);
    expect(resolutions).toHaveLength(4);
  });

  it('standard resolution of G7 goes to C (root=0)', () => {
    const G7: Chord = { root: 7, quality: 'dom7' };
    const resolutions = suggestResolutions(G7);
    const standard = resolutions.find(r => r.label.includes('Standard'));
    expect(standard).toBeDefined();
    expect(standard!.chord.root).toBe(0);
    expect(standard!.chord.quality).toBe('major');
    expect(standard!.strength).toBe('strong');
  });

  it('tritone sub target of G7 is Gb/F# (root=6)', () => {
    const G7: Chord = { root: 7, quality: 'dom7' };
    const resolutions = suggestResolutions(G7);
    const tritone = resolutions.find(r => r.label.includes('Tritone'));
    expect(tritone).toBeDefined();
    expect(tritone!.chord.root).toBe(6);
    expect(tritone!.strength).toBe('common');
  });

  it('deceptive resolution of G7 is Am (vi of C)', () => {
    const G7: Chord = { root: 7, quality: 'dom7' };
    const resolutions = suggestResolutions(G7);
    const deceptive = resolutions.find(r => r.label.includes('Deceptive'));
    expect(deceptive).toBeDefined();
    expect(deceptive!.chord.root).toBe(9);
    expect(deceptive!.chord.quality).toBe('minor');
    expect(deceptive!.strength).toBe('creative');
  });

  it('returns empty array for non-dominant chord', () => {
    const C: Chord = { root: 0, quality: 'major' };
    expect(suggestResolutions(C)).toEqual([]);
  });

  it('works for altered dominant qualities', () => {
    const Galt: Chord = { root: 7, quality: 'alt7' };
    const resolutions = suggestResolutions(Galt);
    expect(resolutions).toHaveLength(4);
    expect(resolutions[0].chord.root).toBe(0);
  });

  it('standard resolution of C7 goes to F (root=5)', () => {
    const C7: Chord = { root: 0, quality: 'dom7' };
    const resolutions = suggestResolutions(C7);
    expect(resolutions[0].chord.root).toBe(5);
  });
});

describe('suggestAlterations', () => {
  it('returns suggestions as array', () => {
    const target: Chord = { root: 0, quality: 'major' };
    const suggestions = suggestAlterations(7, target);
    expect(Array.isArray(suggestions)).toBe(true);
  });

  it('each suggestion has quality, label, and voiceLeadingNote', () => {
    const target: Chord = { root: 0, quality: 'major' };
    const suggestions = suggestAlterations(7, target);
    for (const s of suggestions) {
      expect(s).toHaveProperty('quality');
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('voiceLeadingNote');
    }
  });

  it('suggests altered qualities with good half-step resolutions to target', () => {
    const target: Chord = { root: 0, quality: 'major' };
    const suggestions = suggestAlterations(7, target);
    // At least some alterations should resolve well to C major
    if (suggestions.length > 0) {
      expect(suggestions[0].voiceLeadingNote).toContain('resolves');
    }
  });
});

describe('getAlteredVariants', () => {
  it('returns variants for a given root', () => {
    const variants = getAlteredVariants(7);
    expect(variants.length).toBeGreaterThan(0);
  });

  it('does not include plain dom7', () => {
    const variants = getAlteredVariants(7);
    const hasDom7 = variants.some(v => v.chord.quality === 'dom7');
    expect(hasDom7).toBe(false);
  });

  it('all variants have the specified root', () => {
    const variants = getAlteredVariants(0);
    for (const v of variants) {
      expect(v.chord.root).toBe(0);
    }
  });

  it('sorted by tension level ascending', () => {
    const variants = getAlteredVariants(0);
    for (let i = 1; i < variants.length; i++) {
      expect(variants[i].info.tensionLevel).toBeGreaterThanOrEqual(variants[i - 1].info.tensionLevel);
    }
  });

  it('each variant has valid AlteredDominantInfo', () => {
    const variants = getAlteredVariants(0);
    for (const v of variants) {
      expect(v.info.quality).toBeTruthy();
      expect(v.info.tensionLevel).toBeGreaterThanOrEqual(1);
      expect(v.info.tensionLevel).toBeLessThanOrEqual(4);
      expect(v.info.associatedScale).toBeTruthy();
    }
  });
});
