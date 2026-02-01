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

// Zustand middleware internals require broad casts due to complex
// generic constraints. The public API (UndoSlice) is fully typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const undoable: UndoImpl = (config) => (set, get, api) => {
  const past: HistoryEntry[] = [];
  const future: HistoryEntry[] = [];

  // Track the last-known progression to detect changes
  let lastProgression: unknown[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawSet = set as (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawGet = get as () => any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrappedSet = ((...args: any[]) => {
    // Capture state before mutation
    const prev = rawGet().progression;

    // Apply the actual mutation
    rawSet(...args);

    // Check if progression changed
    const next = rawGet().progression;
    if (next !== prev && next !== lastProgression) {
      past.push({ progression: prev });
      if (past.length > MAX_HISTORY) past.shift();
      future.length = 0; // clear redo stack
      lastProgression = next;

      // Update canUndo/canRedo flags
      rawSet({
        canUndo: past.length > 0,
        canRedo: false,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialState = config(wrappedSet, get as any, api);

  return {
    ...initialState,
    canUndo: false,
    canRedo: false,
    undo: () => {
      const entry = past.pop();
      if (!entry) return;
      const current = rawGet().progression;
      future.push({ progression: current });
      lastProgression = entry.progression;
      rawSet({
        progression: entry.progression,
        canUndo: past.length > 0,
        canRedo: true,
      });
    },
    redo: () => {
      const entry = future.pop();
      if (!entry) return;
      const current = rawGet().progression;
      past.push({ progression: current });
      lastProgression = entry.progression;
      rawSet({
        progression: entry.progression,
        canUndo: true,
        canRedo: future.length > 0,
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};
