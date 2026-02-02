import { get, set, keys } from 'idb-keyval';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExerciseAttempt {
  id: string;
  /** "lessonIndex-exerciseIndex" */
  exerciseId: string;
  lessonIndex: number;
  exerciseIndex: number;
  timestamp: number;
  isCorrect: boolean;
  /** SM-2 quality: 0 (forgot) to 5 (perfect) */
  quality: number;
  /** Milliseconds spent before answering */
  timeSpentMs: number;
  /** Number of wrong answers before correct */
  retriesBeforeCorrect: number;
}

export interface LessonMetrics {
  lessonIndex: number;
  completedAt: number | null;
  totalAttempts: number;
  correctAttempts: number;
  /** 0-1 */
  accuracy: number;
  /** Total time spent in ms */
  totalTimeMs: number;
  /** Streak of consecutive correct first attempts */
  streak: number;
}

// ---------------------------------------------------------------------------
// IndexedDB keys
// ---------------------------------------------------------------------------

const PREFIX = 'harmony-explorer:';
const ATTEMPT_PREFIX = `${PREFIX}attempt:`;

function attemptKey(id: string): string {
  return `${ATTEMPT_PREFIX}${id}`;
}

// ---------------------------------------------------------------------------
// Unique ID
// ---------------------------------------------------------------------------

export function generateAttemptId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function saveAttempt(attempt: ExerciseAttempt): Promise<void> {
  await set(attemptKey(attempt.id), attempt);
}

export async function getAttempt(id: string): Promise<ExerciseAttempt | undefined> {
  return get<ExerciseAttempt>(attemptKey(id));
}

export async function listAttempts(): Promise<ExerciseAttempt[]> {
  const allKeys = await keys();
  const attemptKeys = allKeys.filter(
    k => typeof k === 'string' && k.startsWith(ATTEMPT_PREFIX),
  );

  const attempts: ExerciseAttempt[] = [];
  for (const k of attemptKeys) {
    const a = await get<ExerciseAttempt>(k as string);
    if (a) attempts.push(a);
  }

  return attempts.sort((a, b) => b.timestamp - a.timestamp);
}

export async function listAttemptsForExercise(
  exerciseId: string,
): Promise<ExerciseAttempt[]> {
  const all = await listAttempts();
  return all.filter(a => a.exerciseId === exerciseId);
}

export async function listAttemptsForLesson(
  lessonIndex: number,
): Promise<ExerciseAttempt[]> {
  const all = await listAttempts();
  return all.filter(a => a.lessonIndex === lessonIndex);
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export function exerciseIdFromIndices(
  lessonIndex: number,
  exerciseIndex: number,
): string {
  return `${lessonIndex}-${exerciseIndex}`;
}

/**
 * Convert a list of attempts into per-exercise quality for SM-2.
 * Quality 5 = correct first try, 4 = correct after 1 retry,
 * 3 = correct after 2+, 2 = eventually correct but slow,
 * 1 = incorrect (no retry), 0 = never answered
 */
export function attemptToQuality(attempt: ExerciseAttempt): number {
  if (!attempt.isCorrect) return 1;
  if (attempt.retriesBeforeCorrect === 0) {
    return attempt.timeSpentMs < 5000 ? 5 : 4;
  }
  if (attempt.retriesBeforeCorrect === 1) return 3;
  return 2;
}

export function computeLessonMetrics(
  lessonIndex: number,
  attempts: ExerciseAttempt[],
): LessonMetrics {
  const lessonAttempts = attempts.filter(a => a.lessonIndex === lessonIndex);

  if (lessonAttempts.length === 0) {
    return {
      lessonIndex,
      completedAt: null,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      totalTimeMs: 0,
      streak: 0,
    };
  }

  const totalAttempts = lessonAttempts.length;
  const correctAttempts = lessonAttempts.filter(a => a.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;
  const totalTimeMs = lessonAttempts.reduce((sum, a) => sum + a.timeSpentMs, 0);

  // Streak: count consecutive first-try correct answers starting from most recent
  const sorted = [...lessonAttempts].sort((a, b) => b.timestamp - a.timestamp);
  let streak = 0;
  for (const a of sorted) {
    if (a.isCorrect && a.retriesBeforeCorrect === 0) streak++;
    else break;
  }

  const completedAt = lessonAttempts.length > 0
    ? Math.max(...lessonAttempts.map(a => a.timestamp))
    : null;

  return {
    lessonIndex,
    completedAt,
    totalAttempts,
    correctAttempts,
    accuracy,
    totalTimeMs,
    streak,
  };
}

/**
 * Get metrics for all lessons (0..lessonCount-1).
 */
export function computeAllLessonMetrics(
  lessonCount: number,
  attempts: ExerciseAttempt[],
): LessonMetrics[] {
  return Array.from({ length: lessonCount }, (_, i) =>
    computeLessonMetrics(i, attempts),
  );
}

/**
 * Identify weakest topic areas by accuracy.
 * Returns lesson indices sorted by accuracy ascending (weakest first).
 */
export function weakestLessons(
  metrics: LessonMetrics[],
  minAttempts: number = 3,
): number[] {
  return metrics
    .filter(m => m.totalAttempts >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map(m => m.lessonIndex);
}

/**
 * Count total practice days from attempt timestamps.
 */
export function practiceDays(attempts: ExerciseAttempt[]): Set<string> {
  const days = new Set<string>();
  for (const a of attempts) {
    const d = new Date(a.timestamp);
    days.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return days;
}
