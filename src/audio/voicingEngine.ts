import type { Chord } from '../core/chords';
import { initialVoicing, smoothVoiceLeading, type VoicedChord } from '../core/voiceLeading';

/**
 * Voicing engine: manages voiced chord state for smooth playback.
 * Keeps track of the last voicing to compute smooth voice leading.
 */

let lastVoicing: VoicedChord | null = null;

/** Get a voicing for a chord, using smooth voice leading from the previous chord */
export function getVoicing(chord: Chord): VoicedChord {
  if (lastVoicing === null) {
    lastVoicing = initialVoicing(chord);
  } else {
    lastVoicing = smoothVoiceLeading(lastVoicing, chord);
  }
  return lastVoicing;
}

/** Voice an entire progression with smooth voice leading throughout */
export function voiceProgression(chords: Chord[]): VoicedChord[] {
  let prev: VoicedChord | null = null;
  return chords.map(chord => {
    if (prev === null) {
      prev = initialVoicing(chord);
    } else {
      prev = smoothVoiceLeading(prev, chord);
    }
    return prev;
  });
}

/** Reset the voicing state (e.g., when changing reference root) */
export function resetVoicing(): void {
  lastVoicing = null;
}

/** Set the last voicing explicitly */
export function setLastVoicing(voicing: VoicedChord): void {
  lastVoicing = voicing;
}
