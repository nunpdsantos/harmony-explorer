import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonNav } from '../LessonNav';
import { useStore } from '../../state/store';
import { LESSONS } from '../lessonData';

// Mock idb-keyval so loadDueReviewCount doesn't hit IndexedDB
vi.mock('idb-keyval', () => ({
  get: vi.fn(() => Promise.resolve(undefined)),
  set: vi.fn(() => Promise.resolve()),
  del: vi.fn(() => Promise.resolve()),
  keys: vi.fn(() => Promise.resolve([])),
}));

describe('LessonNav', () => {
  beforeEach(() => {
    useStore.setState({
      currentLessonIndex: 0,
      lessonProgress: Array(LESSONS.length).fill(false),
    });
  });

  it('renders a nav element with correct aria-label', () => {
    render(<LessonNav />);
    expect(screen.getByRole('navigation', { name: 'Lesson navigation' })).toBeInTheDocument();
  });

  it('renders all lesson buttons', () => {
    render(<LessonNav />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(LESSONS.length);
  });

  it('shows lesson titles', () => {
    render(<LessonNav />);
    expect(screen.getByText(LESSONS[0].title)).toBeInTheDocument();
    expect(screen.getByText(LESSONS[1].title)).toBeInTheDocument();
  });

  it('marks current lesson with aria-current="step"', () => {
    useStore.setState({ currentLessonIndex: 3 });
    render(<LessonNav />);

    const activeButton = screen.getByRole('button', {
      name: new RegExp(`Lesson 4: ${LESSONS[3].title}`),
    });
    expect(activeButton).toHaveAttribute('aria-current', 'step');
  });

  it('non-active lessons do not have aria-current', () => {
    useStore.setState({ currentLessonIndex: 0 });
    render(<LessonNav />);

    const secondLesson = screen.getByRole('button', {
      name: new RegExp(`Lesson 2: ${LESSONS[1].title}`),
    });
    expect(secondLesson).not.toHaveAttribute('aria-current');
  });

  it('clicking a lesson updates current lesson in store', async () => {
    const user = userEvent.setup();
    render(<LessonNav />);

    const thirdLesson = screen.getByRole('button', {
      name: new RegExp(`Lesson 3`),
    });
    await user.click(thirdLesson);
    expect(useStore.getState().currentLessonIndex).toBe(2);
  });

  it('shows completed lessons with (completed) in aria-label', () => {
    const progress = Array(LESSONS.length).fill(false);
    progress[0] = true;
    progress[2] = true;
    useStore.setState({ lessonProgress: progress });
    render(<LessonNav />);

    const completedLesson = screen.getByRole('button', {
      name: new RegExp(`Lesson 1:.*\\(completed\\)`),
    });
    expect(completedLesson).toBeInTheDocument();
  });

  it('shows progress summary with correct count', () => {
    const progress = Array(LESSONS.length).fill(false);
    progress[0] = true;
    progress[1] = true;
    progress[4] = true;
    useStore.setState({ lessonProgress: progress });
    render(<LessonNav />);

    expect(screen.getByText(`3 of ${LESSONS.length} complete`)).toBeInTheDocument();
  });

  it('shows 0 of N complete when no lessons are done', () => {
    render(<LessonNav />);
    expect(screen.getByText(`0 of ${LESSONS.length} complete`)).toBeInTheDocument();
  });
});
