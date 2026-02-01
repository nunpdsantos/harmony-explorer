import { useCallback } from 'react';
import { useStore } from '../state/store';
import type { Chord } from '../core/chords';
import { initAudio, playChord } from '../audio/audioEngine';
import { getVoicing } from '../audio/voicingEngine';

/**
 * Hook that handles the common chord click/hover interaction.
 * Click = select + play + add to progression.
 * Hover = highlight relationships.
 */
export function useChordInteraction() {
  const {
    setSelectedChord, setHoveredChord,
    addToProgression,
    audioReady, setAudioReady,
  } = useStore();

  const handleChordClick = useCallback(async (chord: Chord) => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }

    setSelectedChord(chord);
    const voicing = getVoicing(chord);
    playChord(voicing);
    addToProgression(chord);
  }, [audioReady, setSelectedChord, setAudioReady, addToProgression]);

  const handleChordHover = useCallback((chord: Chord | null) => {
    setHoveredChord(chord);
  }, [setHoveredChord]);

  return { handleChordClick, handleChordHover };
}
