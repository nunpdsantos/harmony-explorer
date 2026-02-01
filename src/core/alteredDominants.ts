/**
 * Altered Dominants catalog and resolution suggestions.
 * Maps altered dominant qualities to their characteristics, scales,
 * and suggested resolution targets.
 */

import { chord, type Chord } from './chords';
import { CHORD_TEMPLATES, type ChordQuality } from './constants';

export interface AlteredDominantInfo {
  quality: ChordQuality;
  alterations: string[];
  associatedScale: string;
  resolutionTargets: { chord: Chord; strength: 'strong' | 'common' | 'creative'; label: string }[];
  tensionLevel: number; // 1-4
}

/** Catalog of altered dominant information */
const ALTERED_DOMINANT_CATALOG: Partial<Record<ChordQuality, Omit<AlteredDominantInfo, 'resolutionTargets'>>> = {
  dom7:              { quality: 'dom7',              alterations: [],            associatedScale: 'Mixolydian', tensionLevel: 1 },
  dom9:              { quality: 'dom9',              alterations: ['9'],         associatedScale: 'Mixolydian', tensionLevel: 1 },
  dom13:             { quality: 'dom13',             alterations: ['9', '13'],   associatedScale: 'Mixolydian', tensionLevel: 1 },
  dom7sus4:          { quality: 'dom7sus4',          alterations: ['sus4'],      associatedScale: 'Mixolydian', tensionLevel: 1 },
  dom7sharp11:       { quality: 'dom7sharp11',       alterations: ['♯11'],       associatedScale: 'Lydian Dominant', tensionLevel: 2 },
  dom7flat9:         { quality: 'dom7flat9',         alterations: ['♭9'],        associatedScale: 'Half-Whole Diminished', tensionLevel: 3 },
  dom7sharp9:        { quality: 'dom7sharp9',        alterations: ['♯9'],        associatedScale: 'Altered', tensionLevel: 3 },
  dom7flat13:        { quality: 'dom7flat13',        alterations: ['♭13'],       associatedScale: 'Mixolydian ♭6', tensionLevel: 2 },
  dom7flat5:         { quality: 'dom7flat5',         alterations: ['♭5'],        associatedScale: 'Lydian Dominant / Whole Tone', tensionLevel: 2 },
  alt7:              { quality: 'alt7',              alterations: ['♭5/♯5', '♭9/♯9'], associatedScale: 'Altered', tensionLevel: 4 },
  dom7sharp5flat9:   { quality: 'dom7sharp5flat9',   alterations: ['♯5', '♭9'],  associatedScale: 'Altered', tensionLevel: 4 },
  dom7sharp5sharp9:  { quality: 'dom7sharp5sharp9',  alterations: ['♯5', '♯9'],  associatedScale: 'Altered', tensionLevel: 4 },
};

/** Check if a chord quality is in the dominant family */
export function isDominantFamily(quality: ChordQuality): boolean {
  return quality in ALTERED_DOMINANT_CATALOG;
}

/** Get info about an altered dominant chord quality */
export function getAlteredDominantInfo(quality: ChordQuality): AlteredDominantInfo | null {
  const info = ALTERED_DOMINANT_CATALOG[quality];
  if (!info) return null;

  // Compute resolution targets generically (will be filled in context)
  return {
    ...info,
    resolutionTargets: [],
  };
}

/**
 * Suggest resolution targets for any dominant-family chord.
 * Returns standard resolution, tritone sub resolution, and deceptive resolution.
 */
export function suggestResolutions(c: Chord): { chord: Chord; strength: 'strong' | 'common' | 'creative'; label: string }[] {
  if (!isDominantFamily(c.quality)) return [];

  const results: { chord: Chord; strength: 'strong' | 'common' | 'creative'; label: string }[] = [];

  // Standard resolution: down a fifth (up a fourth)
  const standardRoot = (c.root + 5) % 12; // down a 5th = +5 semitones
  results.push({ chord: chord(standardRoot, 'major'), strength: 'strong', label: 'Standard (→ I)' });
  results.push({ chord: chord(standardRoot, 'minor'), strength: 'common', label: 'To minor I' });

  // Tritone substitution resolution: down a half step
  const tritoneRoot = (c.root + 11) % 12; // down a semitone
  results.push({ chord: chord(tritoneRoot, 'major'), strength: 'common', label: 'Tritone sub target' });

  // Deceptive: to vi (down a fifth, then up a minor third)
  const deceptiveRoot = (standardRoot + 9) % 12; // vi of the target key
  results.push({ chord: chord(deceptiveRoot, 'minor'), strength: 'creative', label: 'Deceptive (→ vi)' });

  return results;
}

/**
 * Suggest which alterations on a dominant chord create the smoothest
 * voice leading to a target chord.
 */
export function suggestAlterations(
  dominantRoot: number,
  targetChord: Chord,
): { quality: ChordQuality; label: string; voiceLeadingNote: string }[] {
  const suggestions: { quality: ChordQuality; label: string; voiceLeadingNote: string }[] = [];
  const targetPCs = new Set(
    CHORD_TEMPLATES[targetChord.quality].intervals.map(
      i => ((targetChord.root + i) % 12 + 12) % 12,
    ),
  );

  // Check each altered dominant quality
  const altQualities: ChordQuality[] = [
    'dom7flat9', 'dom7sharp9', 'dom7sharp11', 'dom7flat13',
    'dom7flat5', 'dom7sharp5flat9', 'dom7sharp5sharp9', 'alt7',
  ];

  for (const q of altQualities) {
    const altPCs = CHORD_TEMPLATES[q].intervals.map(
      i => ((dominantRoot + i) % 12 + 12) % 12,
    );

    // Count how many altered notes resolve by half step to a target chord tone
    let halfStepResolutions = 0;
    let resolvingNote = '';
    for (const pc of altPCs) {
      if (targetPCs.has((pc + 1) % 12) || targetPCs.has((pc + 11) % 12)) {
        halfStepResolutions++;
        resolvingNote = `resolves by half step`;
      }
    }

    if (halfStepResolutions >= 2) {
      const info = ALTERED_DOMINANT_CATALOG[q];
      suggestions.push({
        quality: q,
        label: info ? info.alterations.join(', ') : q,
        voiceLeadingNote: resolvingNote,
      });
    }
  }

  return suggestions;
}

/** Get all available altered variants for a dominant chord */
export function getAlteredVariants(root: number): { chord: Chord; info: AlteredDominantInfo }[] {
  const variants: { chord: Chord; info: AlteredDominantInfo }[] = [];

  for (const quality of Object.keys(ALTERED_DOMINANT_CATALOG)) {
    const q = quality as ChordQuality;
    if (q === 'dom7') continue; // Skip the plain dominant
    const c = chord(root, q);
    const info = getAlteredDominantInfo(q);
    if (info) {
      variants.push({ chord: c, info });
    }
  }

  return variants.sort((a, b) => a.info.tensionLevel - b.info.tensionLevel);
}
