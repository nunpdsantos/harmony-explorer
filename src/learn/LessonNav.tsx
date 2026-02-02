import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { LESSONS } from './lessonData';

export const LessonNav: React.FC = () => {
  const {
    currentLessonIndex,
    setCurrentLessonIndex,
    lessonProgress,
    dueReviewCount,
    loadDueReviewCount,
  } = useStore();

  useEffect(() => {
    loadDueReviewCount();
  }, [loadDueReviewCount]);

  return (
    <nav role="navigation" aria-label="Lesson navigation" className="flex flex-col gap-0.5">
      <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Lessons</div>
      {LESSONS.map((lesson, i) => {
        const isActive = currentLessonIndex === i;
        const isComplete = lessonProgress[i];

        return (
          <button
            key={i}
            onClick={() => setCurrentLessonIndex(i)}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Lesson ${i + 1}: ${lesson.title}${isComplete ? ' (completed)' : ''}`}
            className={`text-left px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-white/10 border border-white/15'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isComplete
                  ? 'bg-green-500/30 text-green-400'
                  : isActive
                  ? 'bg-blue-500/30 text-blue-400'
                  : 'bg-white/5 text-white/50'
              }`}>
                {isComplete ? '\u2713' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${
                  isActive ? 'text-white' : 'text-white/60'
                }`}>
                  {lesson.title}
                </div>
                <div className="text-[10px] text-white/50 truncate">{lesson.subtitle}</div>
              </div>
            </div>
          </button>
        );
      })}

      {/* Progress summary */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-[10px] text-white/50">
          {lessonProgress.filter(Boolean).length} of {LESSONS.length} complete
        </div>
        <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500/60 rounded-full transition-all"
            style={{ width: `${(lessonProgress.filter(Boolean).length / LESSONS.length) * 100}%` }}
          />
        </div>

        {dueReviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 flex items-center justify-center text-[10px] font-bold">
              {dueReviewCount}
            </span>
            <span className="text-[10px] text-amber-300">
              {dueReviewCount === 1 ? 'exercise' : 'exercises'} due for review
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};
