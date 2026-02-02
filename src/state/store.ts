import { create } from 'zustand';
import type { Chord } from '../core/chords';
import type { ChordQuality } from '../core/constants';
import type { PresetName } from '../audio/presets';
import type { ArpPatternName } from '../audio/arpeggiation';
import type { RhythmPatternName } from '../audio/rhythmPatterns';
import { generateId, saveProgression, listProgressions, deleteProgression as deleteProg, type SavedProgression } from '../utils/persistence';
import { listReviewCards, countDueReviews } from '../learn/spacedRepetition';
import { undoable, type UndoSlice } from './undoMiddleware';

export type VisualizationMode =
  | 'circleOfFifths'
  | 'proximityPyramid'
  | 'tonalFunctionChart'
  | 'diminishedSymmetry'
  | 'augmentedStar'
  | 'tritoneSubDiagram'
  | 'alternationCircle'
  | 'modulationMap'
  | 'chordScaleMap'
  | 'negativeHarmonyMirror'
  | 'pianoKeyboard'
  | 'sheetMusic';
export type AppMode = 'explore' | 'learn';
export type RelationshipFilter = 'sharedNotes' | 'dominant' | 'tritone' | 'neoRiemannian';

interface AppState {
  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Active visualization
  activeViz: VisualizationMode;
  setActiveViz: (viz: VisualizationMode) => void;

  // Reference key (root pitch class 0-11)
  referenceRoot: number;
  setReferenceRoot: (root: number) => void;

  // Selected chord (currently highlighted)
  selectedChord: Chord | null;
  setSelectedChord: (chord: Chord | null) => void;

  // Hovered chord
  hoveredChord: Chord | null;
  setHoveredChord: (chord: Chord | null) => void;

  // Chord palette qualities to show
  activeQualities: ChordQuality[];
  setActiveQualities: (qualities: ChordQuality[]) => void;

  // Relationship filters
  activeFilters: Set<RelationshipFilter>;
  toggleFilter: (filter: RelationshipFilter) => void;

  // Progression builder
  progression: Chord[];
  addToProgression: (chord: Chord) => void;
  removeFromProgression: (index: number) => void;
  clearProgression: () => void;
  setProgression: (chords: Chord[]) => void;

  // Playback state
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playingIndex: number;
  setPlayingIndex: (index: number) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  isLooping: boolean;
  setIsLooping: (loop: boolean) => void;

  // Audio initialized
  audioReady: boolean;
  setAudioReady: (ready: boolean) => void;

  // Audio settings
  activePreset: PresetName;
  setActivePreset: (preset: PresetName) => void;
  humanize: number;
  setHumanize: (amount: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
  arpPattern: ArpPatternName;
  setArpPattern: (pattern: ArpPatternName) => void;
  rhythmPattern: RhythmPatternName;
  setRhythmPattern: (pattern: RhythmPatternName) => void;

  // Saved progressions
  savedProgressions: SavedProgression[];
  loadSavedProgressions: () => Promise<void>;
  saveCurrentProgression: (name: string) => Promise<void>;
  deleteSavedProgression: (id: string) => Promise<void>;
  loadProgressionById: (id: string) => void;

  // Circle of Fifths overlays
  showDom7Ring: boolean;
  setShowDom7Ring: (show: boolean) => void;
  showSecondaryDominants: boolean;
  setShowSecondaryDominants: (show: boolean) => void;
  showDominantChains: boolean;
  setShowDominantChains: (show: boolean) => void;
  showIIVI: boolean;
  setShowIIVI: (show: boolean) => void;

  // Learn mode
  currentLessonIndex: number;
  setCurrentLessonIndex: (index: number) => void;
  lessonProgress: boolean[];
  completeLessonAt: (index: number) => void;

  // Exercise build-progression state
  exerciseBuildProgression: string[];
  addToExerciseProgression: (chordKey: string) => void;
  resetExerciseProgression: () => void;

  // Voice leading overlay
  showVoiceLeading: boolean;
  setShowVoiceLeading: (show: boolean) => void;

  // Bridge chords overlay
  showBridgeChords: boolean;
  setShowBridgeChords: (show: boolean) => void;

  // Modals
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;

  // Modulation explorer
  modulationTarget: number;
  setModulationTarget: (target: number) => void;

  // Modal interchange overlay
  showModalInterchange: boolean;
  setShowModalInterchange: (show: boolean) => void;

  // Coltrane changes overlay
  showColtraneOverlay: boolean;
  setShowColtraneOverlay: (show: boolean) => void;

  // Sidebar visibility (for mobile)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Sidebar collapsed (desktop rail mode)
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;

  // Spaced repetition review count
  dueReviewCount: number;
  loadDueReviewCount: () => Promise<void>;

  // Announcements for screen readers
  lastAnnouncement: string;
  announce: (text: string) => void;
}

export const useStore = create<AppState & UndoSlice>()(undoable<AppState>((set, get) => ({
  // Mode
  mode: 'explore',
  setMode: (mode) => set({ mode }),

  // Active visualization
  activeViz: 'circleOfFifths',
  setActiveViz: (activeViz) => set({ activeViz }),

  // Reference key
  referenceRoot: 0, // C
  setReferenceRoot: (referenceRoot) => set({ referenceRoot, selectedChord: null }),

  // Selected chord
  selectedChord: null,
  setSelectedChord: (selectedChord) => set({ selectedChord }),

  // Hovered chord
  hoveredChord: null,
  setHoveredChord: (hoveredChord) => set({ hoveredChord }),

  // Qualities
  activeQualities: ['major', 'minor'],
  setActiveQualities: (activeQualities) => set({ activeQualities }),

  // Filters
  activeFilters: new Set<RelationshipFilter>(['sharedNotes', 'dominant']),
  toggleFilter: (filter) => set(state => {
    const next = new Set(state.activeFilters);
    if (next.has(filter)) next.delete(filter);
    else next.add(filter);
    return { activeFilters: next };
  }),

  // Progression
  progression: [],
  addToProgression: (c) => set(state => ({
    progression: [...state.progression, c],
  })),
  removeFromProgression: (index) => set(state => ({
    progression: state.progression.filter((_, i) => i !== index),
  })),
  clearProgression: () => set({ progression: [] }),
  setProgression: (chords) => set({ progression: chords }),

  // Playback
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  playingIndex: -1,
  setPlayingIndex: (playingIndex) => set({ playingIndex }),
  bpm: 80,
  setBpm: (bpm) => set({ bpm }),
  isLooping: false,
  setIsLooping: (isLooping) => set({ isLooping }),

  // Audio
  audioReady: false,
  setAudioReady: (audioReady) => set({ audioReady }),

  // Audio settings
  activePreset: 'piano',
  setActivePreset: (activePreset) => set({ activePreset }),
  humanize: 0,
  setHumanize: (humanize) => set({ humanize }),
  volume: -8,
  setVolume: (volume) => set({ volume }),
  arpPattern: 'block',
  setArpPattern: (arpPattern) => set({ arpPattern }),
  rhythmPattern: 'whole',
  setRhythmPattern: (rhythmPattern) => set({ rhythmPattern }),

  // Circle overlays
  showDom7Ring: false,
  setShowDom7Ring: (showDom7Ring) => set({ showDom7Ring }),
  showSecondaryDominants: false,
  setShowSecondaryDominants: (showSecondaryDominants) => set({ showSecondaryDominants }),
  showDominantChains: false,
  setShowDominantChains: (showDominantChains) => set({ showDominantChains }),
  showIIVI: false,
  setShowIIVI: (showIIVI) => set({ showIIVI }),

  // Learn mode
  currentLessonIndex: 0,
  setCurrentLessonIndex: (currentLessonIndex) => set({ currentLessonIndex }),
  lessonProgress: Array(22).fill(false),
  completeLessonAt: (index) => set(state => {
    const next = [...state.lessonProgress];
    next[index] = true;
    return { lessonProgress: next };
  }),

  // Exercise build-progression
  exerciseBuildProgression: [],
  addToExerciseProgression: (chordKey) => set(state => ({
    exerciseBuildProgression: [...state.exerciseBuildProgression, chordKey],
  })),
  resetExerciseProgression: () => set({ exerciseBuildProgression: [] }),

  // Voice leading overlay
  showVoiceLeading: false,
  setShowVoiceLeading: (showVoiceLeading) => set({ showVoiceLeading }),

  // Bridge chords overlay
  showBridgeChords: false,
  setShowBridgeChords: (showBridgeChords) => set({ showBridgeChords }),

  // Modals
  showShortcutsModal: false,
  setShowShortcutsModal: (showShortcutsModal) => set({ showShortcutsModal }),

  // Modulation explorer
  modulationTarget: 7, // G (one fifth from C)
  setModulationTarget: (modulationTarget) => set({ modulationTarget }),

  // Modal interchange
  showModalInterchange: false,
  setShowModalInterchange: (showModalInterchange) => set({ showModalInterchange }),

  // Coltrane changes
  showColtraneOverlay: false,
  setShowColtraneOverlay: (showColtraneOverlay) => set({ showColtraneOverlay }),

  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Sidebar collapsed (desktop rail mode)
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebarCollapsed: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Spaced repetition
  dueReviewCount: 0,
  loadDueReviewCount: async () => {
    const cards = await listReviewCards();
    set({ dueReviewCount: countDueReviews(cards) });
  },

  // Announcements
  lastAnnouncement: '',
  announce: (text) => set({ lastAnnouncement: text }),

  // Saved progressions
  savedProgressions: [],
  loadSavedProgressions: async () => {
    const progs = await listProgressions();
    set({ savedProgressions: progs });
  },
  saveCurrentProgression: async (name) => {
    const state = get();
    const prog: SavedProgression = {
      id: generateId(),
      name,
      chords: state.progression,
      key: state.referenceRoot,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveProgression(prog);
    await state.loadSavedProgressions();
  },
  deleteSavedProgression: async (id) => {
    await deleteProg(id);
    await get().loadSavedProgressions();
  },
  loadProgressionById: (id) => {
    const prog = get().savedProgressions.find(p => p.id === id);
    if (prog) {
      set({
        progression: prog.chords,
        referenceRoot: prog.key,
      });
    }
  },
})));
