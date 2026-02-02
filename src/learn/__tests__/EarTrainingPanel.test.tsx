import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EarTrainingPanel } from '../EarTrainingPanel';
import { useStore } from '../../state/store';

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(() => Promise.resolve(undefined)),
  set: vi.fn(() => Promise.resolve()),
  del: vi.fn(() => Promise.resolve()),
  keys: vi.fn(() => Promise.resolve([])),
}));

// Mock audio engine
vi.mock('../../audio/audioEngine', () => ({
  initAudio: vi.fn().mockResolvedValue(undefined),
  playChord: vi.fn(),
}));

describe('EarTrainingPanel', () => {
  beforeEach(() => {
    useStore.setState({ audioReady: false });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the initial setup screen', () => {
    render(<EarTrainingPanel />);
    expect(screen.getByText('Ear Training')).toBeInTheDocument();
    expect(screen.getByText('Intervals')).toBeInTheDocument();
    expect(screen.getByText('Chord Quality')).toBeInTheDocument();
  });

  it('shows difficulty options', () => {
    render(<EarTrainingPanel />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('shows start button', () => {
    render(<EarTrainingPanel />);
    expect(screen.getByText('Start Training')).toBeInTheDocument();
  });

  it('clicking start shows training UI', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Start Training'));

    expect(screen.getByText('What interval is this?')).toBeInTheDocument();
    expect(screen.getByText('Replay')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  it('shows score counter after starting', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Start Training'));

    expect(screen.getByText('0/0')).toBeInTheDocument();
  });

  it('switching to chord quality mode changes the question', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Chord Quality'));
    await user.click(screen.getByText('Start Training'));

    expect(screen.getByText('What chord quality is this?')).toBeInTheDocument();
  });

  it('stop button returns to setup screen', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Start Training'));
    await user.click(screen.getByText('Stop'));

    expect(screen.getByText('Start Training')).toBeInTheDocument();
  });

  it('displays answer options when training', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Start Training'));

    // Should have option buttons (P4, P5, P8 for easy intervals)
    const buttons = screen.getAllByRole('button');
    // At minimum: Replay, Stop, and 3 interval options
    expect(buttons.length).toBeGreaterThanOrEqual(5);
  });

  it('has a replay button with aria-label', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<EarTrainingPanel />);
    await user.click(screen.getByText('Start Training'));

    expect(screen.getByRole('button', { name: 'Replay audio' })).toBeInTheDocument();
  });
});
