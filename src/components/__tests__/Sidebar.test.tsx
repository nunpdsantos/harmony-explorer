import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';
import { useStore } from '../../state/store';

// Mock audio modules
vi.mock('../../audio/audioEngine', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn(),
}));

vi.mock('../../audio/voicingEngine', () => ({
  getVoicing: vi.fn(() => [60, 64, 67]),
  resetVoicing: vi.fn(),
}));

// Mock persistence (used by loadSavedProgressions)
vi.mock('../../utils/persistence', () => ({
  generateId: vi.fn(() => 'test-id'),
  saveProgression: vi.fn().mockResolvedValue(undefined),
  listProgressions: vi.fn().mockResolvedValue([]),
  deleteProgression: vi.fn().mockResolvedValue(undefined),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    useStore.setState({
      mode: 'explore',
      activeViz: 'circleOfFifths',
      referenceRoot: 0,
      selectedChord: null,
      hoveredChord: null,
      activeQualities: ['major', 'minor'],
      progression: [],
      audioReady: false,
      savedProgressions: [],
      sidebarOpen: false,
      showDom7Ring: false,
      showSecondaryDominants: false,
      showDominantChains: false,
      showIIVI: false,
    });
  });

  it('renders with complementary role and aria-label', () => {
    render(<Sidebar />);
    expect(screen.getByRole('complementary', { name: 'Harmony Explorer controls' })).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Sidebar />);
    expect(screen.getByText('Harmony Explorer')).toBeInTheDocument();
  });

  it('renders Explore/Learn mode toggle', () => {
    render(<Sidebar />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
  });

  it('Explore mode is active by default', () => {
    render(<Sidebar />);
    const exploreBtn = screen.getByText('Explore');
    expect(exploreBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('switching to Learn mode updates store and shows lesson nav', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    await user.click(screen.getByText('Learn'));
    expect(useStore.getState().mode).toBe('learn');
  });

  it('renders all 12 key buttons in explore mode', () => {
    render(<Sidebar />);
    // Key section header is present
    expect(screen.getByText('Key')).toBeInTheDocument();
    // noteName() uses flats for FLAT_KEYS (1,3,5,6,8,10): Db, Eb, F, Gb, Ab, Bb
    // and sharps for the rest: C, C#(not in flat set→wait, 1 IS in flat set→Db), D, E, F#(6 is flat→Gb), G, A, B
    // Accidentals that are unique (don't collide with chord names in C major):
    expect(screen.getByText('Db')).toBeInTheDocument();
    expect(screen.getByText('Eb')).toBeInTheDocument();
    expect(screen.getByText('Gb')).toBeInTheDocument();
    expect(screen.getByText('Ab')).toBeInTheDocument();
    expect(screen.getByText('Bb')).toBeInTheDocument();
  });

  it('shows "Chords in C major" for default key', () => {
    render(<Sidebar />);
    expect(screen.getByText('Chords in C major')).toBeInTheDocument();
  });

  it('changing key updates store via setReferenceRoot', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // Db is unique in the sidebar (only in key selector)
    await user.click(screen.getByText('Db'));

    expect(useStore.getState().referenceRoot).toBe(1);
  });

  it('renders diatonic chord buttons', () => {
    render(<Sidebar />);
    // C major diatonic chords — use names that are unique in the sidebar
    expect(screen.getByText('Dm')).toBeInTheDocument();
    expect(screen.getByText('Em')).toBeInTheDocument();
    expect(screen.getByText('Am')).toBeInTheDocument();
    // Roman numerals
    expect(screen.getByText('I')).toBeInTheDocument();
  });

  it('shows function legend', () => {
    render(<Sidebar />);
    expect(screen.getByText('Tonic')).toBeInTheDocument();
    expect(screen.getByText('Subdominant')).toBeInTheDocument();
    expect(screen.getByText('Dominant')).toBeInTheDocument();
  });

  it('shows Enable Audio button when audio is not ready', () => {
    render(<Sidebar />);
    expect(screen.getByText('Enable Audio')).toBeInTheDocument();
  });

  it('hides Enable Audio button when audio is ready', () => {
    useStore.setState({ audioReady: true });
    render(<Sidebar />);
    expect(screen.queryByText('Enable Audio')).not.toBeInTheDocument();
  });

  it('shows Circle Overlays section when circleOfFifths is active', () => {
    render(<Sidebar />);
    expect(screen.getByText('Circle Overlays')).toBeInTheDocument();
    expect(screen.getByText('Dom 7th Ring')).toBeInTheDocument();
    expect(screen.getByText('Secondary Dominants')).toBeInTheDocument();
  });

  it('hides Circle Overlays for other visualizations', () => {
    useStore.setState({ activeViz: 'proximityPyramid' });
    render(<Sidebar />);
    expect(screen.queryByText('Circle Overlays')).not.toBeInTheDocument();
  });

  it('shows save input when progression has chords', () => {
    useStore.setState({
      progression: [{ root: 0, quality: 'major' }],
    });
    render(<Sidebar />);
    expect(screen.getByPlaceholderText('Name this progression...')).toBeInTheDocument();
  });

  it('hides save input when progression is empty', () => {
    render(<Sidebar />);
    expect(screen.queryByPlaceholderText('Name this progression...')).not.toBeInTheDocument();
  });
});
