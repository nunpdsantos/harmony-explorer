import { describe, it, expect } from 'vitest';
import {
  estimateDifficulty,
  suggestNextLesson,
  difficultyLabel,
  difficultyColor,
} from '../difficultyAdaptation';
import type { ExerciseAttempt, LessonMetrics } from '../progressTracker';

function makeAttempt(overrides: Partial<ExerciseAttempt> = {}): ExerciseAttempt {
  return {
    id: Math.random().toString(36),
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

function makeMetrics(overrides: Partial<LessonMetrics> = {}): LessonMetrics {
  return {
    lessonIndex: 0,
    completedAt: null,
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    totalTimeMs: 0,
    streak: 0,
    ...overrides,
  };
}

describe('difficultyAdaptation', () => {
  describe('estimateDifficulty', () => {
    it('returns medium for no attempts', () => {
      const d = estimateDifficulty('0-0', []);
      expect(d.tier).toBe('medium');
      expect(d.attempts).toBe(0);
    });

    it('returns easy for high accuracy and fast responses', () => {
      const attempts = Array.from({ length: 10 }, () =>
        makeAttempt({ exerciseId: '0-0', isCorrect: true, timeSpentMs: 2000 }),
      );
      const d = estimateDifficulty('0-0', attempts);
      expect(d.tier).toBe('easy');
      expect(d.accuracy).toBe(1);
    });

    it('returns medium for high accuracy but slow responses', () => {
      const attempts = Array.from({ length: 10 }, () =>
        makeAttempt({ exerciseId: '0-0', isCorrect: true, timeSpentMs: 8000 }),
      );
      const d = estimateDifficulty('0-0', attempts);
      expect(d.tier).toBe('medium');
    });

    it('returns medium for moderate accuracy', () => {
      const attempts = [
        ...Array.from({ length: 7 }, () =>
          makeAttempt({ exerciseId: '0-0', isCorrect: true, timeSpentMs: 2000 }),
        ),
        ...Array.from({ length: 3 }, () =>
          makeAttempt({ exerciseId: '0-0', isCorrect: false, timeSpentMs: 2000 }),
        ),
      ];
      const d = estimateDifficulty('0-0', attempts);
      expect(d.tier).toBe('medium');
      expect(d.accuracy).toBeCloseTo(0.7);
    });

    it('returns hard for low accuracy', () => {
      const attempts = [
        ...Array.from({ length: 2 }, () =>
          makeAttempt({ exerciseId: '0-0', isCorrect: true }),
        ),
        ...Array.from({ length: 8 }, () =>
          makeAttempt({ exerciseId: '0-0', isCorrect: false }),
        ),
      ];
      const d = estimateDifficulty('0-0', attempts);
      expect(d.tier).toBe('hard');
      expect(d.accuracy).toBeCloseTo(0.2);
    });

    it('only considers matching exerciseId', () => {
      const attempts = [
        makeAttempt({ exerciseId: '0-0', isCorrect: true }),
        makeAttempt({ exerciseId: '0-1', isCorrect: false }),
        makeAttempt({ exerciseId: '0-1', isCorrect: false }),
      ];
      const d = estimateDifficulty('0-0', attempts);
      expect(d.attempts).toBe(1);
      expect(d.accuracy).toBe(1);
    });
  });

  describe('suggestNextLesson', () => {
    it('suggests first unattempted lesson', () => {
      const metrics = [
        makeMetrics({ lessonIndex: 0, totalAttempts: 5, accuracy: 0.9 }),
        makeMetrics({ lessonIndex: 1, totalAttempts: 0 }),
        makeMetrics({ lessonIndex: 2, totalAttempts: 0 }),
      ];
      expect(suggestNextLesson(metrics)).toBe(1);
    });

    it('suggests weakest lesson when all attempted', () => {
      const metrics = [
        makeMetrics({ lessonIndex: 0, totalAttempts: 5, accuracy: 0.8 }),
        makeMetrics({ lessonIndex: 1, totalAttempts: 5, accuracy: 0.3 }),
        makeMetrics({ lessonIndex: 2, totalAttempts: 5, accuracy: 0.6 }),
      ];
      expect(suggestNextLesson(metrics)).toBe(1);
    });

    it('suggests moderate weakness when no below-50% exists', () => {
      const metrics = [
        makeMetrics({ lessonIndex: 0, totalAttempts: 5, accuracy: 0.7 }),
        makeMetrics({ lessonIndex: 1, totalAttempts: 5, accuracy: 0.6 }),
      ];
      expect(suggestNextLesson(metrics)).toBe(1);
    });

    it('returns null when all are strong', () => {
      const metrics = [
        makeMetrics({ lessonIndex: 0, totalAttempts: 5, accuracy: 0.95 }),
        makeMetrics({ lessonIndex: 1, totalAttempts: 5, accuracy: 0.9 }),
      ];
      expect(suggestNextLesson(metrics)).toBeNull();
    });
  });

  describe('difficultyLabel', () => {
    it('returns correct labels', () => {
      expect(difficultyLabel('easy')).toBe('Easy');
      expect(difficultyLabel('medium')).toBe('Medium');
      expect(difficultyLabel('hard')).toBe('Hard');
    });
  });

  describe('difficultyColor', () => {
    it('returns tailwind color classes', () => {
      expect(difficultyColor('easy')).toContain('green');
      expect(difficultyColor('medium')).toContain('amber');
      expect(difficultyColor('hard')).toContain('red');
    });
  });
});
