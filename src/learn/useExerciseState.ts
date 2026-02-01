import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../state/store';
import { chordKey } from '../core/chords';

interface UseExerciseStateOptions {
  expectedProgression: string[];
  onComplete: () => void;
}

interface UseExerciseStateResult {
  currentProgress: string[];
  expectedLength: number;
  isCorrectSoFar: boolean;
  isComplete: boolean;
  lastChordWrong: boolean;
  reset: () => void;
}

export function useExerciseState({ expectedProgression, onComplete }: UseExerciseStateOptions): UseExerciseStateResult {
  const exerciseBuildProgression = useStore(s => s.exerciseBuildProgression);
  const resetExerciseProgression = useStore(s => s.resetExerciseProgression);

  const currentProgress = exerciseBuildProgression;
  const expectedLength = expectedProgression.length;

  // Check if the current progress matches the expected progression so far
  const isCorrectSoFar = currentProgress.every(
    (key, i) => i < expectedProgression.length && key === expectedProgression[i]
  );

  // Check if the last chord added was wrong
  const lastChordWrong = currentProgress.length > 0 && !isCorrectSoFar;

  // Check if the full progression has been correctly built
  const isComplete = isCorrectSoFar && currentProgress.length === expectedLength;

  // Fire onComplete when the progression is fully built
  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const reset = useCallback(() => {
    resetExerciseProgression();
  }, [resetExerciseProgression]);

  return {
    currentProgress,
    expectedLength,
    isCorrectSoFar,
    isComplete,
    lastChordWrong,
    reset,
  };
}

/**
 * Subscribe to chord additions from the main progression
 * and mirror them into the exercise build-progression.
 * Call this hook in the ExercisePanel when a build-progression exercise is active.
 */
export function useBuildProgressionSync(active: boolean) {
  const progression = useStore(s => s.progression);
  const addToExerciseProgression = useStore(s => s.addToExerciseProgression);
  const prevLengthRef = useRef(progression.length);

  useEffect(() => {
    if (!active) {
      prevLengthRef.current = progression.length;
      return;
    }

    // Detect when a new chord is added to the main progression
    if (progression.length > prevLengthRef.current) {
      const newChord = progression[progression.length - 1];
      addToExerciseProgression(chordKey(newChord));
    }
    prevLengthRef.current = progression.length;
  }, [progression, active, addToExerciseProgression]);
}
