import type { ExerciseAttempt, LessonMetrics } from './progressTracker';

// ---------------------------------------------------------------------------
// Difficulty tiers
// ---------------------------------------------------------------------------

export type DifficultyTier = 'easy' | 'medium' | 'hard';

export interface ExerciseDifficulty {
  exerciseId: string;
  tier: DifficultyTier;
  accuracy: number;
  attempts: number;
}

// ---------------------------------------------------------------------------
// Per-exercise difficulty estimation
// ---------------------------------------------------------------------------

/**
 * Estimate difficulty from attempt history.
 * - accuracy >= 0.85 and avg time < 5s → easy
 * - accuracy >= 0.50 → medium
 * - below 0.50 → hard
 */
export function estimateDifficulty(
  exerciseId: string,
  attempts: ExerciseAttempt[],
): ExerciseDifficulty {
  const relevant = attempts.filter(a => a.exerciseId === exerciseId);

  if (relevant.length === 0) {
    return { exerciseId, tier: 'medium', accuracy: 0, attempts: 0 };
  }

  const correct = relevant.filter(a => a.isCorrect).length;
  const accuracy = correct / relevant.length;
  const avgTime =
    relevant.reduce((sum, a) => sum + a.timeSpentMs, 0) / relevant.length;

  let tier: DifficultyTier;
  if (accuracy >= 0.85 && avgTime < 5000) {
    tier = 'easy';
  } else if (accuracy >= 0.5) {
    tier = 'medium';
  } else {
    tier = 'hard';
  }

  return { exerciseId, tier, accuracy, attempts: relevant.length };
}

// ---------------------------------------------------------------------------
// Lesson recommendation
// ---------------------------------------------------------------------------

/**
 * Suggest the next lesson to study based on metrics.
 * Priority:
 * 1. Lessons never attempted (in order)
 * 2. Lessons with accuracy < 50% (weakest first)
 * 3. Lessons with accuracy < 85% (weakest first)
 * 4. Null (all strong)
 */
export function suggestNextLesson(
  metrics: LessonMetrics[],
): number | null {
  // Never attempted
  const unattempted = metrics.find(m => m.totalAttempts === 0);
  if (unattempted) return unattempted.lessonIndex;

  // Weak lessons (< 50%)
  const weak = metrics
    .filter(m => m.accuracy < 0.5)
    .sort((a, b) => a.accuracy - b.accuracy);
  if (weak.length > 0) return weak[0].lessonIndex;

  // Moderate lessons (< 85%)
  const moderate = metrics
    .filter(m => m.accuracy < 0.85)
    .sort((a, b) => a.accuracy - b.accuracy);
  if (moderate.length > 0) return moderate[0].lessonIndex;

  return null;
}

/**
 * Get a difficulty badge label for display.
 */
export function difficultyLabel(tier: DifficultyTier): string {
  switch (tier) {
    case 'easy': return 'Easy';
    case 'medium': return 'Medium';
    case 'hard': return 'Hard';
  }
}

/**
 * Get a color token name for difficulty tier display.
 * Returns Tailwind-compatible color classes.
 */
export function difficultyColor(tier: DifficultyTier): string {
  switch (tier) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-amber-400';
    case 'hard': return 'text-red-400';
  }
}
