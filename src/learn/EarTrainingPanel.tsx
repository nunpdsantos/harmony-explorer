import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useStore } from '../state/store';
import {
  generateIntervalQuestion,
  generateChordQualityQuestion,
  updateScore,
  initialScore,
  INTERVAL_NAMES,
  type IntervalQuestion,
  type ChordQualityQuestion,
  type IntervalDifficulty,
  type QualityDifficulty,
  type EarTrainingScore,
} from './earTraining';
import { noteName } from '../core/constants';

type TrainingMode = 'interval' | 'chord-quality';

export const EarTrainingPanel: React.FC = () => {
  const audioReady = useStore(s => s.audioReady);
  const setAudioReady = useStore(s => s.setAudioReady);

  const [mode, setMode] = useState<TrainingMode>('interval');
  const [difficulty, setDifficulty] = useState<IntervalDifficulty | QualityDifficulty>('easy');
  const [question, setQuestion] = useState<IntervalQuestion | ChordQualityQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<EarTrainingScore>(initialScore());
  const [started, setStarted] = useState(false);
  const questionRef = useRef(question);
  questionRef.current = question;

  // Generate new question
  const newQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (mode === 'interval') {
      setQuestion(generateIntervalQuestion(difficulty as IntervalDifficulty));
    } else {
      setQuestion(generateChordQualityQuestion(difficulty as QualityDifficulty));
    }
  }, [mode, difficulty]);

  // Play the question audio
  const playQuestion = useCallback(async () => {
    const q = questionRef.current;
    if (!q) return;

    const ae = await import('../audio/audioEngine');
    if (!audioReady) {
      await ae.initAudio();
      setAudioReady(true);
    }

    if (q.type === 'interval') {
      // Play two notes sequentially
      ae.playChord([q.playNotes[0]], '4n');
      setTimeout(() => {
        ae.playChord([q.playNotes[1]], '4n');
      }, 600);
    } else {
      // Play chord simultaneously
      ae.playChord(q.playNotes, '2n');
    }
  }, [audioReady, setAudioReady]);

  // Start training
  const start = useCallback(() => {
    setStarted(true);
    setScore(initialScore());
    newQuestion();
  }, [newQuestion]);

  // Auto-play when question changes
  useEffect(() => {
    if (question && started) {
      // Small delay to let state settle
      const id = setTimeout(() => playQuestion(), 200);
      return () => clearTimeout(id);
    }
  }, [question, started, playQuestion]);

  // Handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (isCorrect !== null || !question) return;
    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setScore(prev => updateScore(prev, correct));

    // Auto-advance after delay
    setTimeout(() => {
      newQuestion();
    }, correct ? 1200 : 2000);
  }, [isCorrect, question, newQuestion]);

  if (!started) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-white/80 font-medium">Ear Training</div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('interval')}
            className={`text-[10px] px-2 py-1 rounded transition-colors ${
              mode === 'interval'
                ? 'bg-blue-600/30 text-blue-300'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            Intervals
          </button>
          <button
            onClick={() => setMode('chord-quality')}
            className={`text-[10px] px-2 py-1 rounded transition-colors ${
              mode === 'chord-quality'
                ? 'bg-blue-600/30 text-blue-300'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            Chord Quality
          </button>
        </div>

        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`text-[10px] px-2 py-1 rounded transition-colors ${
                difficulty === d
                  ? 'bg-amber-600/30 text-amber-300'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          className="w-full text-xs px-3 py-2 bg-green-600/30 text-green-300 rounded hover:bg-green-600/50 transition-colors"
        >
          Start Training
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">
          {mode === 'interval' ? 'Interval' : 'Chord Quality'} Training
        </div>
        <div className="text-[10px] text-white/50">
          {score.correct}/{score.total}
          {score.streak > 2 && (
            <span className="ml-1 text-amber-300">{score.streak} streak</span>
          )}
        </div>
      </div>

      {/* Question */}
      {question && (
        <>
          <div className="text-sm text-white/80 font-medium">
            {question.type === 'interval'
              ? 'What interval is this?'
              : 'What chord quality is this?'}
          </div>

          {/* Replay button */}
          <button
            onClick={playQuestion}
            className="text-[10px] px-2 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10 transition-colors"
            aria-label="Replay audio"
          >
            Replay
          </button>

          {/* Answer options */}
          <div className="flex flex-wrap gap-2">
            {question.options.map(opt => {
              const isSelected = selectedAnswer === opt;
              const showCorrectHighlight = isCorrect !== null && opt === question.correctAnswer;

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
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
                  {question.type === 'interval' && isCorrect !== null && opt === question.correctAnswer && (
                    <span className="ml-1 text-[10px] text-white/40">
                      ({INTERVAL_NAMES[(question as IntervalQuestion).interval]})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isCorrect === true && (
            <div className="text-xs text-green-400 animate-success" role="status" aria-live="polite">
              Correct!
            </div>
          )}
          {isCorrect === false && (
            <div className="text-xs text-red-400" role="alert" aria-live="assertive">
              Incorrect — the answer was {question.correctAnswer}
              {question.type === 'chord-quality' && (
                <span> ({noteName((question as ChordQualityQuestion).root)})</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Stop button */}
      <button
        onClick={() => { setStarted(false); setQuestion(null); }}
        className="text-[10px] px-2 py-1 bg-white/5 text-white/50 rounded hover:bg-white/10 transition-colors"
      >
        Stop
      </button>
    </div>
  );
};
