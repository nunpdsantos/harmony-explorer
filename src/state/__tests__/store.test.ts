import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Zustand Store', () => {
  beforeEach(() => {
    // Reset to defaults
    useStore.setState({
      mode: 'explore',
      activeViz: 'circleOfFifths',
      referenceRoot: 0,
      selectedChord: null,
      hoveredChord: null,
      activeQualities: ['major', 'minor'],
      progression: [],
      isPlaying: false,
      playingIndex: -1,
      bpm: 80,
      isLooping: false,
      audioReady: false,
      showDom7Ring: false,
      showSecondaryDominants: false,
      showDominantChains: false,
      showIIVI: false,
      currentLessonIndex: 0,
      lessonProgress: Array(12).fill(false),
      sidebarOpen: false,
      activePreset: 'piano',
      humanize: 0,
      volume: -8,
      showShortcutsModal: false,
      exerciseBuildProgression: [],
    });
  });

  describe('Mode', () => {
    it('defaults to explore', () => {
      expect(useStore.getState().mode).toBe('explore');
    });

    it('switches to learn', () => {
      useStore.getState().setMode('learn');
      expect(useStore.getState().mode).toBe('learn');
    });
  });

  describe('Active Visualization', () => {
    it('defaults to circleOfFifths', () => {
      expect(useStore.getState().activeViz).toBe('circleOfFifths');
    });

    it('switches visualization', () => {
      useStore.getState().setActiveViz('proximityPyramid');
      expect(useStore.getState().activeViz).toBe('proximityPyramid');
    });
  });

  describe('Reference Root', () => {
    it('defaults to 0 (C)', () => {
      expect(useStore.getState().referenceRoot).toBe(0);
    });

    it('changing root clears selected chord', () => {
      useStore.setState({ selectedChord: { root: 0, quality: 'major' } });
      useStore.getState().setReferenceRoot(7);
      expect(useStore.getState().referenceRoot).toBe(7);
      expect(useStore.getState().selectedChord).toBeNull();
    });
  });

  describe('Progression', () => {
    it('starts empty', () => {
      expect(useStore.getState().progression).toEqual([]);
    });

    it('adds chords', () => {
      useStore.getState().addToProgression({ root: 0, quality: 'major' });
      useStore.getState().addToProgression({ root: 5, quality: 'major' });
      expect(useStore.getState().progression).toHaveLength(2);
    });

    it('removes chord by index', () => {
      useStore.getState().addToProgression({ root: 0, quality: 'major' });
      useStore.getState().addToProgression({ root: 5, quality: 'major' });
      useStore.getState().addToProgression({ root: 7, quality: 'major' });
      useStore.getState().removeFromProgression(1);
      const prog = useStore.getState().progression;
      expect(prog).toHaveLength(2);
      expect(prog[0].root).toBe(0);
      expect(prog[1].root).toBe(7);
    });

    it('clears all', () => {
      useStore.getState().addToProgression({ root: 0, quality: 'major' });
      useStore.getState().addToProgression({ root: 5, quality: 'major' });
      useStore.getState().clearProgression();
      expect(useStore.getState().progression).toEqual([]);
    });

    it('sets progression directly', () => {
      const chords = [
        { root: 0, quality: 'major' as const },
        { root: 7, quality: 'major' as const },
      ];
      useStore.getState().setProgression(chords);
      expect(useStore.getState().progression).toEqual(chords);
    });
  });

  describe('Playback', () => {
    it('defaults to not playing', () => {
      expect(useStore.getState().isPlaying).toBe(false);
      expect(useStore.getState().playingIndex).toBe(-1);
    });

    it('toggles loop', () => {
      useStore.getState().setIsLooping(true);
      expect(useStore.getState().isLooping).toBe(true);
    });

    it('sets BPM', () => {
      useStore.getState().setBpm(120);
      expect(useStore.getState().bpm).toBe(120);
    });
  });

  describe('Circle of Fifths Overlays', () => {
    it('all off by default', () => {
      const state = useStore.getState();
      expect(state.showDom7Ring).toBe(false);
      expect(state.showSecondaryDominants).toBe(false);
      expect(state.showDominantChains).toBe(false);
      expect(state.showIIVI).toBe(false);
    });

    it('toggles overlays', () => {
      useStore.getState().setShowDom7Ring(true);
      expect(useStore.getState().showDom7Ring).toBe(true);
      useStore.getState().setShowSecondaryDominants(true);
      expect(useStore.getState().showSecondaryDominants).toBe(true);
    });
  });

  describe('Learn Mode', () => {
    it('starts at lesson 0', () => {
      expect(useStore.getState().currentLessonIndex).toBe(0);
    });

    it('marks lesson complete', () => {
      useStore.getState().completeLessonAt(3);
      expect(useStore.getState().lessonProgress[3]).toBe(true);
      expect(useStore.getState().lessonProgress[0]).toBe(false);
    });

    it('navigates lessons', () => {
      useStore.getState().setCurrentLessonIndex(5);
      expect(useStore.getState().currentLessonIndex).toBe(5);
    });
  });

  describe('Audio Settings', () => {
    it('defaults to piano preset', () => {
      expect(useStore.getState().activePreset).toBe('piano');
    });

    it('switches preset', () => {
      useStore.getState().setActivePreset('rhodes');
      expect(useStore.getState().activePreset).toBe('rhodes');
    });

    it('defaults humanize to 0', () => {
      expect(useStore.getState().humanize).toBe(0);
    });

    it('sets humanize', () => {
      useStore.getState().setHumanize(0.5);
      expect(useStore.getState().humanize).toBe(0.5);
    });

    it('sets volume', () => {
      useStore.getState().setVolume(-12);
      expect(useStore.getState().volume).toBe(-12);
    });
  });

  describe('Filter Toggle', () => {
    it('toggles a filter on and off', () => {
      useStore.getState().toggleFilter('tritone');
      expect(useStore.getState().activeFilters.has('tritone')).toBe(true);
      useStore.getState().toggleFilter('tritone');
      expect(useStore.getState().activeFilters.has('tritone')).toBe(false);
    });
  });

  describe('Saved Progressions', () => {
    it('loadProgressionById sets progression and key', () => {
      const prog = {
        id: 'test-1',
        name: 'Test',
        chords: [{ root: 0, quality: 'major' as const }, { root: 7, quality: 'major' as const }],
        key: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      useStore.setState({ savedProgressions: [prog] });
      useStore.getState().loadProgressionById('test-1');
      expect(useStore.getState().progression).toEqual(prog.chords);
      expect(useStore.getState().referenceRoot).toBe(5);
    });

    it('loadProgressionById does nothing for unknown id', () => {
      useStore.setState({ savedProgressions: [] });
      useStore.getState().loadProgressionById('nonexistent');
      expect(useStore.getState().progression).toEqual([]);
    });
  });
});
