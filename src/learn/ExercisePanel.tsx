import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { LessonExercise } from './lessonData';
import { FeedbackExplanation } from './FeedbackExplanation';
import { useExerciseState, useBuildProgressionSync } from './useExerciseState';
import { useStore } from '../state/store';
import { chordName, chord } from '../core/chords';

interface ExercisePanelProps {
  exercises: LessonExercise[];
  onComplete: () => void;
}

/** Sub-component for build-progression exercises */
const BuildProgressionExercise: React.FC<{
  exercise: LessonExercise;
  onExerciseComplete: () => void;
}> = ({ exercise, onExerciseComplete }) => {
  const expected = exercise.expectedProgression ?? [];
  const [showExplanation, setShowExplanation] = useState(false);
  const completedRef = useRef(false);

  const { currentProgress, expectedLength, isComplete, lastChordWrong, reset } =
    useExerciseState({
      expectedProgression: expected,
      onComplete: useCallback(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          setShowExplanation(true);
          setTimeout(() => {
            onExerciseComplete();
          }, 2000);
        }
      }, [onExerciseComplete]),
    });

  useBuildProgressionSync(true);

  // Reset completed ref when exercise changes
  useEffect(() => {
    completedRef.current = false;
    setShowExplanation(false);
  }, [exercise.question]);

  const handleReset = () => {
    completedRef.current = false;
    setShowExplanation(false);
    reset();
  };

  // Parse "root-quality" keys into display names
  const expectedNames = expected.map(key => {
    const [rootStr, quality] = key.split('-');
    return chordName(chord(Number(rootStr), quality as Parameters<typeof chord>[1]));
  });

  return (
    <div className="space-y-2">
      <div className="text-[10px] text-white/50">Click chords in the sidebar or visualization to build the progression</div>

      {/* Progress indicator */}
      <div className="flex items-center gap-1.5">
        {expected.map((key, i) => {
          const filled = i < currentProgress.length;
          const correct = filled && currentProgress[i] === key;
          const wrong = filled && currentProgress[i] !== key;

          return (
            <div
              key={i}
              className={`flex-1 h-8 rounded flex items-center justify-center text-[10px] font-medium border transition-all ${
                correct
                  ? 'border-green-500/50 bg-green-500/20 text-green-300'
                  : wrong
                  ? 'border-red-500/50 bg-red-500/20 text-red-300'
                  : 'border-white/10 bg-white/5 text-white/50'
              }`}
            >
              {filled ? (
                correct ? expectedNames[i] : '\u2717'
              ) : (
                <span className="text-[10px]">{expectedNames[i]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/50">
          {currentProgress.length} / {expectedLength} chords
        </span>
        {currentProgress.length > 0 && !isComplete && (
          <button
            onClick={handleReset}
            className="text-[10px] px-2 py-0.5 bg-white/5 text-white/50 rounded hover:bg-white/10 hover:text-white/60"
          >
            Reset
          </button>
        )}
      </div>

      {lastChordWrong && (
        <div className="flex items-center gap-2" role="alert" aria-live="assertive">
          <span className="text-xs text-red-400">Wrong chord! Try again.</span>
          <button
            onClick={handleReset}
            className="text-xs px-2 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      )}

      {isComplete && (
        <div className="text-xs text-green-400 animate-success" role="status" aria-live="polite">
          Progression complete!
        </div>
      )}

      {showExplanation && exercise.explanation && (
        <FeedbackExplanation explanation={exercise.explanation} isCorrect={true} />
      )}
    </div>
  );
};

export const ExercisePanel: React.FC<ExercisePanelProps> = ({ exercises, onComplete }) => {
  const [currentEx, setCurrentEx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const resetExerciseProgression = useStore(s => s.resetExerciseProgression);

  // Reset state when exercises change (new lesson selected)
  useEffect(() => {
    setCurrentEx(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCompleted(false);
    setShowExplanation(false);
    resetExerciseProgression();
  }, [exercises, resetExerciseProgression]);

  if (exercises.length === 0) {
    return (
      <div className="text-center text-white/50 text-sm py-4">
        No exercises for this lesson.
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center py-4 animate-fade-slide-in">
        <div className="text-green-400 font-semibold text-sm">All exercises complete!</div>
        <button
          onClick={onComplete}
          className="mt-2 px-4 py-1.5 bg-green-600/30 text-green-300 text-xs rounded hover:bg-green-600/50 transition-colors"
        >
          Mark Lesson Complete
        </button>
      </div>
    );
  }

  const exercise = exercises[currentEx];

  const advanceOrComplete = () => {
    if (currentEx < exercises.length - 1) {
      setCurrentEx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
      resetExerciseProgression();
    } else {
      setCompleted(true);
    }
  };

  const handleSelect = (key: string) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(key);

    let correct = false;
    if (exercise.type === 'select-chord') {
      correct = key === exercise.correctAnswer;
    } else if (exercise.type === 'identify-function') {
      correct = key === exercise.correctFunction;
    }

    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      setTimeout(() => {
        advanceOrComplete();
      }, exercise.explanation ? 2500 : 1000);
    }
  };

  const handleRetry = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);
  };

  const handleBuildProgressionComplete = () => {
    advanceOrComplete();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">
          Exercise {currentEx + 1} of {exercises.length}
        </div>
      </div>

      <div className="text-sm text-white/80 font-medium">{exercise.question}</div>

      {/* Build-progression exercise */}
      {exercise.type === 'build-progression' && (
        <BuildProgressionExercise
          exercise={exercise}
          onExerciseComplete={handleBuildProgressionComplete}
        />
      )}

      {/* Multiple choice exercises (select-chord, identify-function) */}
      {exercise.type !== 'build-progression' && exercise.options && exercise.optionKeys && (
        <div className="flex flex-wrap gap-2">
          {exercise.options.map((opt, i) => {
            const key = exercise.optionKeys![i];
            const isSelected = selectedAnswer === key;
            const showCorrectHighlight = isCorrect !== null && (
              key === exercise.correctAnswer || key === exercise.correctFunction
            );

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={isCorrect !== null}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  showCorrectHighlight
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : isSelected && isCorrect === false
                    ? 'border-red-500 bg-red-500/20 text-red-300'
                    : isSelected
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                } ${isCorrect !== null ? 'cursor-default' : ''}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {isCorrect === false && exercise.type !== 'build-progression' && (
        <div className="flex items-center gap-2" role="alert" aria-live="assertive">
          <span className="text-xs text-red-400">Incorrect. Try again!</span>
          <button
            onClick={handleRetry}
            className="text-xs px-2 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      )}

      {isCorrect === true && exercise.type !== 'build-progression' && (
        <div className="text-xs text-green-400 animate-success" role="status" aria-live="polite">Correct!</div>
      )}

      {/* Feedback explanation */}
      {showExplanation && isCorrect !== null && exercise.explanation && exercise.type !== 'build-progression' && (
        <FeedbackExplanation explanation={exercise.explanation} isCorrect={isCorrect} />
      )}
    </div>
  );
};
