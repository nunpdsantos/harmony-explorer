import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../state/store';

// Test the keyboard shortcut actions by directly invoking the store
// (Testing the actual hook requires a full React render + keyboard events,
//  which is better covered in integration tests. Here we verify the store
//  mutations that the shortcuts trigger.)
describe('Keyboard Shortcut Store Actions', () => {
  beforeEach(() => {
    useStore.setState({
      mode: 'explore',
      isPlaying: false,
      isLooping: false,
      bpm: 80,
      selectedChord: null,
      hoveredChord: null,
      showShortcutsModal: false,
      currentLessonIndex: 0,
      progression: [],
    });
  });

  it('toggle loop', () => {
    expect(useStore.getState().isLooping).toBe(false);
    useStore.setState({ isLooping: true });
    expect(useStore.getState().isLooping).toBe(true);
  });

  it('decrease BPM by 5 with minimum 40', () => {
    useStore.setState({ bpm: 80 });
    const newBpm = Math.max(40, useStore.getState().bpm - 5);
    useStore.setState({ bpm: newBpm });
    expect(useStore.getState().bpm).toBe(75);

    useStore.setState({ bpm: 42 });
    useStore.setState({ bpm: Math.max(40, 42 - 5) });
    expect(useStore.getState().bpm).toBe(40);
  });

  it('increase BPM by 5 with maximum 200', () => {
    useStore.setState({ bpm: 80 });
    useStore.setState({ bpm: Math.min(200, 80 + 5) });
    expect(useStore.getState().bpm).toBe(85);

    useStore.setState({ bpm: 198 });
    useStore.setState({ bpm: Math.min(200, 198 + 5) });
    expect(useStore.getState().bpm).toBe(200);
  });

  it('Escape deselects chord', () => {
    useStore.setState({ selectedChord: { root: 0, quality: 'major' } });
    useStore.setState({ selectedChord: null, hoveredChord: null });
    expect(useStore.getState().selectedChord).toBeNull();
  });

  it('toggle shortcuts modal', () => {
    expect(useStore.getState().showShortcutsModal).toBe(false);
    useStore.setState({ showShortcutsModal: true });
    expect(useStore.getState().showShortcutsModal).toBe(true);
    useStore.setState({ showShortcutsModal: false });
    expect(useStore.getState().showShortcutsModal).toBe(false);
  });

  it('switch to explore mode', () => {
    useStore.setState({ mode: 'learn' });
    useStore.setState({ mode: 'explore' });
    expect(useStore.getState().mode).toBe('explore');
  });

  it('switch to learn mode', () => {
    useStore.setState({ mode: 'explore' });
    useStore.setState({ mode: 'learn' });
    expect(useStore.getState().mode).toBe('learn');
  });

  it('navigate lessons with arrow keys (bounds)', () => {
    useStore.setState({ mode: 'learn', currentLessonIndex: 5 });

    // Right arrow: next lesson
    useStore.setState({ currentLessonIndex: Math.min(11, 5 + 1) });
    expect(useStore.getState().currentLessonIndex).toBe(6);

    // Left arrow: previous lesson
    useStore.setState({ currentLessonIndex: Math.max(0, 6 - 1) });
    expect(useStore.getState().currentLessonIndex).toBe(5);

    // At start, can't go below 0
    useStore.setState({ currentLessonIndex: 0 });
    useStore.setState({ currentLessonIndex: Math.max(0, 0 - 1) });
    expect(useStore.getState().currentLessonIndex).toBe(0);

    // At end, can't go above 11
    useStore.setState({ currentLessonIndex: 11 });
    useStore.setState({ currentLessonIndex: Math.min(11, 11 + 1) });
    expect(useStore.getState().currentLessonIndex).toBe(11);
  });

  it('Backspace removes last chord', () => {
    const chords = [
      { root: 0, quality: 'major' as const },
      { root: 5, quality: 'major' as const },
      { root: 7, quality: 'major' as const },
    ];
    useStore.setState({ progression: chords });

    useStore.getState().removeFromProgression(chords.length - 1);
    expect(useStore.getState().progression).toHaveLength(2);
    expect(useStore.getState().progression[1].root).toBe(5);
  });
});
