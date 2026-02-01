import React, { useRef } from 'react';
import { useStore } from '../state/store';
import { useContainerSize } from '../hooks/useContainerSize';
import { useChordInteraction } from '../hooks/useChordInteraction';
import { CircleOfFifths } from '../visualizations/CircleOfFifths/CircleOfFifths';
import { ProximityPyramid } from '../visualizations/ProximityPyramid/ProximityPyramid';

export const VisualizationArea: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useContainerSize(containerRef);
  const { activeViz, referenceRoot, selectedChord, hoveredChord } = useStore();
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
      {activeViz === 'circleOfFifths' && <CircleOfFifths {...vizProps} />}
      {activeViz === 'proximityPyramid' && <ProximityPyramid {...vizProps} />}
    </div>
  );
};
