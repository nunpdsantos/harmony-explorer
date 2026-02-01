import React from 'react';
import { analyzeVoiceLeading, smoothnessRating } from '../core/progressionTemplates';
import type { VoicedChord } from '../core/voiceLeading';
import { COLOR_FN_TONIC, COLOR_ACCENT, COLOR_FN_DOMINANT } from '../styles/theme';

interface VoiceLeadingQualityProps {
  voicings: VoicedChord[];
}

const RATING_COLORS = {
  smooth: 'text-green-400',
  moderate: 'text-amber-400',
  angular: 'text-red-400',
};

const RATING_BG = {
  smooth: 'bg-green-400/20',
  moderate: 'bg-amber-400/20',
  angular: 'bg-red-400/20',
};

export const VoiceLeadingQualityDisplay: React.FC<VoiceLeadingQualityProps> = ({ voicings }) => {
  if (voicings.length < 2) return null;

  const analysis = analyzeVoiceLeading(voicings);
  const rating = smoothnessRating(analysis.averageMovement);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Voice Leading</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${RATING_BG[rating]} ${RATING_COLORS[rating]}`}>
          {rating}
        </span>
      </div>

      {/* Per-transition bars */}
      <div className="flex items-end gap-0.5 h-6">
        {analysis.transitions.map((t, i) => {
          const maxMovement = 24; // reasonable max for normalization
          const height = Math.min(100, (t.movement / maxMovement) * 100);
          const tRating = smoothnessRating(t.movement);
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${Math.max(8, height)}%`,
                backgroundColor: tRating === 'smooth'
                  ? `${COLOR_FN_TONIC}80`
                  : tRating === 'moderate'
                  ? `${COLOR_ACCENT}80`
                  : `${COLOR_FN_DOMINANT}80`,
              }}
              title={`${i + 1}→${i + 2}: ${t.movement} semitones`}
            />
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="flex justify-between text-[10px] text-white/40">
        <span>Total: {analysis.totalMovement} st</span>
        <span>Avg: {analysis.averageMovement.toFixed(1)} st/chord</span>
      </div>
    </div>
  );
};
