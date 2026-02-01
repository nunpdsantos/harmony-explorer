import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb-keyval before importing the module
const mockStore = new Map<string, unknown>();
vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(mockStore.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
  keys: vi.fn(() => Promise.resolve(Array.from(mockStore.keys()))),
}));

import { saveProgression, loadProgression, deleteProgression, listProgressions, generateId, type SavedProgression } from '../persistence';

describe('Persistence', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  const makeProg = (id: string, name: string, updatedAt: number = Date.now()): SavedProgression => ({
    id,
    name,
    chords: [{ root: 0, quality: 'major' }],
    key: 0,
    createdAt: Date.now(),
    updatedAt,
  });

  it('saves and loads a progression', async () => {
    const prog = makeProg('test-1', 'My Progression');
    await saveProgression(prog);
    const loaded = await loadProgression('test-1');
    expect(loaded).toEqual(prog);
  });

  it('returns undefined for non-existent progression', async () => {
    const loaded = await loadProgression('nonexistent');
    expect(loaded).toBeUndefined();
  });

  it('deletes a progression', async () => {
    const prog = makeProg('test-2', 'To Delete');
    await saveProgression(prog);
    await deleteProgression('test-2');
    const loaded = await loadProgression('test-2');
    expect(loaded).toBeUndefined();
  });

  it('lists progressions sorted by updatedAt (newest first)', async () => {
    await saveProgression(makeProg('old', 'Old', 1000));
    await saveProgression(makeProg('new', 'New', 3000));
    await saveProgression(makeProg('mid', 'Mid', 2000));

    const list = await listProgressions();
    expect(list).toHaveLength(3);
    expect(list[0].id).toBe('new');
    expect(list[1].id).toBe('mid');
    expect(list[2].id).toBe('old');
  });

  it('listProgressions returns empty array when no progressions', async () => {
    const list = await listProgressions();
    expect(list).toEqual([]);
  });

  describe('generateId', () => {
    it('returns a string', () => {
      expect(typeof generateId()).toBe('string');
    });

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateId()));
      expect(ids.size).toBe(50);
    });

    it('has reasonable length', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThanOrEqual(5);
      expect(id.length).toBeLessThanOrEqual(20);
    });
  });
});
