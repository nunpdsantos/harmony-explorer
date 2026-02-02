import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GuitarFretboard } from '../GuitarFretboard';
import { useStore } from '../../../state/store';

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(() => Promise.resolve(undefined)),
  set: vi.fn(() => Promise.resolve()),
  del: vi.fn(() => Promise.resolve()),
  keys: vi.fn(() => Promise.resolve([])),
}));

// Mock audio
vi.mock('../../../audio/audioEngine', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn(),
}));

const defaultProps = {
  referenceRoot: 0,
  selectedChord: null,
  hoveredChord: null,
  onChordClick: vi.fn(),
  onChordHover: vi.fn(),
  width: 800,
  height: 400,
};

const cMajor = { root: 0, quality: 'major' as const };
const aMinor = { root: 9, quality: 'minor' as const };
const gDom7 = { root: 7, quality: 'dom7' as const };

describe('GuitarFretboard', () => {
  beforeEach(() => {
    useStore.setState({
      audioReady: false,
    });
  });

  it('renders an SVG with guitar fretboard aria-label', () => {
    render(<GuitarFretboard {...defaultProps} />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label', 'Guitar fretboard');
  });

  it('shows "Select a chord" when no chord is selected', () => {
    render(<GuitarFretboard {...defaultProps} />);
    expect(screen.getByText('Select a chord to see shapes')).toBeInTheDocument();
  });

  it('shows chord name when chord is selected', () => {
    render(<GuitarFretboard {...defaultProps} selectedChord={cMajor} />);
    // The chord name appears in the control bar as a styled span
    const chordLabels = screen.getAllByText('C');
    expect(chordLabels.length).toBeGreaterThan(0);
    // First match is the header label
    expect(chordLabels[0].tagName).toBe('SPAN');
  });

  it('shows chord name for A minor', () => {
    render(<GuitarFretboard {...defaultProps} selectedChord={aMinor} />);
    expect(screen.getByText('Am')).toBeInTheDocument();
  });

  it('shows chord name for G7', () => {
    render(<GuitarFretboard {...defaultProps} selectedChord={gDom7} />);
    expect(screen.getByText('G7')).toBeInTheDocument();
  });

  it('renders tuning selector', () => {
    render(<GuitarFretboard {...defaultProps} />);
    expect(screen.getByRole('combobox', { name: 'Guitar tuning' })).toBeInTheDocument();
  });

  it('renders note dots when chord is selected', () => {
    render(<GuitarFretboard {...defaultProps} selectedChord={cMajor} />);
    // Should have some play buttons for fretted notes
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('hoveredChord takes precedence over selectedChord', () => {
    render(
      <GuitarFretboard
        {...defaultProps}
        selectedChord={cMajor}
        hoveredChord={aMinor}
      />,
    );
    // Should show Am, not C
    expect(screen.getByText('Am')).toBeInTheDocument();
  });

  it('renders with different dimensions', () => {
    const { container } = render(
      <GuitarFretboard {...defaultProps} width={400} height={200} selectedChord={cMajor} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '400');
  });

  it('shows shape navigation when multiple shapes exist', () => {
    render(<GuitarFretboard {...defaultProps} selectedChord={cMajor} />);
    // C major should have E form and A form
    const shapeBtn = screen.queryByText(/form/i);
    expect(shapeBtn).toBeInTheDocument();
  });
});
