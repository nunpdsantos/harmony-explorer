import React from 'react';
import { useStore } from '../state/store';
import { useChordInteraction } from '../hooks/useChordInteraction';
import { LESSONS } from './lessonData';
import { ExercisePanel } from './ExercisePanel';
import { CircleOfFifths } from '../visualizations/CircleOfFifths/CircleOfFifths';
import { TonalFunctionChart } from '../visualizations/TonalFunctionChart/TonalFunctionChart';
import { DiminishedSymmetry } from '../visualizations/DiminishedSymmetry/DiminishedSymmetry';
import { TritoneSubDiagram } from '../visualizations/TritoneSubDiagram/TritoneSubDiagram';
import { AlternationCircle } from '../visualizations/AlternationCircle/AlternationCircle';
import { ModulationMap } from '../visualizations/ModulationMap/ModulationMap';
import { ChordScaleMap } from '../visualizations/ChordScaleMap/ChordScaleMap';
import { NegativeHarmonyMirror } from '../visualizations/NegativeHarmonyMirror/NegativeHarmonyMirror';

interface LessonViewProps {
  width: number;
  height: number;
}

export const LessonView: React.FC<LessonViewProps> = ({ width, height }) => {
  const {
    currentLessonIndex,
    completeLessonAt,
    referenceRoot,
    selectedChord,
    hoveredChord,
  } = useStore();
  const { handleChordClick, handleChordHover } = useChordInteraction();

  const lesson = LESSONS[currentLessonIndex];
  if (!lesson) return null;

  // On narrow containers, stack vertically; on wide, use side-by-side
  const isNarrow = width < 640;
  const panelWidth = isNarrow ? 0 : 320;

  const vizProps = {
    referenceRoot,
    selectedChord,
    hoveredChord,
    onChordClick: handleChordClick,
    onChordHover: handleChordHover,
    width: Math.max(200, isNarrow ? width : width - panelWidth),
    height: isNarrow ? Math.floor(height * 0.55) : height,
  };

  const renderViz = () => {
    switch (lesson.visualization) {
      case 'circleOfFifths': return <CircleOfFifths {...vizProps} />;
      case 'tonalFunctionChart': return <TonalFunctionChart {...vizProps} />;
      case 'diminishedSymmetry': return <DiminishedSymmetry {...vizProps} />;
      case 'tritoneSubDiagram': return <TritoneSubDiagram {...vizProps} />;
      case 'alternationCircle': return <AlternationCircle {...vizProps} />;
      case 'modulationMap': return <ModulationMap {...vizProps} />;
      case 'chordScaleMap': return <ChordScaleMap {...vizProps} />;
      case 'negativeHarmonyMirror': return <NegativeHarmonyMirror {...vizProps} />;
      default: return <CircleOfFifths {...vizProps} />;
    }
  };

  return (
    <div className={`h-full ${isNarrow ? 'flex flex-col' : 'flex'}`}>
      {/* Lesson text panel */}
      <div className={`bg-gray-900/50 flex flex-col overflow-hidden ${
        isNarrow
          ? 'border-b border-white/5'
          : 'w-80 flex-shrink-0 border-r border-white/5'
      }`} style={isNarrow ? { height: `${Math.floor(height * 0.45)}px` } : undefined}>
        {/* Lesson header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
            Lesson {currentLessonIndex + 1}
          </div>
          <h2 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{lesson.title}</h2>
          <p className="text-xs text-white/50 mt-0.5">{lesson.subtitle}</p>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-xs font-semibold text-white/80 mb-1">{section.heading}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>

        {/* Exercise panel (bottom) */}
        <div className="border-t border-white/10 px-4 py-3 bg-gray-900/80">
          <div className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Practice</div>
          <ExercisePanel
            exercises={lesson.exercises}
            lessonIndex={currentLessonIndex}
            onComplete={() => completeLessonAt(currentLessonIndex)}
          />
        </div>
      </div>

      {/* Visualization */}
      <div className="flex-1 overflow-hidden">
        {renderViz()}
      </div>
    </div>
  );
};
