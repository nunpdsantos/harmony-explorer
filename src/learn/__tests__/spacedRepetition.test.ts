import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processReview,
  getDueCards,
  countDueReviews,
  getReviewCard,
  saveReviewCard,
  listReviewCards,
  type ReviewCard,
} from '../spacedRepetition';

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('spacedRepetition', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('processReview', () => {
    const now = 1700000000000;

    it('creates new card with defaults for first review', () => {
      const card = processReview(undefined, '0-0', 5, now);
      expect(card.exerciseId).toBe('0-0');
      expect(card.repetitions).toBe(1);
      expect(card.interval).toBe(1);
      expect(card.easeFactor).toBeGreaterThanOrEqual(2.5);
      expect(card.nextReviewDate).toBe(now + 1 * MS_PER_DAY);
      expect(card.lastAttemptAt).toBe(now);
    });

    it('second successful review gives interval 3', () => {
      const card1 = processReview(undefined, '0-0', 5, now);
      const card2 = processReview(card1, '0-0', 5, now + MS_PER_DAY);
      expect(card2.repetitions).toBe(2);
      expect(card2.interval).toBe(3);
    });

    it('third successful review uses ease factor', () => {
      const card1 = processReview(undefined, '0-0', 5, now);
      const card2 = processReview(card1, '0-0', 5, now + MS_PER_DAY);
      const card3 = processReview(card2, '0-0', 5, now + 4 * MS_PER_DAY);
      expect(card3.repetitions).toBe(3);
      // interval = round(3 * EF)
      expect(card3.interval).toBeGreaterThan(3);
    });

    it('failed review resets repetitions and interval', () => {
      const card1 = processReview(undefined, '0-0', 5, now);
      const card2 = processReview(card1, '0-0', 5, now + MS_PER_DAY);
      const cardFail = processReview(card2, '0-0', 1, now + 4 * MS_PER_DAY);
      expect(cardFail.repetitions).toBe(0);
      expect(cardFail.interval).toBe(1);
    });

    it('quality 0 resets like a failure', () => {
      const card1 = processReview(undefined, '0-0', 5, now);
      const cardFail = processReview(card1, '0-0', 0, now + MS_PER_DAY);
      expect(cardFail.repetitions).toBe(0);
      expect(cardFail.interval).toBe(1);
    });

    it('quality 3 is passing threshold', () => {
      const card = processReview(undefined, '0-0', 3, now);
      expect(card.repetitions).toBe(1);
    });

    it('quality 2 fails (below 3 threshold)', () => {
      const card = processReview(undefined, '0-0', 2, now);
      expect(card.repetitions).toBe(0);
      expect(card.interval).toBe(1);
    });

    it('ease factor never drops below 1.3', () => {
      let card: ReviewCard | undefined;
      // Repeatedly answer with quality 0 to drive EF down
      for (let i = 0; i < 20; i++) {
        card = processReview(card, '0-0', 0, now + i * MS_PER_DAY);
      }
      expect(card!.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('ease factor increases for quality 5', () => {
      const card1 = processReview(undefined, '0-0', 5, now);
      const card2 = processReview(card1, '0-0', 5, now + MS_PER_DAY);
      expect(card2.easeFactor).toBeGreaterThanOrEqual(card1.easeFactor);
    });

    it('clamps quality to 0-5 range', () => {
      const cardNeg = processReview(undefined, '0-0', -2, now);
      expect(cardNeg.repetitions).toBe(0); // quality 0 → fail

      const cardHigh = processReview(undefined, '0-0', 10, now);
      expect(cardHigh.repetitions).toBe(1); // quality 5 → pass
    });
  });

  describe('getDueCards', () => {
    const now = 1700000000000;

    it('returns cards with nextReviewDate <= now', () => {
      const cards: ReviewCard[] = [
        { exerciseId: '0-0', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now - 1000, lastAttemptAt: 0 },
        { exerciseId: '0-1', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now + 100000, lastAttemptAt: 0 },
        { exerciseId: '0-2', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now, lastAttemptAt: 0 },
      ];
      const due = getDueCards(cards, now);
      expect(due).toHaveLength(2);
      expect(due.map(c => c.exerciseId)).toContain('0-0');
      expect(due.map(c => c.exerciseId)).toContain('0-2');
    });

    it('sorts by nextReviewDate ascending (most overdue first)', () => {
      const cards: ReviewCard[] = [
        { exerciseId: '0-0', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now - 1000, lastAttemptAt: 0 },
        { exerciseId: '0-1', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now - 5000, lastAttemptAt: 0 },
      ];
      const due = getDueCards(cards, now);
      expect(due[0].exerciseId).toBe('0-1');
    });

    it('returns empty array when nothing is due', () => {
      const cards: ReviewCard[] = [
        { exerciseId: '0-0', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now + 100000, lastAttemptAt: 0 },
      ];
      expect(getDueCards(cards, now)).toHaveLength(0);
    });
  });

  describe('countDueReviews', () => {
    it('counts due cards', () => {
      const now = 1700000000000;
      const cards: ReviewCard[] = [
        { exerciseId: '0-0', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now - 1000, lastAttemptAt: 0 },
        { exerciseId: '0-1', interval: 1, easeFactor: 2.5, repetitions: 1, nextReviewDate: now + 100000, lastAttemptAt: 0 },
      ];
      expect(countDueReviews(cards, now)).toBe(1);
    });
  });

  describe('CRUD operations', () => {
    it('saves and retrieves a review card', async () => {
      const card: ReviewCard = {
        exerciseId: '0-0',
        interval: 1,
        easeFactor: 2.5,
        repetitions: 1,
        nextReviewDate: Date.now(),
        lastAttemptAt: Date.now(),
      };
      await saveReviewCard(card);
      const loaded = await getReviewCard('0-0');
      expect(loaded).toEqual(card);
    });

    it('returns undefined for missing card', async () => {
      const loaded = await getReviewCard('nonexistent');
      expect(loaded).toBeUndefined();
    });

    it('lists all review cards', async () => {
      await saveReviewCard({
        exerciseId: '0-0', interval: 1, easeFactor: 2.5, repetitions: 1,
        nextReviewDate: 0, lastAttemptAt: 0,
      });
      await saveReviewCard({
        exerciseId: '1-0', interval: 3, easeFactor: 2.6, repetitions: 2,
        nextReviewDate: 0, lastAttemptAt: 0,
      });
      const cards = await listReviewCards();
      expect(cards).toHaveLength(2);
    });
  });
});
