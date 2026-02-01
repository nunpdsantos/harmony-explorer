import { useEffect, useCallback } from 'react';
import { useStore } from '../state/store';
import { getDiatonicChords } from '../core/harmony';
import { initAudio, playChord, stopAll } from '../audio/audioEngine';
import { getVoicing } from '../audio/voicingEngine';

/**
 * Central keyboard shortcut handler.
 * Shortcuts are disabled when focus is in a text input.
 */
export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if focus is in a text input, select, or textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    const state = useStore.getState();

    switch (e.key) {
      case ' ': {
        // Space: Play/Stop
        e.preventDefault();
        if (state.isPlaying) {
          stopAll();
          useStore.setState({ isPlaying: false, playingIndex: -1 });
        } else if (state.progression.length > 0) {
          // Trigger play via store - the TransportBar will pick it up
          // For simplicity, we set a flag that the transport bar can react to
          document.querySelector<HTMLButtonElement>('[aria-label="Play progression"], [aria-label="Stop playback"]')?.click();
        }
        break;
      }

      case 'l':
      case 'L': {
        // L: Toggle loop
        useStore.setState({ isLooping: !state.isLooping });
        break;
      }

      case '[': {
        // [: Decrease BPM by 5
        e.preventDefault();
        useStore.setState({ bpm: Math.max(40, state.bpm - 5) });
        break;
      }

      case ']': {
        // ]: Increase BPM by 5
        e.preventDefault();
        useStore.setState({ bpm: Math.min(200, state.bpm + 5) });
        break;
      }

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7': {
        // 1-7: Select and add diatonic chord
        if (state.mode !== 'explore') break;
        const degree = parseInt(e.key) - 1;
        const diatonic = getDiatonicChords(state.referenceRoot);
        if (degree < diatonic.length) {
          const d = diatonic[degree];
          const doPlay = async () => {
            if (!state.audioReady) {
              await initAudio();
              useStore.setState({ audioReady: true });
            }
            const voicing = getVoicing(d.chord);
            playChord(voicing);
          };
          doPlay();
          useStore.setState({
            selectedChord: d.chord,
          });
          useStore.getState().addToProgression(d.chord);
        }
        break;
      }

      case 'Backspace': {
        // Backspace: Remove last chord from progression
        e.preventDefault();
        if (state.progression.length > 0) {
          useStore.getState().removeFromProgression(state.progression.length - 1);
        }
        break;
      }

      case 'Escape': {
        // Escape: Deselect chord / close modals
        if (state.showShortcutsModal) {
          useStore.setState({ showShortcutsModal: false });
        } else {
          useStore.setState({ selectedChord: null, hoveredChord: null });
        }
        break;
      }

      case '?': {
        // ?: Toggle shortcuts reference
        e.preventDefault();
        useStore.setState({ showShortcutsModal: !state.showShortcutsModal });
        break;
      }

      case 'e':
      case 'E': {
        // E: Switch to Explore mode
        useStore.setState({ mode: 'explore' });
        break;
      }

      case 'n':
      case 'N': {
        // N: Switch to Learn mode
        useStore.setState({ mode: 'learn' });
        break;
      }

      case 'ArrowLeft': {
        // Left arrow: Previous lesson (in learn mode)
        if (state.mode === 'learn') {
          e.preventDefault();
          useStore.setState({
            currentLessonIndex: Math.max(0, state.currentLessonIndex - 1),
          });
        }
        break;
      }

      case 'ArrowRight': {
        // Right arrow: Next lesson (in learn mode)
        if (state.mode === 'learn') {
          e.preventDefault();
          useStore.setState({
            currentLessonIndex: Math.min(11, state.currentLessonIndex + 1),
          });
        }
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
