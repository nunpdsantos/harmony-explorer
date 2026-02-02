import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SheetMusic } from '../SheetMusic';
import { useStore } from '../../../state/store';
import type { Chord } from '../../../core/chords';

// Mock VexFlow since it requires full SVG DOM rendering that JSDOM cannot provide
vi.mock('vexflow', () => ({
  Renderer: vi.fn().mockImplementation(() => ({
    resize: vi.fn(),
    getContext: vi.fn().mockReturnValue({}),
  })),
  Stave: vi.fn().mockImplementation(() => ({
    addClef: vi.fn().mockReturnThis(),
    addKeySignature: vi.fn().mockReturnThis(),
    addTimeSignature: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn(),
  })),
  StaveNote: vi.fn().mockImplementation(() => ({
    addModifier: vi.fn().mockReturnThis(),
    setStyle: vi.fn(),
  })),
  Voice: vi.fn().mockImplementation(() => ({
    addTickables: vi.fn().mockReturnThis(),
    draw: vi.fn(),
  })),
  Formatter: vi.fn().mockImplementation(() => ({
    joinVoices: vi.fn().mockReturnThis(),
    format: vi.fn().mockReturnThis(),
  })),
  Accidental: vi.fn(),
  Annotation: vi.fn().mockImplementation(() => ({
    setFont: vi.fn(),
    setVerticalJustification: vi.fn(),
  })),
  StaveConnector: vi.fn().mockImplementation(() => ({
    setType: vi.fn().mockReturnThis(),
    setContext: vi.fn().mockReturnThis(),
    draw: vi.fn(),
  })),
}));

const cMajor: Chord = { root: 0, quality: 'major' };
const fMajor: Chord = { root: 5, quality: 'major' };
const gDom7: Chord = { root: 7, quality: 'dom7' };

const defaultProps = {
  referenceRoot: 0,
  selectedChord: null,
  hoveredChord: null,
  onChordClick: vi.fn(),
  onChordHover: vi.fn(),
  width: 800,
  height: 600,
};

describe('SheetMusic', () => {
  beforeEach(() => {
    useStore.setState({
      progression: [],
      playingIndex: -1,
    });
  });

  it('renders empty state when progression is empty', () => {
    render(<SheetMusic {...defaultProps} />);
    expect(screen.getByText(/Add chords to the progression/)).toBeInTheDocument();
  });

  it('shows instructional text in empty state', () => {
    render(<SheetMusic {...defaultProps} />);
    expect(screen.getByText(/Click chords in any visualization/)).toBeInTheDocument();
  });

  it('renders SVG element in empty state', () => {
    render(<SheetMusic {...defaultProps} />);
    const svg = screen.getByRole('img', { name: /Sheet music — empty/ });
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });

  it('renders empty state SVG at correct dimensions', () => {
    render(<SheetMusic {...defaultProps} width={600} height={400} />);
    const svg = screen.getByRole('img', { name: /empty/ });
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('renders container when progression has chords', () => {
    useStore.setState({ progression: [cMajor, fMajor] });
    render(<SheetMusic {...defaultProps} />);
    const container = screen.getByRole('img', { name: /Sheet music showing 2 chord/ });
    expect(container).toBeInTheDocument();
  });

  it('uses correct aria-label with chord count', () => {
    useStore.setState({ progression: [cMajor, fMajor, gDom7] });
    render(<SheetMusic {...defaultProps} />);
    expect(screen.getByRole('img', { name: /3 chord/ })).toBeInTheDocument();
  });

  it('applies white background card for notation', () => {
    useStore.setState({ progression: [cMajor] });
    const { container } = render(<SheetMusic {...defaultProps} />);
    const card = container.querySelector('.bg-white\\/95');
    expect(card).toBeInTheDocument();
  });

  it('handles single chord progression', () => {
    useStore.setState({ progression: [cMajor] });
    expect(() => {
      render(<SheetMusic {...defaultProps} />);
    }).not.toThrow();
  });

  it('handles different referenceRoot values', () => {
    useStore.setState({ progression: [cMajor] });
    for (const root of [0, 3, 6, 7, 11]) {
      expect(() => {
        render(<SheetMusic {...defaultProps} referenceRoot={root} />);
      }).not.toThrow();
    }
  });

  it('handles large progressions', () => {
    const prog = Array.from({ length: 16 }, (_, i) => ({
      root: i % 12,
      quality: 'major' as const,
    }));
    useStore.setState({ progression: prog });
    render(<SheetMusic {...defaultProps} />);
    expect(screen.getByRole('img', { name: /16 chord/ })).toBeInTheDocument();
  });

  it('handles small dimensions gracefully', () => {
    useStore.setState({ progression: [cMajor] });
    expect(() => {
      render(<SheetMusic {...defaultProps} width={200} height={100} />);
    }).not.toThrow();
  });

  it('re-renders when playingIndex changes', () => {
    useStore.setState({ progression: [cMajor, fMajor] });
    const { rerender } = render(<SheetMusic {...defaultProps} />);
    useStore.setState({ playingIndex: 1 });
    expect(() => {
      rerender(<SheetMusic {...defaultProps} />);
    }).not.toThrow();
  });
});
