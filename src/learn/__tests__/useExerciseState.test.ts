import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../state/store';

// Test the exercise build-progression store state directly
// (The hook itself is a thin wrapper around the store + useEffect)
describe('Exercise Build-Progression Store State', () => {
  beforeEach(() => {
    // Reset exercise state before each test
    useStore.setState({ exerciseBuildProgression: [] });
  });

  it('starts with empty progression', () => {
    const state = useStore.getState();
    expect(state.exerciseBuildProgression).toEqual([]);
  });

  it('addToExerciseProgression appends chord keys', () => {
    const { addToExerciseProgression } = useStore.getState();
    addToExerciseProgression('0-major');
    addToExerciseProgression('5-major');
    addToExerciseProgression('7-major');

    const state = useStore.getState();
    expect(state.exerciseBuildProgression).toEqual(['0-major', '5-major', '7-major']);
  });

  it('resetExerciseProgression clears the progression', () => {
    const { addToExerciseProgression, resetExerciseProgression } = useStore.getState();
    addToExerciseProgression('0-major');
    addToExerciseProgression('5-major');
    resetExerciseProgression();

    const state = useStore.getState();
    expect(state.exerciseBuildProgression).toEqual([]);
  });

  it('correct sequence matches expected progression', () => {
    const expected = ['0-major', '5-major', '7-major', '0-major'];
    const { addToExerciseProgression } = useStore.getState();

    addToExerciseProgression('0-major');
    addToExerciseProgression('5-major');
    addToExerciseProgression('7-major');
    addToExerciseProgression('0-major');

    const { exerciseBuildProgression } = useStore.getState();
    const isCorrect = exerciseBuildProgression.every(
      (key, i) => i < expected.length && key === expected[i]
    );
    const isComplete = isCorrect && exerciseBuildProgression.length === expected.length;

    expect(isCorrect).toBe(true);
    expect(isComplete).toBe(true);
  });

  it('wrong chord is detected', () => {
    const expected = ['0-major', '5-major', '7-major', '0-major'];
    const { addToExerciseProgression } = useStore.getState();

    addToExerciseProgression('0-major');
    addToExerciseProgression('2-minor'); // wrong

    const { exerciseBuildProgression } = useStore.getState();
    const isCorrectSoFar = exerciseBuildProgression.every(
      (key, i) => i < expected.length && key === expected[i]
    );

    expect(isCorrectSoFar).toBe(false);
  });

  it('partial correct sequence is flagged as correct so far', () => {
    const expected = ['2-minor', '7-major', '0-major'];
    const { addToExerciseProgression } = useStore.getState();

    addToExerciseProgression('2-minor');
    addToExerciseProgression('7-major');

    const { exerciseBuildProgression } = useStore.getState();
    const isCorrectSoFar = exerciseBuildProgression.every(
      (key, i) => i < expected.length && key === expected[i]
    );
    const isComplete = isCorrectSoFar && exerciseBuildProgression.length === expected.length;

    expect(isCorrectSoFar).toBe(true);
    expect(isComplete).toBe(false);
  });

  it('reset after wrong chord allows retry', () => {
    const { addToExerciseProgression, resetExerciseProgression } = useStore.getState();

    addToExerciseProgression('0-major');
    addToExerciseProgression('9-minor'); // wrong
    resetExerciseProgression();

    const { exerciseBuildProgression } = useStore.getState();
    expect(exerciseBuildProgression).toEqual([]);

    // Try again correctly
    useStore.getState().addToExerciseProgression('0-major');
    useStore.getState().addToExerciseProgression('5-major');

    const state = useStore.getState();
    expect(state.exerciseBuildProgression).toEqual(['0-major', '5-major']);
  });
});
