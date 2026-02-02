import React, { Suspense, useRef } from 'react';
import { useStore } from '../state/store';
import { useContainerSize } from '../hooks/useContainerSize';
import { useChordInteraction } from '../hooks/useChordInteraction';

// Lazy-load all visualizations — only one renders at a time
const CircleOfFifths = React.lazy(() =>
  import('../visualizations/CircleOfFifths/CircleOfFifths').then(m => ({ default: m.CircleOfFifths }))
);
const ProximityPyramid = React.lazy(() =>
  import('../visualizations/ProximityPyramid/ProximityPyramid').then(m => ({ default: m.ProximityPyramid }))
);
const TonalFunctionChart = React.lazy(() =>
  import('../visualizations/TonalFunctionChart/TonalFunctionChart').then(m => ({ default: m.TonalFunctionChart }))
);
const DiminishedSymmetry = React.lazy(() =>
  import('../visualizations/DiminishedSymmetry/DiminishedSymmetry').then(m => ({ default: m.DiminishedSymmetry }))
);
const AugmentedStar = React.lazy(() =>
  import('../visualizations/AugmentedStar/AugmentedStar').then(m => ({ default: m.AugmentedStar }))
);
const TritoneSubDiagram = React.lazy(() =>
  import('../visualizations/TritoneSubDiagram/TritoneSubDiagram').then(m => ({ default: m.TritoneSubDiagram }))
);
const AlternationCircle = React.lazy(() =>
  import('../visualizations/AlternationCircle/AlternationCircle').then(m => ({ default: m.AlternationCircle }))
);
const ModulationMap = React.lazy(() =>
  import('../visualizations/ModulationMap/ModulationMap').then(m => ({ default: m.ModulationMap }))
);
const ChordScaleMap = React.lazy(() =>
  import('../visualizations/ChordScaleMap/ChordScaleMap').then(m => ({ default: m.ChordScaleMap }))
);
const NegativeHarmonyMirror = React.lazy(() =>
  import('../visualizations/NegativeHarmonyMirror/NegativeHarmonyMirror').then(m => ({ default: m.NegativeHarmonyMirror }))
);
const LessonView = React.lazy(() =>
  import('../learn/LessonView').then(m => ({ default: m.LessonView }))
);

const VizFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
    Loading…
  </div>
);

export const VisualizationArea: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const { mode, activeViz, referenceRoot, selectedChord, hoveredChord } = useStore();
  const { handleChordClick, handleChordHover } = useChordInteraction();

  const vizProps = {
    referenceRoot,
    selectedChord,
    hoveredChord,
    onChordClick: handleChordClick,
    onChordHover: handleChordHover,
    width,
    height,
  };

  return (
    <div ref={containerRef} className="flex-1 relative overflow-hidden">
      <Suspense fallback={<VizFallback />}>
        <div key={mode === 'learn' ? 'learn' : activeViz} className="animate-fade-in w-full h-full">
          {mode === 'learn' ? (
            <LessonView width={width} height={height} />
          ) : (
            <>
              {activeViz === 'circleOfFifths' && <CircleOfFifths {...vizProps} />}
              {activeViz === 'proximityPyramid' && <ProximityPyramid {...vizProps} />}
              {activeViz === 'tonalFunctionChart' && <TonalFunctionChart {...vizProps} />}
              {activeViz === 'diminishedSymmetry' && <DiminishedSymmetry {...vizProps} />}
              {activeViz === 'augmentedStar' && <AugmentedStar {...vizProps} />}
              {activeViz === 'tritoneSubDiagram' && <TritoneSubDiagram {...vizProps} />}
              {activeViz === 'alternationCircle' && <AlternationCircle {...vizProps} />}
              {activeViz === 'modulationMap' && <ModulationMap {...vizProps} />}
              {activeViz === 'chordScaleMap' && <ChordScaleMap {...vizProps} />}
              {activeViz === 'negativeHarmonyMirror' && <NegativeHarmonyMirror {...vizProps} />}
            </>
          )}
        </div>
      </Suspense>
    </div>
  );
};
