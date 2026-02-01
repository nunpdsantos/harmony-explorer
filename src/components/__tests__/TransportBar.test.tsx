import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransportBar } from '../TransportBar';
import { useStore } from '../../state/store';

// Polyfill ResizeObserver for jsdom
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Mock audio modules
vi.mock('../../audio/audioEngine', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playProgression: vi.fn().mockReturnValue(() => {}),
  stopAll: vi.fn(),
  setPreset: vi.fn(),
  setVolume: vi.fn(),
}));

vi.mock('../../audio/voicingEngine', () => ({
  voiceProgression: vi.fn((chords) => chords.map(() => [60, 64, 67])),
}));

vi.mock('../../utils/midiExport', () => ({
  exportProgressionAsMidi: vi.fn().mockReturnValue(new Uint8Array()),
  downloadMidi: vi.fn(),
}));

describe('TransportBar', () => {
  beforeEach(() => {
    useStore.setState({
      progression: [],
      isPlaying: false,
      playingIndex: -1,
      bpm: 80,
      isLooping: false,
      audioReady: false,
      activePreset: 'piano',
      humanize: 0,
      volume: -8,
    });
  });

  it('renders play button', () => {
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Play progression' })).toBeInTheDocument();
  });

  it('play button is disabled when progression is empty', () => {
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Play progression' })).toBeDisabled();
  });

  it('play button is enabled when progression has chords', () => {
    useStore.setState({
      progression: [{ root: 0, quality: 'major' }],
    });
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Play progression' })).not.toBeDisabled();
  });

  it('renders loop toggle', () => {
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Toggle loop playback' })).toBeInTheDocument();
  });

  it('loop toggle reflects state', () => {
    useStore.setState({ isLooping: true });
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Toggle loop playback' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking loop toggle updates store', async () => {
    const user = userEvent.setup();
    render(<TransportBar />);

    await user.click(screen.getByRole('button', { name: 'Toggle loop playback' }));
    expect(useStore.getState().isLooping).toBe(true);
  });

  it('renders BPM slider with current value', () => {
    render(<TransportBar />);
    const slider = screen.getByRole('slider', { name: /Tempo: 80/ });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('80');
  });

  it('renders preset selector with Piano selected', () => {
    render(<TransportBar />);
    const select = screen.getByLabelText('Sound');
    expect(select).toHaveValue('piano');
  });

  it('renders humanize toggle', () => {
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Toggle humanized playback' })).toBeInTheDocument();
  });

  it('humanize toggle reflects state', () => {
    useStore.setState({ humanize: 0.5 });
    render(<TransportBar />);
    expect(screen.getByRole('button', { name: 'Toggle humanized playback' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders MIDI export button (disabled when empty)', () => {
    render(<TransportBar />);
    const exportBtn = screen.getByText('MIDI');
    expect(exportBtn).toBeDisabled();
  });

  it('MIDI export enabled with progression', () => {
    useStore.setState({
      progression: [{ root: 0, quality: 'major' }],
    });
    render(<TransportBar />);
    expect(screen.getByText('MIDI')).not.toBeDisabled();
  });

  it('renders clear button (disabled when empty)', () => {
    render(<TransportBar />);
    expect(screen.getByText('Clear')).toBeDisabled();
  });

  it('shows chord count', () => {
    useStore.setState({
      progression: [
        { root: 0, quality: 'major' },
        { root: 5, quality: 'major' },
      ],
    });
    render(<TransportBar />);
    expect(screen.getByText('2 chords')).toBeInTheDocument();
  });

  it('shows singular "chord" for 1 chord', () => {
    useStore.setState({
      progression: [{ root: 0, quality: 'major' }],
    });
    render(<TransportBar />);
    expect(screen.getByText('1 chord')).toBeInTheDocument();
  });

  it('renders volume slider', () => {
    render(<TransportBar />);
    const volSlider = screen.getByRole('slider', { name: /Volume/ });
    expect(volSlider).toBeInTheDocument();
    expect(volSlider).toHaveValue('-8');
  });
});
