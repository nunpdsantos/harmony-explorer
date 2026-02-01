import React from 'react';

interface FeedbackExplanationProps {
  explanation: string;
  isCorrect: boolean;
}

export const FeedbackExplanation: React.FC<FeedbackExplanationProps> = ({ explanation, isCorrect }) => {
  return (
    <div
      className={`mt-2 px-3 py-2 rounded-lg text-xs leading-relaxed border ${
        isCorrect
          ? 'bg-green-500/10 border-green-500/20 text-green-200/80'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-200/80'
      }`}
      role="note"
    >
      <span className="font-semibold text-white/60 uppercase text-[10px] tracking-wider block mb-1">
        {isCorrect ? 'Why this is correct' : 'Explanation'}
      </span>
      {explanation}
    </div>
  );
};
