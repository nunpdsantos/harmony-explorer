import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';
import { chord } from '../../core/chords';

const C = chord(0, 'major');
const G = chord(7, 'major');
const Am = chord(9, 'minor');
const F = chord(5, 'major');

describe('Undo Middleware', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState({
      progression: [],
      referenceRoot: 0,
      selectedChord: null,
    });
  });

  it('exposes undo and redo functions', () => {
    const state = useStore.getState();
    expect(typeof state.undo).toBe('function');
    expect(typeof state.redo).toBe('function');
  });

  it('exposes canUndo and canRedo booleans', () => {
    const state = useStore.getState();
    expect(typeof state.canUndo).toBe('boolean');
    expect(typeof state.canRedo).toBe('boolean');
  });

  it('canUndo becomes true after adding a chord', () => {
    useStore.getState().addToProgression(C);
    expect(useStore.getState().canUndo).toBe(true);
  });

  it('undo restores previous progression', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    expect(useStore.getState().progression).toHaveLength(2);

    useStore.getState().undo();
    expect(useStore.getState().progression).toHaveLength(1);
    expect(useStore.getState().progression[0]).toEqual(C);
  });

  it('redo restores undone progression', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    useStore.getState().undo();

    expect(useStore.getState().canRedo).toBe(true);
    useStore.getState().redo();
    expect(useStore.getState().progression).toHaveLength(2);
  });

  it('new change after undo clears redo stack', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    useStore.getState().undo();

    // Make a new change
    useStore.getState().addToProgression(Am);
    expect(useStore.getState().canRedo).toBe(false);
  });

  it('clearProgression is undoable', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    const before = useStore.getState().progression.length;
    useStore.getState().clearProgression();
    expect(useStore.getState().progression).toHaveLength(0);

    useStore.getState().undo();
    expect(useStore.getState().progression).toHaveLength(before);
  });

  it('setProgression is undoable', () => {
    useStore.getState().addToProgression(C);
    const before = [...useStore.getState().progression];
    useStore.getState().setProgression([F, G, Am]);
    expect(useStore.getState().progression).toHaveLength(3);

    useStore.getState().undo();
    expect(useStore.getState().progression).toEqual(before);
  });

  it('removeFromProgression is undoable', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    useStore.getState().addToProgression(Am);
    const before = useStore.getState().progression.length;
    useStore.getState().removeFromProgression(1);
    expect(useStore.getState().progression).toHaveLength(before - 1);

    useStore.getState().undo();
    expect(useStore.getState().progression).toHaveLength(before);
  });

  it('undo then redo returns to same state', () => {
    useStore.getState().addToProgression(C);
    useStore.getState().addToProgression(G);
    const snapshot = [...useStore.getState().progression];

    useStore.getState().undo();
    useStore.getState().redo();

    expect(useStore.getState().progression).toEqual(snapshot);
  });

  it('sequential undos walk back step by step', () => {
    // Starting fresh in this test
    useStore.getState().addToProgression(C);
    const after1 = [...useStore.getState().progression];
    useStore.getState().addToProgression(G);
    const after2 = [...useStore.getState().progression];
    useStore.getState().addToProgression(Am);

    // Undo to state after 2 chords
    useStore.getState().undo();
    expect(useStore.getState().progression).toEqual(after2);

    // Undo to state after 1 chord
    useStore.getState().undo();
    expect(useStore.getState().progression).toEqual(after1);
  });
});
