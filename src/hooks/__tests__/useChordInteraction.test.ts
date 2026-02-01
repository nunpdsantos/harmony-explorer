import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChordInteraction } from '../useChordInteraction';
import { useStore } from '../../state/store';
import { chord } from '../../core/chords';

// Mock audio modules — they require browser APIs
vi.mock('../../audio/audioEngine', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn(),
}));

vi.mock('../../audio/voicingEngine', () => ({
  getVoicing: vi.fn(() => [60, 64, 67]),
}));

const cMajor = chord(0, 'major');
const gMajor = chord(7, 'major');

describe('useChordInteraction', () => {
  beforeEach(() => {
    useStore.setState({
      selectedChord: null,
      hoveredChord: null,
      audioReady: true,
      progression: [],
    });
    vi.clearAllMocks();
  });

  it('returns handleChordClick and handleChordHover', () => {
    const { result } = renderHook(() => useChordInteraction());
    expect(typeof result.current.handleChordClick).toBe('function');
    expect(typeof result.current.handleChordHover).toBe('function');
  });

  it('handleChordClick sets selectedChord in store', async () => {
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(cMajor);
    });

    expect(useStore.getState().selectedChord).toEqual(cMajor);
  });

  it('handleChordClick adds chord to progression', async () => {
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(cMajor);
    });

    expect(useStore.getState().progression).toHaveLength(1);
    expect(useStore.getState().progression[0]).toEqual(cMajor);
  });

  it('handleChordClick calls playChord via audio engine', async () => {
    const { playChord } = await import('../../audio/audioEngine');
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(gMajor);
    });

    expect(playChord).toHaveBeenCalledTimes(1);
  });

  it('handleChordClick initializes audio if not ready', async () => {
    useStore.setState({ audioReady: false });
    const { initAudio } = await import('../../audio/audioEngine');
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(cMajor);
    });

    expect(initAudio).toHaveBeenCalledTimes(1);
    expect(useStore.getState().audioReady).toBe(true);
  });

  it('handleChordClick does not reinit audio if already ready', async () => {
    useStore.setState({ audioReady: true });
    const { initAudio } = await import('../../audio/audioEngine');
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(cMajor);
    });

    expect(initAudio).not.toHaveBeenCalled();
  });

  it('handleChordHover sets hoveredChord in store', () => {
    const { result } = renderHook(() => useChordInteraction());

    act(() => {
      result.current.handleChordHover(gMajor);
    });

    expect(useStore.getState().hoveredChord).toEqual(gMajor);
  });

  it('handleChordHover sets null on leave', () => {
    useStore.setState({ hoveredChord: gMajor });
    const { result } = renderHook(() => useChordInteraction());

    act(() => {
      result.current.handleChordHover(null);
    });

    expect(useStore.getState().hoveredChord).toBeNull();
  });

  it('multiple chord clicks build the progression', async () => {
    const { result } = renderHook(() => useChordInteraction());

    await act(async () => {
      await result.current.handleChordClick(cMajor);
    });
    await act(async () => {
      await result.current.handleChordClick(gMajor);
    });

    expect(useStore.getState().progression).toHaveLength(2);
  });
});
