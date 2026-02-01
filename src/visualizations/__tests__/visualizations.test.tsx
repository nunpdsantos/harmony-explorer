import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CircleOfFifths } from '../CircleOfFifths/CircleOfFifths';
import { TonalFunctionChart } from '../TonalFunctionChart/TonalFunctionChart';
import { ProximityPyramid } from '../ProximityPyramid/ProximityPyramid';
import { DiminishedSymmetry } from '../DiminishedSymmetry/DiminishedSymmetry';
import { TritoneSubDiagram } from '../TritoneSubDiagram/TritoneSubDiagram';
import { AugmentedStar } from '../AugmentedStar/AugmentedStar';
import { AlternationCircle } from '../AlternationCircle/AlternationCircle';
import { ModulationMap } from '../ModulationMap/ModulationMap';
import { ChordScaleMap } from '../ChordScaleMap/ChordScaleMap';
import { NegativeHarmonyMirror } from '../NegativeHarmonyMirror/NegativeHarmonyMirror';
import type { VisualizationProps } from '../shared/types';

const baseProps: VisualizationProps = {
  referenceRoot: 0,
  selectedChord: null,
  hoveredChord: null,
  onChordClick: vi.fn(),
  onChordHover: vi.fn(),
  width: 600,
  height: 600,
};

/**
 * Smoke tests: each visualization renders without crashing
 * and produces an accessible SVG with chord buttons.
 */
describe('Visualization smoke tests', () => {
  describe('CircleOfFifths', () => {
    it('renders an SVG element', () => {
      const { container } = render(<CircleOfFifths {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders 12 chord buttons', () => {
      render(<CircleOfFifths {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(12);
    });

    it('includes C chord button', () => {
      render(<CircleOfFifths {...baseProps} />);
      expect(screen.getByRole('button', { name: /C Major/ })).toBeInTheDocument();
    });

    it('calls onChordClick when a chord is clicked', () => {
      const onClick = vi.fn();
      render(<CircleOfFifths {...baseProps} onChordClick={onClick} />);
      fireEvent.click(screen.getByRole('button', { name: /C Major/ }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TonalFunctionChart', () => {
    it('renders an SVG element', () => {
      const { container } = render(<TonalFunctionChart {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons', () => {
      render(<TonalFunctionChart {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('ProximityPyramid', () => {
    it('renders an SVG element', () => {
      const { container } = render(<ProximityPyramid {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons', () => {
      render(<ProximityPyramid {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('DiminishedSymmetry', () => {
    it('renders an SVG element', () => {
      const { container } = render(<DiminishedSymmetry {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons', () => {
      render(<DiminishedSymmetry {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('TritoneSubDiagram', () => {
    it('renders an SVG element', () => {
      const { container } = render(<TritoneSubDiagram {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons', () => {
      render(<TritoneSubDiagram {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('AugmentedStar', () => {
    it('renders an SVG element', () => {
      const { container } = render(<AugmentedStar {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons', () => {
      render(<AugmentedStar {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('AlternationCircle', () => {
    it('renders an SVG element', () => {
      const { container } = render(<AlternationCircle {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons (24 major+minor triads)', () => {
      render(<AlternationCircle {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(24);
    });
  });

  describe('ModulationMap', () => {
    it('renders an SVG element', () => {
      const { container } = render(<ModulationMap {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders chord buttons for source and target keys', () => {
      render(<ModulationMap {...baseProps} />);
      const buttons = screen.getAllByRole('button');
      // Source diatonic (7) + target diatonic (7) + some target key selectors
      expect(buttons.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('ChordScaleMap', () => {
    it('renders an SVG element', () => {
      const { container } = render(<ChordScaleMap {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders without crashing when no chord is selected', () => {
      expect(() => render(<ChordScaleMap {...baseProps} />)).not.toThrow();
    });

    it('renders with a selected chord', () => {
      const selected = { root: 0, quality: 'major' as const, notes: [0, 4, 7] };
      const { container } = render(<ChordScaleMap {...baseProps} selectedChord={selected} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders with a hovered chord', () => {
      const hovered = { root: 7, quality: 'dom7' as const, notes: [7, 11, 2, 5] };
      const { container } = render(<ChordScaleMap {...baseProps} hoveredChord={hovered} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('handles different reference roots', () => {
      for (const root of [0, 3, 7, 11]) {
        expect(() => render(<ChordScaleMap {...baseProps} referenceRoot={root} />)).not.toThrow();
      }
    });
  });

  describe('NegativeHarmonyMirror', () => {
    it('renders an SVG element', () => {
      const { container } = render(<NegativeHarmonyMirror {...baseProps} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders without crashing when no chord is selected', () => {
      expect(() => render(<NegativeHarmonyMirror {...baseProps} />)).not.toThrow();
    });

    it('renders with a selected chord', () => {
      const selected = { root: 0, quality: 'major' as const, notes: [0, 4, 7] };
      const { container } = render(<NegativeHarmonyMirror {...baseProps} selectedChord={selected} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders with a hovered chord', () => {
      const hovered = { root: 7, quality: 'dom7' as const, notes: [7, 11, 2, 5] };
      const { container } = render(<NegativeHarmonyMirror {...baseProps} hoveredChord={hovered} />);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('handles different reference roots', () => {
      for (const root of [0, 3, 7, 11]) {
        expect(() => render(<NegativeHarmonyMirror {...baseProps} referenceRoot={root} />)).not.toThrow();
      }
    });

    it('handles small dimensions', () => {
      const props = { ...baseProps, width: 200, height: 200 };
      expect(() => render(<NegativeHarmonyMirror {...props} />)).not.toThrow();
    });
  });

  describe('Cross-cutting concerns', () => {
    it('all visualizations handle selectedChord without crashing', () => {
      const selected = { root: 0, quality: 'major' as const, notes: [0, 4, 7] };
      const props = { ...baseProps, selectedChord: selected };

      expect(() => render(<CircleOfFifths {...props} />)).not.toThrow();
      expect(() => render(<TonalFunctionChart {...props} />)).not.toThrow();
      expect(() => render(<ProximityPyramid {...props} />)).not.toThrow();
    });

    it('all visualizations handle hoveredChord without crashing', () => {
      const hovered = { root: 7, quality: 'major' as const, notes: [7, 11, 2] };
      const props = { ...baseProps, hoveredChord: hovered };

      expect(() => render(<CircleOfFifths {...props} />)).not.toThrow();
      expect(() => render(<TonalFunctionChart {...props} />)).not.toThrow();
      expect(() => render(<ModulationMap {...props} />)).not.toThrow();
    });

    it('all visualizations handle different reference roots', () => {
      for (const root of [0, 3, 7, 11]) {
        const props = { ...baseProps, referenceRoot: root };
        expect(() => render(<CircleOfFifths {...props} />)).not.toThrow();
        expect(() => render(<TonalFunctionChart {...props} />)).not.toThrow();
      }
    });

    it('all visualizations handle small dimensions', () => {
      const props = { ...baseProps, width: 200, height: 200 };
      expect(() => render(<CircleOfFifths {...props} />)).not.toThrow();
      expect(() => render(<TonalFunctionChart {...props} />)).not.toThrow();
      expect(() => render(<ProximityPyramid {...props} />)).not.toThrow();
    });
  });
});
