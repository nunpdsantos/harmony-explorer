import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exerciseIdFromIndices,
  attemptToQuality,
  computeLessonMetrics,
  computeAllLessonMetrics,
  weakestLessons,
  practiceDays,
  generateAttemptId,
  saveAttempt,
  getAttempt,
  listAttempts,
  listAttemptsForExercise,
  listAttemptsForLesson,
  type ExerciseAttempt,
} from '../progressTracker';

// Mock idb-keyval
const store = new Map<string, unknown>();
vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(store.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    store.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  }),
  keys: vi.fn(() => Promise.resolve([...store.keys()])),
}));

function makeAttempt(overrides: Partial<ExerciseAttempt> = {}): ExerciseAttempt {
  return {
    id: generateAttemptId(),
    exerciseId: '0-0',
    lessonIndex: 0,
    exerciseIndex: 0,
    timestamp: Date.now(),
    isCorrect: true,
    quality: 5,
    timeSpentMs: 2000,
    retriesBeforeCorrect: 0,
    ...overrides,
  };
}

describe('progressTracker', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('exerciseIdFromIndices', () => {
    it('formats correctly', () => {
      expect(exerciseIdFromIndices(3, 2)).toBe('3-2');
    });

    it('handles zero indices', () => {
      expect(exerciseIdFromIndices(0, 0)).toBe('0-0');
    });
  });

  describe('generateAttemptId', () => {
    it('returns a string', () => {
      expect(typeof generateAttemptId()).toBe('string');
    });

    it('generates unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateAttemptId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('attemptToQuality', () => {
    it('returns 5 for fast correct first try', () => {
      expect(attemptToQuality(makeAttempt({ isCorrect: true, retriesBeforeCorrect: 0, timeSpentMs: 2000 }))).toBe(5);
    });

    it('returns 4 for slow correct first try', () => {
      expect(attemptToQuality(makeAttempt({ isCorrect: true, retriesBeforeCorrect: 0, timeSpentMs: 6000 }))).toBe(4);
    });

    it('returns 3 for correct after 1 retry', () => {
      expect(attemptToQuality(makeAttempt({ isCorrect: true, retriesBeforeCorrect: 1 }))).toBe(3);
    });

    it('returns 2 for correct after 2+ retries', () => {
      expect(attemptToQuality(makeAttempt({ isCorrect: true, retriesBeforeCorrect: 3 }))).toBe(2);
    });

    it('returns 1 for incorrect', () => {
      expect(attemptToQuality(makeAttempt({ isCorrect: false }))).toBe(1);
    });
  });

  describe('CRUD operations', () => {
    it('saves and retrieves an attempt', async () => {
      const a = makeAttempt({ id: 'test1' });
      await saveAttempt(a);
      const loaded = await getAttempt('test1');
      expect(loaded).toEqual(a);
    });

    it('returns undefined for missing attempt', async () => {
      const loaded = await getAttempt('nonexistent');
      expect(loaded).toBeUndefined();
    });

    it('lists all attempts sorted by timestamp desc', async () => {
      const a1 = makeAttempt({ id: 'a1', timestamp: 1000 });
      const a2 = makeAttempt({ id: 'a2', timestamp: 3000 });
      const a3 = makeAttempt({ id: 'a3', timestamp: 2000 });
      await saveAttempt(a1);
      await saveAttempt(a2);
      await saveAttempt(a3);
      const list = await listAttempts();
      expect(list.map(a => a.id)).toEqual(['a2', 'a3', 'a1']);
    });

    it('filters by exerciseId', async () => {
      await saveAttempt(makeAttempt({ id: 'x1', exerciseId: '0-0' }));
      await saveAttempt(makeAttempt({ id: 'x2', exerciseId: '0-1' }));
      await saveAttempt(makeAttempt({ id: 'x3', exerciseId: '0-0' }));
      const filtered = await listAttemptsForExercise('0-0');
      expect(filtered).toHaveLength(2);
    });

    it('filters by lessonIndex', async () => {
      await saveAttempt(makeAttempt({ id: 'y1', lessonIndex: 0 }));
      await saveAttempt(makeAttempt({ id: 'y2', lessonIndex: 1 }));
      await saveAttempt(makeAttempt({ id: 'y3', lessonIndex: 0 }));
      const filtered = await listAttemptsForLesson(0);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('computeLessonMetrics', () => {
    it('returns zeroed metrics for no attempts', () => {
      const m = computeLessonMetrics(0, []);
      expect(m.totalAttempts).toBe(0);
      expect(m.accuracy).toBe(0);
      expect(m.streak).toBe(0);
      expect(m.completedAt).toBeNull();
    });

    it('computes accuracy', () => {
      const attempts = [
        makeAttempt({ lessonIndex: 0, isCorrect: true }),
        makeAttempt({ lessonIndex: 0, isCorrect: true }),
        makeAttempt({ lessonIndex: 0, isCorrect: false }),
      ];
      const m = computeLessonMetrics(0, attempts);
      expect(m.accuracy).toBeCloseTo(2 / 3);
      expect(m.totalAttempts).toBe(3);
      expect(m.correctAttempts).toBe(2);
    });

    it('computes total time', () => {
      const attempts = [
        makeAttempt({ lessonIndex: 0, timeSpentMs: 1000 }),
        makeAttempt({ lessonIndex: 0, timeSpentMs: 2000 }),
      ];
      const m = computeLessonMetrics(0, attempts);
      expect(m.totalTimeMs).toBe(3000);
    });

    it('computes streak of first-try correct from most recent', () => {
      const attempts = [
        makeAttempt({ lessonIndex: 0, isCorrect: true, retriesBeforeCorrect: 0, timestamp: 1000 }),
        makeAttempt({ lessonIndex: 0, isCorrect: false, retriesBeforeCorrect: 1, timestamp: 2000 }),
        makeAttempt({ lessonIndex: 0, isCorrect: true, retriesBeforeCorrect: 0, timestamp: 3000 }),
        makeAttempt({ lessonIndex: 0, isCorrect: true, retriesBeforeCorrect: 0, timestamp: 4000 }),
      ];
      const m = computeLessonMetrics(0, attempts);
      // Most recent first: 4000(correct), 3000(correct), 2000(wrong) → streak=2
      expect(m.streak).toBe(2);
    });

    it('ignores attempts from other lessons', () => {
      const attempts = [
        makeAttempt({ lessonIndex: 0, isCorrect: true }),
        makeAttempt({ lessonIndex: 1, isCorrect: false }),
      ];
      const m = computeLessonMetrics(0, attempts);
      expect(m.totalAttempts).toBe(1);
      expect(m.accuracy).toBe(1);
    });
  });

  describe('computeAllLessonMetrics', () => {
    it('returns metrics for all lessons', () => {
      const all = computeAllLessonMetrics(3, []);
      expect(all).toHaveLength(3);
      expect(all[0].lessonIndex).toBe(0);
      expect(all[2].lessonIndex).toBe(2);
    });
  });

  describe('weakestLessons', () => {
    it('returns lessons sorted by accuracy ascending', () => {
      const metrics = [
        { lessonIndex: 0, accuracy: 0.9, totalAttempts: 5 } as any,
        { lessonIndex: 1, accuracy: 0.4, totalAttempts: 5 } as any,
        { lessonIndex: 2, accuracy: 0.7, totalAttempts: 5 } as any,
      ];
      expect(weakestLessons(metrics)).toEqual([1, 2, 0]);
    });

    it('filters by minimum attempts', () => {
      const metrics = [
        { lessonIndex: 0, accuracy: 0.3, totalAttempts: 2 } as any,
        { lessonIndex: 1, accuracy: 0.5, totalAttempts: 5 } as any,
      ];
      expect(weakestLessons(metrics, 3)).toEqual([1]);
    });
  });

  describe('practiceDays', () => {
    it('counts unique days', () => {
      const d1 = new Date('2026-01-15T10:00:00Z').getTime();
      const d2 = new Date('2026-01-15T15:00:00Z').getTime();
      const d3 = new Date('2026-01-16T10:00:00Z').getTime();
      const attempts = [
        makeAttempt({ timestamp: d1 }),
        makeAttempt({ timestamp: d2 }),
        makeAttempt({ timestamp: d3 }),
      ];
      const days = practiceDays(attempts);
      expect(days.size).toBe(2);
    });

    it('returns empty set for no attempts', () => {
      expect(practiceDays([]).size).toBe(0);
    });
  });
});
