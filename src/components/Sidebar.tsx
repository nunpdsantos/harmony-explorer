import React, { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import { noteName } from '../core/constants';
import { chord, chordName, chordPitchClasses } from '../core/chords';
import { initAudio, playChord } from '../audio/audioEngine';
import { getVoicing, resetVoicing } from '../audio/voicingEngine';
import { getDiatonicChords, getDiatonicInfo, getNextMoves, functionColor } from '../core/harmony';
import { VizSelector } from './VizSelector';
import { LessonNav } from '../learn/LessonNav';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const Sidebar: React.FC = () => {
  const {
    mode, setMode,
    activeViz,
    referenceRoot, setReferenceRoot,
    selectedChord, setSelectedChord,
    addToProgression,
    progression,
    audioReady, setAudioReady,
    savedProgressions, loadSavedProgressions,
    saveCurrentProgression, deleteSavedProgression, loadProgressionById,
    sidebarOpen, setSidebarOpen,
    setHoveredChord,
    showDom7Ring, setShowDom7Ring,
    showSecondaryDominants, setShowSecondaryDominants,
    showDominantChains, setShowDominantChains,
    showIIVI, setShowIIVI,
  } = useStore();

  const [saveName, setSaveName] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => { loadSavedProgressions(); }, [loadSavedProgressions]);

  const handleInitAudio = async () => {
    await initAudio();
    setAudioReady(true);
  };

  const handleChordPlay = async (c: ReturnType<typeof chord>) => {
    if (!audioReady) await handleInitAudio();
    const voicing = getVoicing(c);
    playChord(voicing);
    setSelectedChord(c);
  };

  const handleRootChange = (root: number) => {
    setReferenceRoot(root);
    resetVoicing();
  };

  const handleSave = async () => {
    if (progression.length === 0 || !saveName.trim()) return;
    await saveCurrentProgression(saveName.trim());
    setSaveName('');
  };

  const diatonic = getDiatonicChords(referenceRoot);
  const selectedInfo = selectedChord ? getDiatonicInfo(selectedChord, referenceRoot) : null;
  const nextMoves = selectedChord ? getNextMoves(selectedChord, referenceRoot) : [];

  return (
    <aside
      role="complementary"
      aria-label="Harmony Explorer controls"
      className={`
      fixed lg:static inset-y-0 left-0 z-40
      w-72 bg-gray-900/95 backdrop-blur border-r border-white/10
      flex flex-col overflow-y-auto scrollbar-thin
      transition-transform duration-200
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <h1 className="text-lg font-bold text-white tracking-tight">Harmony Explorer</h1>

        {/* Explore / Learn mode toggle */}
        <div className="mt-3 flex rounded-lg overflow-hidden border border-white/10">
          {([
            { value: 'explore' as const, label: 'Explore' },
            { value: 'learn' as const, label: 'Learn' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              aria-pressed={mode === opt.value}
              className={`flex-1 text-xs py-1.5 transition-colors ${
                mode === opt.value
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Visualization selector (explore mode only) */}
        {mode === 'explore' && (
          <div className="mt-3">
            <VizSelector />
          </div>
        )}
      </div>

      {/* Circle of Fifths overlay toggles */}
      {mode === 'explore' && activeViz === 'circleOfFifths' && (
        <Card title="Circle Overlays">
          <div className="flex flex-col gap-1.5">
            {([
              { label: 'Dom 7th Ring', value: showDom7Ring, set: setShowDom7Ring },
              { label: 'Secondary Dominants', value: showSecondaryDominants, set: setShowSecondaryDominants },
              { label: 'Dominant Chains', value: showDominantChains, set: setShowDominantChains },
              { label: 'ii-V-I Patterns', value: showIIVI, set: setShowIIVI },
            ]).map(toggle => (
              <label key={toggle.label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={toggle.value}
                  onChange={e => toggle.set(e.target.checked)}
                  className="w-3 h-3 rounded accent-blue-500"
                />
                <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                  {toggle.label}
                </span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Learn mode: lesson navigation */}
      {mode === 'learn' && (
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          <LessonNav />
        </div>
      )}

      {/* Explore mode content */}
      {mode === 'explore' && (
        <>
          {/* Key selector — compact piano-style */}
          <Card title="Key">
            <div className="flex gap-0.5">
              {Array.from({ length: 12 }, (_, i) => {
                const isBlack = [1, 3, 6, 8, 10].includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleRootChange(i)}
                    className={`flex-1 text-xs py-2 rounded transition-all ${
                      referenceRoot === i
                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30'
                        : isBlack
                        ? 'bg-gray-800 text-white/50 hover:bg-gray-700'
                        : 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                    }`}
                  >
                    {noteName(i)}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Diatonic chords in this key */}
          <Card title={`Chords in ${noteName(referenceRoot)} major`}>
            <div className="grid grid-cols-4 gap-1.5">
              {diatonic.map(d => {
                const isSelected = selectedChord && selectedChord.root === d.chord.root && selectedChord.quality === d.chord.quality;
                return (
                  <button
                    key={d.key}
                    onClick={() => { handleChordPlay(d.chord); addToProgression(d.chord); }}
                    onMouseEnter={() => setHoveredChord(d.chord)}
                    onMouseLeave={() => setHoveredChord(null)}
                    className={`relative rounded-lg py-2 px-1 text-center transition-all border ${
                      isSelected
                        ? 'border-white/50 shadow-lg'
                        : 'border-transparent hover:border-white/20'
                    }`}
                    style={{ backgroundColor: functionColor(d.function) + '33' }}
                  >
                    <div className="text-xs font-semibold text-white">{chordName(d.chord)}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: functionColor(d.function) }}>
                      {d.roman}
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5">
                      {d.function === 'tonic' ? 'T' : d.function === 'subdominant' ? 'S' : 'D'}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mt-2 text-[10px]">
              <Badge variant="tonic">Tonic</Badge>
              <Badge variant="subdominant">Subdominant</Badge>
              <Badge variant="dominant">Dominant</Badge>
            </div>
          </Card>

          {/* Selected chord context */}
          {selectedChord && (
            <Card title="Selected Chord">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: selectedInfo ? functionColor(selectedInfo.function) : '#6b7280' }}
                >
                  {chordName(selectedChord)}
                </div>
                <div>
                  <div className="text-sm text-white font-medium">
                    {selectedInfo ? `${selectedInfo.roman} — ${selectedInfo.function}` : 'Non-diatonic'}
                  </div>
                  <div className="text-xs text-white/50">
                    Notes: {chordPitchClasses(selectedChord).map(pc => noteName(pc)).join(', ')}
                  </div>
                </div>
              </div>

              {/* Next moves */}
              {nextMoves.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1.5">Where to go next</div>
                  <div className="flex flex-col gap-1">
                    {nextMoves.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => { handleChordPlay(m.chord); addToProgression(m.chord); }}
                        onMouseEnter={() => setHoveredChord(m.chord)}
                        onMouseLeave={() => setHoveredChord(null)}
                        className="flex items-center gap-2 text-left rounded px-2 py-1.5 hover:bg-white/5 transition-colors group"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          m.strength === 'strong' ? 'bg-amber-400' : m.strength === 'common' ? 'bg-purple-400' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs font-medium text-white/80 group-hover:text-white">
                          {chordName(m.chord)}
                        </span>
                        <span className="text-[10px] text-white/50">{m.info.roman}</span>
                        <span className="text-[10px] text-white/50 ml-auto">{m.reason}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Audio init */}
          {!audioReady && (
            <Card>
              <Button variant="primary" size="md" onClick={handleInitAudio} className="w-full">
                Enable Audio
              </Button>
            </Card>
          )}

          {/* Saved progressions */}
          <Card
            title="Saved"
            noBorder
            className="flex-1"
            action={savedProgressions.length > 0 ? (
              <Button variant="ghost" onClick={() => setShowSaved(!showSaved)}>
                {showSaved ? 'Hide' : 'Show'} ({savedProgressions.length})
              </Button>
            ) : undefined}
          >
            {progression.length > 0 && (
              <div className="flex gap-1">
                <input
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="Name this progression..."
                  className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <Button variant="primary" onClick={handleSave}>Save</Button>
              </div>
            )}

            {showSaved && (
              <div className="mt-2 flex flex-col gap-1">
                {savedProgressions.map(prog => (
                  <div key={prog.id} className="flex items-center justify-between text-xs bg-white/5 rounded px-2 py-1.5">
                    <button
                      onClick={() => loadProgressionById(prog.id)}
                      className="text-white/70 hover:text-white truncate flex-1 text-left"
                    >
                      {prog.name} <span className="text-white/50">({prog.chords.length})</span>
                    </button>
                    <Button variant="danger" onClick={() => deleteSavedProgression(prog.id)} className="ml-2">
                      del
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Mobile close */}
      <button
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
        className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white/80"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </aside>
  );
};
