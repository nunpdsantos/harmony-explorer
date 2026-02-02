import { get, set, keys } from 'idb-keyval';

// ---------------------------------------------------------------------------
// SM-2 Algorithm implementation
// https://en.wikipedia.org/wiki/SuperMemo#SM-2_algorithm
// ---------------------------------------------------------------------------

export interface ReviewCard {
  /** "lessonIndex-exerciseIndex" */
  exerciseId: string;
  /** Current inter-repetition interval in days */
  interval: number;
  /** Ease factor (default 2.5) */
  easeFactor: number;
  /** Number of consecutive correct reviews */
  repetitions: number;
  /** Unix timestamp of next review date */
  nextReviewDate: number;
  /** Unix timestamp of last attempt */
  lastAttemptAt: number;
}

// ---------------------------------------------------------------------------
// IndexedDB keys
// ---------------------------------------------------------------------------

const PREFIX = 'harmony-explorer:';
const REVIEW_PREFIX = `${PREFIX}review:`;

function reviewKey(exerciseId: string): string {
  return `${REVIEW_PREFIX}${exerciseId}`;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getReviewCard(
  exerciseId: string,
): Promise<ReviewCard | undefined> {
  return get<ReviewCard>(reviewKey(exerciseId));
}

export async function saveReviewCard(card: ReviewCard): Promise<void> {
  await set(reviewKey(card.exerciseId), card);
}

export async function listReviewCards(): Promise<ReviewCard[]> {
  const allKeys = await keys();
  const reviewKeys = allKeys.filter(
    k => typeof k === 'string' && k.startsWith(REVIEW_PREFIX),
  );

  const cards: ReviewCard[] = [];
  for (const k of reviewKeys) {
    const c = await get<ReviewCard>(k as string);
    if (c) cards.push(c);
  }

  return cards;
}

// ---------------------------------------------------------------------------
// SM-2 core
// ---------------------------------------------------------------------------

const MIN_EASE_FACTOR = 1.3;

/**
 * Process a review answer and return the updated card.
 *
 * @param card   Current card state (or undefined for first review)
 * @param quality 0-5 (0=forgot, 5=perfect) per SM-2 specification
 * @param now    Current timestamp (default Date.now())
 * @returns Updated review card
 */
export function processReview(
  card: ReviewCard | undefined,
  exerciseId: string,
  quality: number,
  now: number = Date.now(),
): ReviewCard {
  const q = Math.min(5, Math.max(0, Math.round(quality)));

  const prevEF = card?.easeFactor ?? 2.5;
  const prevReps = card?.repetitions ?? 0;

  // Update ease factor
  let newEF = prevEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < MIN_EASE_FACTOR) newEF = MIN_EASE_FACTOR;

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    // Failed review — reset
    newInterval = 1;
    newReps = 0;
  } else {
    // Successful review
    newReps = prevReps + 1;
    if (newReps === 1) {
      newInterval = 1;
    } else if (newReps === 2) {
      newInterval = 3;
    } else {
      const prevInterval = card?.interval ?? 1;
      newInterval = Math.round(prevInterval * newEF);
    }
  }

  const msPerDay = 24 * 60 * 60 * 1000;

  return {
    exerciseId,
    interval: newInterval,
    easeFactor: Math.round(newEF * 100) / 100,
    repetitions: newReps,
    nextReviewDate: now + newInterval * msPerDay,
    lastAttemptAt: now,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Get exercises that are due for review (nextReviewDate <= now).
 */
export function getDueCards(
  cards: ReviewCard[],
  now: number = Date.now(),
): ReviewCard[] {
  return cards
    .filter(c => c.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
}

/**
 * Count exercises due for review.
 */
export function countDueReviews(
  cards: ReviewCard[],
  now: number = Date.now(),
): number {
  return getDueCards(cards, now).length;
}
