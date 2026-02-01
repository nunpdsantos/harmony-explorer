import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnouncements } from '../useAnnouncements';
import { useStore } from '../../state/store';
import { chord } from '../../core/chords';

const C = chord(0, 'major');
const G = chord(7, 'major');

describe('useAnnouncements', () => {
  beforeEach(() => {
    useStore.setState({
      progression: [],
      referenceRoot: 0,
      selectedChord: null,
      activeViz: 'circleOfFifths',
      mode: 'explore',
      isPlaying: false,
      lastAnnouncement: '',
    });
  });

  it('announces when a chord is added', () => {
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().addToProgression(C);
    });

    expect(useStore.getState().lastAnnouncement).toContain('Added');
    expect(useStore.getState().lastAnnouncement).toContain('1 chords total');
  });

  it('announces when progression is cleared', () => {
    useStore.setState({ progression: [C, G] });
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().clearProgression();
    });

    expect(useStore.getState().lastAnnouncement).toBe('Progression cleared');
  });

  it('announces when key changes', () => {
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().setReferenceRoot(7);
    });

    expect(useStore.getState().lastAnnouncement).toContain('Key changed to G major');
  });

  it('announces when mode changes', () => {
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().setMode('learn');
    });

    expect(useStore.getState().lastAnnouncement).toContain('Switched to learn mode');
  });

  it('announces when visualization changes', () => {
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().setActiveViz('proximityPyramid');
    });

    expect(useStore.getState().lastAnnouncement).toContain('Visualization');
  });

  it('announces when a chord is selected', () => {
    renderHook(() => useAnnouncements());

    act(() => {
      useStore.getState().setSelectedChord(C);
    });

    expect(useStore.getState().lastAnnouncement).toContain('Selected');
  });
});
