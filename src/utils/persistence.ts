import { get, set, del, keys } from 'idb-keyval';
import type { Chord } from '../core/chords';

export interface SavedProgression {
  id: string;
  name: string;
  chords: Chord[];
  key: number;
  createdAt: number;
  updatedAt: number;
}

const PREFIX = 'harmony-explorer:';

function key(id: string): string {
  return `${PREFIX}progression:${id}`;
}

export async function saveProgression(progression: SavedProgression): Promise<void> {
  await set(key(progression.id), progression);
}

export async function loadProgression(id: string): Promise<SavedProgression | undefined> {
  return get<SavedProgression>(key(id));
}

export async function deleteProgression(id: string): Promise<void> {
  await del(key(id));
}

export async function listProgressions(): Promise<SavedProgression[]> {
  const allKeys = await keys();
  const progressionKeys = allKeys.filter(k =>
    typeof k === 'string' && k.startsWith(`${PREFIX}progression:`)
  );

  const progressions: SavedProgression[] = [];
  for (const k of progressionKeys) {
    const prog = await get<SavedProgression>(k as string);
    if (prog) progressions.push(prog);
  }

  return progressions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
