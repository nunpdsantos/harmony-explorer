import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExercisePanel } from '../ExercisePanel';
import { useStore } from '../../state/store';
import type { LessonExercise } from '../lessonData';

const selectChordExercises: LessonExercise[] = [
  {
    type: 'select-chord',
    question: 'Which chord is the dominant in C major?',
    correctAnswer: '7-major',
    options: ['C', 'F', 'G', 'Am'],
    optionKeys: ['0-major', '5-major', '7-major', '9-minor'],
    explanation: 'G major is the dominant (V) chord in C major.',
  },
  {
    type: 'select-chord',
    question: 'Which chord is the subdominant in C major?',
    correctAnswer: '5-major',
    options: ['C', 'F', 'G', 'Am'],
    optionKeys: ['0-major', '5-major', '7-major', '9-minor'],
    explanation: 'F major is the subdominant (IV) chord in C major.',
  },
];

const identifyFunctionExercise: LessonExercise[] = [
  {
    type: 'identify-function',
    question: 'What function does Am serve in C major?',
    correctFunction: 'tonic',
    options: ['Tonic', 'Subdominant', 'Dominant'],
    optionKeys: ['tonic', 'subdominant', 'dominant'],
    explanation: 'Am is the vi chord, which serves a tonic function.',
  },
];

describe('ExercisePanel', () => {
  beforeEach(() => {
    useStore.setState({
      exerciseBuildProgression: [],
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders exercise question', () => {
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);
    expect(screen.getByText('Which chord is the dominant in C major?')).toBeInTheDocument();
  });

  it('shows exercise counter', () => {
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);
    expect(screen.getByText('Exercise 1 of 2')).toBeInTheDocument();
  });

  it('renders option buttons', () => {
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('Am')).toBeInTheDocument();
  });

  it('selecting correct answer shows "Correct!"', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);

    await user.click(screen.getByText('G'));
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('selecting correct answer shows explanation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);

    await user.click(screen.getByText('G'));
    expect(screen.getByText('G major is the dominant (V) chord in C major.')).toBeInTheDocument();
  });

  it('selecting wrong answer shows "Incorrect" and retry', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);

    await user.click(screen.getByText('F'));
    expect(screen.getByText('Incorrect. Try again!')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('retry resets the exercise for another attempt', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);

    await user.click(screen.getByText('F'));
    await user.click(screen.getByText('Retry'));

    // Should be able to select again
    expect(screen.queryByText('Incorrect. Try again!')).not.toBeInTheDocument();
    expect(screen.getByText('G')).not.toBeDisabled();
  });

  it('shows "No exercises for this lesson." when empty', () => {
    render(<ExercisePanel exercises={[]} onComplete={vi.fn()} />);
    expect(screen.getByText('No exercises for this lesson.')).toBeInTheDocument();
  });

  it('correct answer advances to next exercise after delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ExercisePanel exercises={selectChordExercises} onComplete={vi.fn()} />);

    await user.click(screen.getByText('G'));

    // Advance past the auto-advance timer
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText('Exercise 2 of 2')).toBeInTheDocument();
    });
  });

  it('completing all exercises shows completion message', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onComplete = vi.fn();
    render(<ExercisePanel exercises={identifyFunctionExercise} onComplete={onComplete} />);

    await user.click(screen.getByText('Tonic'));
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText('All exercises complete!')).toBeInTheDocument();
    });
  });

  it('Mark Lesson Complete button calls onComplete', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onComplete = vi.fn();
    render(<ExercisePanel exercises={identifyFunctionExercise} onComplete={onComplete} />);

    await user.click(screen.getByText('Tonic'));
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.getByText('Mark Lesson Complete')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mark Lesson Complete'));
    expect(onComplete).toHaveBeenCalled();
  });
});
