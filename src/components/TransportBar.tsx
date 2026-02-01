import React, { useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { useContainerSize } from '../hooks/useContainerSize';
import { initAudio, playProgression, stopAll, setPreset, setVolume as setEngineVolume } from '../audio/audioEngine';
import { voiceProgression } from '../audio/voicingEngine';
import { Timeline } from '../visualizations/Timeline/Timeline';
import { exportProgressionAsMidi, downloadMidi } from '../utils/midiExport';
import { PRESET_NAMES, PRESETS } from '../audio/presets';
import type { PresetName } from '../audio/presets';

export const TransportBar: React.FC = () => {
  const {
    progression, removeFromProgression, clearProgression,
    isPlaying, setIsPlaying,
    playingIndex, setPlayingIndex,
    bpm, setBpm,
    isLooping, setIsLooping,
    audioReady, setAudioReady,
    setSelectedChord,
    activePreset, setActivePreset,
    humanize, setHumanize,
    volume, setVolume,
  } = useStore();

  const cancelRef = useRef<(() => void) | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { width: timelineWidth } = useContainerSize(timelineRef);

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

    const voicedChords = voiceProgression(progression);

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
    );
  }, [progression, bpm, isLooping, audioReady, humanize, setAudioReady, setIsPlaying, setPlayingIndex]);

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

  return (
    <div className="bg-gray-900/95 backdrop-blur border-t border-white/10 flex flex-col">
      {/* Timeline */}
      <div ref={timelineRef} className="h-24 border-b border-white/5">
        <Timeline
          progression={progression}
          playingIndex={playingIndex}
          selectedChord={null}
          onChordClick={(c) => setSelectedChord(c)}
          onRemove={removeFromProgression}
          width={timelineWidth}
          height={96}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 flex-wrap">
        {/* Play/Stop */}
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

        {/* Loop toggle */}
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

        {/* BPM */}
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

        {/* Separator — hidden on small screens */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Preset selector */}
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

        {/* Volume */}
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

        {/* Humanize toggle */}
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

        {/* Separator — hidden on small screens */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* MIDI Export */}
        <button
          onClick={() => {
            const midiData = exportProgressionAsMidi(progression, bpm);
            downloadMidi(midiData);
          }}
          disabled={progression.length === 0}
          className="text-xs px-2 py-1.5 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          MIDI
        </button>

        {/* Clear */}
        <button
          onClick={clearProgression}
          disabled={progression.length === 0}
          className="ml-auto text-xs text-white/50 hover:text-white/60 transition-colors disabled:opacity-30 flex-shrink-0"
        >
          Clear
        </button>

        {/* Count */}
        <span className="text-xs text-white/50 flex-shrink-0">
          {progression.length} chord{progression.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
