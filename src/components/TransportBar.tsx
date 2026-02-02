import React, { useRef, useCallback, useMemo } from 'react';
import { useStore } from '../state/store';
import { useContainerSize } from '../hooks/useContainerSize';
import { initAudio, playProgression, stopAll, setPreset, setVolume as setEngineVolume } from '../audio/audioEngine';
import { voiceProgression } from '../audio/voicingEngine';
import { Timeline } from '../visualizations/Timeline/Timeline';
import { exportProgressionAsMidi, exportProgressionAsMidiVoiced, downloadMidi } from '../utils/midiExport';
import { suggestBridgesForProgression, findChromaticBassLines } from '../core/bridgeChords';
import { PRESET_NAMES, PRESETS } from '../audio/presets';
import { ARP_PATTERN_NAMES, ARP_PATTERNS } from '../audio/arpeggiation';
import { RHYTHM_PATTERN_NAMES, RHYTHM_PATTERNS } from '../audio/rhythmPatterns';
import type { PresetName } from '../audio/presets';
import type { ArpPatternName } from '../audio/arpeggiation';
import type { RhythmPatternName } from '../audio/rhythmPatterns';
import type { Chord } from '../core/chords';

export const TransportBar: React.FC = () => {
  const {
    progression, removeFromProgression, clearProgression, setProgression, referenceRoot,
    isPlaying, setIsPlaying,
    playingIndex, setPlayingIndex,
    bpm, setBpm,
    isLooping, setIsLooping,
    audioReady, setAudioReady,
    setSelectedChord,
    activePreset, setActivePreset,
    humanize, setHumanize,
    volume, setVolume,
    arpPattern, setArpPattern,
    rhythmPattern, setRhythmPattern,
    showVoiceLeading, setShowVoiceLeading,
    showBridgeChords, setShowBridgeChords,
    undo, redo, canUndo, canRedo,
  } = useStore();

  const cancelRef = useRef<(() => void) | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { width: timelineWidth } = useContainerSize(timelineRef);

  // Compute voicings for both playback and voice-leading overlay
  const voicings = useMemo(
    () => progression.length >= 2 ? voiceProgression(progression) : [],
    [progression],
  );

  // Compute bridge chord suggestions and chromatic bass spans
  const bridgeSuggestions = useMemo(
    () => showBridgeChords && progression.length >= 2
      ? suggestBridgesForProgression(progression)
      : [],
    [progression, showBridgeChords],
  );

  const chromaticBassSpans = useMemo(
    () => progression.length >= 3 ? findChromaticBassLines(progression) : [],
    [progression],
  );

  const handlePlay = useCallback(async () => {
    if (progression.length === 0) return;

    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }

    // Stop any current playback
    if (cancelRef.current) {
      cancelRef.current();
    }

    // Use pre-computed voicings if available, otherwise compute fresh
    const voicedChords = voicings.length > 0 ? voicings : voiceProgression(progression);

    setIsPlaying(true);
    cancelRef.current = playProgression(
      voicedChords,
      bpm,
      (index) => setPlayingIndex(index),
      () => {
        setIsPlaying(false);
        setPlayingIndex(-1);
        cancelRef.current = null;
      },
      isLooping,
      humanize,
      arpPattern,
      rhythmPattern,
    );
  }, [progression, voicings, bpm, isLooping, audioReady, humanize, arpPattern, rhythmPattern, setAudioReady, setIsPlaying, setPlayingIndex]);

  const handleStop = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    stopAll();
    setIsPlaying(false);
    setPlayingIndex(-1);
  }, [setIsPlaying, setPlayingIndex]);

  const handlePresetChange = useCallback(async (name: PresetName) => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }
    setPreset(name);
    setActivePreset(name);
  }, [audioReady, setActivePreset, setAudioReady]);

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val);
    setEngineVolume(val);
  }, [setVolume]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const next = [...progression];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setProgression(next);
  }, [progression, setProgression]);

  const handleBridgeInsert = useCallback((chord: Chord, afterIndex: number) => {
    const next = [...progression];
    next.splice(afterIndex, 0, chord);
    setProgression(next);
  }, [progression, setProgression]);

  return (
    <div className="border-t border-white/10 flex flex-col" style={{ backgroundColor: 'var(--color-bg-surface)', backdropFilter: 'blur(12px)' }}>
      {/* Timeline */}
      <div ref={timelineRef} className="h-24 border-b border-white/5">
        <Timeline
          progression={progression}
          playingIndex={playingIndex}
          selectedChord={null}
          onChordClick={(c) => setSelectedChord(c)}
          onRemove={removeFromProgression}
          onReorder={handleReorder}
          onBridgeInsert={handleBridgeInsert}
          width={timelineWidth}
          height={96}
          voicings={voicings}
          showVoiceLeading={showVoiceLeading}
          bridgeSuggestions={bridgeSuggestions}
          chromaticBassSpans={chromaticBassSpans}
          showBridgeChords={showBridgeChords}
        />
      </div>

      {/* Controls — 3 logical groups */}
      <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 flex-wrap">
        {/* ── Group 1: Playback (Play, Loop, BPM) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={isPlaying ? handleStop : handlePlay}
            disabled={progression.length === 0}
            aria-label={isPlaying ? 'Stop playback' : 'Play progression'}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0 ${
              progression.length === 0
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : isPlaying
                ? 'bg-red-500/30 text-red-300 hover:bg-red-500/50'
                : 'bg-green-500/30 text-green-300 hover:bg-green-500/50'
            }`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            aria-pressed={isLooping}
            aria-label="Toggle loop playback"
            className={`text-xs px-2 py-1.5 rounded transition-colors flex-shrink-0 ${
              isLooping
                ? 'bg-blue-600/30 text-blue-300'
                : 'text-white/50 hover:text-white/60 bg-white/5'
            }`}
          >
            Loop
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <label htmlFor="bpm-slider" className="text-xs text-white/50">BPM</label>
            <input
              id="bpm-slider"
              type="range"
              min={40}
              max={200}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              aria-label={`Tempo: ${bpm} beats per minute`}
              className="w-16 sm:w-24 accent-blue-500"
            />
            <span className="text-xs text-white/60 w-8 text-right">{bpm}</span>
          </div>

          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo (⌘Z)"
            className="text-xs px-1.5 py-1.5 rounded text-white/50 hover:text-white/60 bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo (⌘⇧Z)"
            className="text-xs px-1.5 py-1.5 rounded text-white/50 hover:text-white/60 bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
            </svg>
          </button>
        </div>

        {/* Group separator */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* ── Group 2: Overlays (Voices, Bridges, Humanize) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowVoiceLeading(!showVoiceLeading)}
            disabled={progression.length < 2}
            aria-pressed={showVoiceLeading}
            aria-label="Toggle voice leading overlay"
            className={`text-xs px-2 py-1.5 rounded transition-colors flex-shrink-0 ${
              showVoiceLeading
                ? 'bg-violet-600/30 text-violet-300'
                : 'text-white/50 hover:text-white/60 bg-white/5'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Voices
          </button>

          <button
            onClick={() => setShowBridgeChords(!showBridgeChords)}
            disabled={progression.length < 2}
            aria-pressed={showBridgeChords}
            aria-label="Toggle bridge chord suggestions"
            className={`text-xs px-2 py-1.5 rounded transition-colors flex-shrink-0 ${
              showBridgeChords
                ? 'bg-pink-600/30 text-pink-300'
                : 'text-white/50 hover:text-white/60 bg-white/5'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Bridges
          </button>

          <button
            onClick={() => setHumanize(humanize > 0 ? 0 : 0.5)}
            aria-pressed={humanize > 0}
            aria-label="Toggle humanized playback"
            className={`text-xs px-2 py-1.5 rounded transition-colors flex-shrink-0 ${
              humanize > 0
                ? 'bg-amber-600/30 text-amber-300'
                : 'text-white/50 hover:text-white/60 bg-white/5'
            }`}
          >
            Humanize
          </button>

          <select
            value={arpPattern}
            onChange={e => setArpPattern(e.target.value as ArpPatternName)}
            aria-label="Arpeggio pattern"
            className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30"
          >
            {ARP_PATTERN_NAMES.map(name => (
              <option key={name} value={name}>{ARP_PATTERNS[name].name}</option>
            ))}
          </select>

          <select
            value={rhythmPattern}
            onChange={e => setRhythmPattern(e.target.value as RhythmPatternName)}
            aria-label="Rhythm pattern"
            className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30"
          >
            {RHYTHM_PATTERN_NAMES.map(name => (
              <option key={name} value={name}>{RHYTHM_PATTERNS[name].name}</option>
            ))}
          </select>
        </div>

        {/* Group separator */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* ── Group 3: Output (Preset, Volume, MIDI, Clear) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="preset-select" className="text-xs text-white/50 hidden sm:inline">Sound</label>
            <select
              id="preset-select"
              value={activePreset}
              onChange={e => handlePresetChange(e.target.value as PresetName)}
              className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-1.5 text-white/70 focus:outline-none focus:border-white/30"
            >
              {PRESET_NAMES.map(name => (
                <option key={name} value={name}>{PRESETS[name].name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label htmlFor="volume-slider" className="text-xs text-white/50 hidden sm:inline">Vol</label>
            <input
              id="volume-slider"
              type="range"
              min={-24}
              max={0}
              value={volume}
              onChange={e => handleVolumeChange(Number(e.target.value))}
              aria-label={`Volume: ${volume} dB`}
              className="w-12 sm:w-16 accent-blue-500"
            />
          </div>

          <button
            onClick={() => {
              const midiData = voicings.length > 0
                ? exportProgressionAsMidiVoiced(progression, voicings, bpm, referenceRoot)
                : exportProgressionAsMidi(progression, bpm);
              downloadMidi(midiData);
            }}
            disabled={progression.length === 0}
            className="text-xs px-2 py-1.5 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            MIDI
          </button>

          <button
            onClick={clearProgression}
            disabled={progression.length === 0}
            className="ml-auto text-xs text-white/50 hover:text-white/60 transition-colors disabled:opacity-30 flex-shrink-0"
          >
            Clear
          </button>

          <span className="text-xs text-white/50 flex-shrink-0">
            {progression.length} chord{progression.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
