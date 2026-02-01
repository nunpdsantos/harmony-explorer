import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import { noteName } from '../core/constants';
import { chordName } from '../core/chords';

/**
 * Hook that subscribes to key state changes and generates
 * screen-reader announcements via the store's `announce` function.
 */
export function useAnnouncements() {
  const announce = useStore(s => s.announce);
  const progression = useStore(s => s.progression);
  const referenceRoot = useStore(s => s.referenceRoot);
  const selectedChord = useStore(s => s.selectedChord);
  const activeViz = useStore(s => s.activeViz);
  const mode = useStore(s => s.mode);
  const isPlaying = useStore(s => s.isPlaying);

  // Track previous values to detect changes
  const prevRef = useRef({
    progressionLength: progression.length,
    referenceRoot,
    selectedChord,
    activeViz,
    mode,
    isPlaying,
  });

  useEffect(() => {
    const prev = prevRef.current;

    // Progression length changed
    if (progression.length !== prev.progressionLength) {
      if (progression.length > prev.progressionLength) {
        const lastChord = progression[progression.length - 1];
        announce(`Added ${chordName(lastChord)}, ${progression.length} chords total`);
      } else if (progression.length === 0) {
        announce('Progression cleared');
      } else {
        announce(`Removed chord, ${progression.length} chords remaining`);
      }
    }

    // Key changed
    if (referenceRoot !== prev.referenceRoot) {
      announce(`Key changed to ${noteName(referenceRoot)} major`);
    }

    // Selected chord changed
    if (selectedChord !== prev.selectedChord && selectedChord) {
      announce(`Selected ${chordName(selectedChord)}`);
    }

    // Visualization changed
    if (activeViz !== prev.activeViz) {
      announce(`Visualization: ${activeViz}`);
    }

    // Mode changed
    if (mode !== prev.mode) {
      announce(`Switched to ${mode} mode`);
    }

    // Playback state changed
    if (isPlaying !== prev.isPlaying) {
      announce(isPlaying ? 'Playback started' : 'Playback stopped');
    }

    prevRef.current = {
      progressionLength: progression.length,
      referenceRoot,
      selectedChord,
      activeViz,
      mode,
      isPlaying,
    };
  }, [progression, referenceRoot, selectedChord, activeViz, mode, isPlaying, announce]);
}
