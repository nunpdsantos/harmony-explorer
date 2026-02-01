import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

/**
 * Zustand middleware that tracks changes to the `progression` field
 * and exposes undo/redo capability.
 *
 * Usage: wrap the store creator with `undoable(...)`.
 * The store will gain `undo`, `redo`, `canUndo`, `canRedo` fields.
 */

const MAX_HISTORY = 50;

export interface UndoSlice {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface HistoryEntry {
  progression: unknown[];
}

type UndoImpl = <
  T extends { progression: unknown[] },
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs>,
) => StateCreator<T & UndoSlice, Mps, Mcs>;

export const undoable: UndoImpl = (config) => (set, get, api) => {
  const past: HistoryEntry[] = [];
  const future: HistoryEntry[] = [];

  // Track the last-known progression to detect changes
  let lastProgression: unknown[] = [];

  const wrappedSet: typeof set = (...args) => {
    // Capture state before mutation
    const prev = (get() as { progression: unknown[] }).progression;

    // Apply the actual mutation
    (set as (...a: unknown[]) => void)(...args);

    // Check if progression changed
    const next = (get() as { progression: unknown[] }).progression;
    if (next !== prev && next !== lastProgression) {
      past.push({ progression: prev });
      if (past.length > MAX_HISTORY) past.shift();
      future.length = 0; // clear redo stack
      lastProgression = next;

      // Update canUndo/canRedo flags
      (set as (...a: unknown[]) => void)({
        canUndo: past.length > 0,
        canRedo: false,
      } as Partial<typeof get extends () => infer R ? R : never>);
    }
  };

  const initialState = config(wrappedSet, get, api);

  return {
    ...initialState,
    canUndo: false,
    canRedo: false,
    undo: () => {
      const entry = past.pop();
      if (!entry) return;
      const current = (get() as { progression: unknown[] }).progression;
      future.push({ progression: current });
      lastProgression = entry.progression;
      (set as (...a: unknown[]) => void)({
        progression: entry.progression,
        canUndo: past.length > 0,
        canRedo: true,
      } as Partial<typeof get extends () => infer R ? R : never>);
    },
    redo: () => {
      const entry = future.pop();
      if (!entry) return;
      const current = (get() as { progression: unknown[] }).progression;
      past.push({ progression: current });
      lastProgression = entry.progression;
      (set as (...a: unknown[]) => void)({
        progression: entry.progression,
        canUndo: true,
        canRedo: future.length > 0,
      } as Partial<typeof get extends () => infer R ? R : never>);
    },
  } as ReturnType<typeof config> & UndoSlice;
};
