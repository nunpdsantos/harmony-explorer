import React, { useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { initAudio, playProgression, stopAll } from '../audio/audioEngine';
import { voiceProgression } from '../audio/voicingEngine';
import { Timeline } from '../visualizations/Timeline/Timeline';

export const TransportBar: React.FC = () => {
  const {
    progression, removeFromProgression, clearProgression,
    isPlaying, setIsPlaying,
    playingIndex, setPlayingIndex,
    bpm, setBpm,
    isLooping, setIsLooping,
    audioReady, setAudioReady,
    setSelectedChord,
  } = useStore();

  const cancelRef = useRef<(() => void) | null>(null);

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
    );
  }, [progression, bpm, isLooping, audioReady]);

  const handleStop = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    stopAll();
    setIsPlaying(false);
    setPlayingIndex(-1);
  }, []);

  return (
    <div className="bg-gray-900/95 backdrop-blur border-t border-white/10 flex flex-col">
      {/* Timeline */}
      <div className="h-24 border-b border-white/5">
        <Timeline
          progression={progression}
          playingIndex={playingIndex}
          selectedChord={null}
          onChordClick={(c) => setSelectedChord(c)}
          onRemove={removeFromProgression}
          width={800}
          height={96}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Play/Stop */}
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={progression.length === 0}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
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
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isLooping
              ? 'bg-blue-600/30 text-blue-300'
              : 'text-white/40 hover:text-white/60 bg-white/5'
          }`}
        >
          Loop
        </button>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">BPM</label>
          <input
            type="range"
            min={40}
            max={200}
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs text-white/60 w-8 text-right">{bpm}</span>
        </div>

        {/* Clear */}
        <button
          onClick={clearProgression}
          disabled={progression.length === 0}
          className="ml-auto text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
        >
          Clear All
        </button>

        {/* Count */}
        <span className="text-xs text-white/30">
          {progression.length} chord{progression.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
