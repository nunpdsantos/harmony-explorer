import { describe, it, expect } from 'vitest';
import { LESSONS } from '../lessonData';

describe('lessonData', () => {
  it('has 22 lessons', () => {
    expect(LESSONS).toHaveLength(22);
  });

  it('every lesson has required fields', () => {
    for (const lesson of LESSONS) {
      expect(lesson.title).toBeTruthy();
      expect(lesson.subtitle).toBeTruthy();
      expect(lesson.visualization).toBeTruthy();
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.exercises.length).toBeGreaterThan(0);
    }
  });

  it('every section has heading and text', () => {
    for (const lesson of LESSONS) {
      for (const section of lesson.sections) {
        expect(section.heading).toBeTruthy();
        expect(section.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('every exercise has a valid type and question', () => {
    const validTypes = ['select-chord', 'build-progression', 'identify-function'];
    for (const lesson of LESSONS) {
      for (const ex of lesson.exercises) {
        expect(validTypes).toContain(ex.type);
        expect(ex.question).toBeTruthy();
      }
    }
  });

  it('select-chord exercises have correctAnswer and options', () => {
    for (const lesson of LESSONS) {
      for (const ex of lesson.exercises) {
        if (ex.type === 'select-chord') {
          expect(ex.correctAnswer).toBeTruthy();
          expect(ex.options!.length).toBeGreaterThanOrEqual(2);
          expect(ex.optionKeys!.length).toBe(ex.options!.length);
          expect(ex.optionKeys).toContain(ex.correctAnswer);
        }
      }
    }
  });

  it('identify-function exercises have correctFunction and options', () => {
    for (const lesson of LESSONS) {
      for (const ex of lesson.exercises) {
        if (ex.type === 'identify-function') {
          expect(ex.correctFunction).toBeTruthy();
          expect(ex.options!.length).toBeGreaterThanOrEqual(2);
          expect(ex.optionKeys!.length).toBe(ex.options!.length);
          expect(ex.optionKeys).toContain(ex.correctFunction);
        }
      }
    }
  });

  it('build-progression exercises have expectedProgression', () => {
    for (const lesson of LESSONS) {
      for (const ex of lesson.exercises) {
        if (ex.type === 'build-progression') {
          expect(ex.expectedProgression).toBeDefined();
          expect(ex.expectedProgression!.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('every exercise has an explanation', () => {
    for (const lesson of LESSONS) {
      for (const ex of lesson.exercises) {
        expect(ex.explanation).toBeTruthy();
      }
    }
  });

  // ── Advanced lessons (13–16) ────────────────────────────────────────

  it('Lesson 13 is Voice Leading with circleOfFifths viz', () => {
    const lesson = LESSONS[12];
    expect(lesson.title).toBe('Voice Leading');
    expect(lesson.visualization).toBe('circleOfFifths');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 14 is Modulation with modulationMap viz', () => {
    const lesson = LESSONS[13];
    expect(lesson.title).toBe('Modulation');
    expect(lesson.visualization).toBe('modulationMap');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 15 is Bridge Chords with circleOfFifths viz', () => {
    const lesson = LESSONS[14];
    expect(lesson.title).toBe('Bridge Chords');
    expect(lesson.visualization).toBe('circleOfFifths');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 16 is Capstone with tonalFunctionChart viz', () => {
    const lesson = LESSONS[15];
    expect(lesson.title).toBe('Capstone: Harmonic Analysis');
    expect(lesson.visualization).toBe('tonalFunctionChart');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 16 capstone includes a build-progression exercise', () => {
    const lesson = LESSONS[15];
    const buildEx = lesson.exercises.find(e => e.type === 'build-progression');
    expect(buildEx).toBeDefined();
    expect(buildEx!.expectedProgression).toEqual(['7-major', '0-major', '2-major', '7-major']);
  });

  it('all visualization modes used by lessons are valid', () => {
    const validModes = [
      'circleOfFifths', 'tonalFunctionChart', 'tritoneSubDiagram',
      'diminishedSymmetry', 'alternationCircle', 'modulationMap',
      'proximityPyramid', 'augmentedStar', 'chordScaleMap', 'negativeHarmonyMirror',
    ];
    for (const lesson of LESSONS) {
      expect(validModes).toContain(lesson.visualization);
    }
  });

  it('unique titles for all 22 lessons', () => {
    const titles = LESSONS.map(l => l.title);
    expect(new Set(titles).size).toBe(22);
  });

  it('total exercises across all lessons is at least 36', () => {
    const total = LESSONS.reduce((sum, l) => sum + l.exercises.length, 0);
    // Original 12 lessons had ~29 exercises, 4 new lessons add 12 more = 41
    expect(total).toBeGreaterThanOrEqual(36);
  });

  // ── Extended Harmony lessons (17–22) ──────────────────────────────────

  it('Lesson 17 is Chord Extensions with chordScaleMap viz', () => {
    const lesson = LESSONS[16];
    expect(lesson.title).toBe('Chord Extensions');
    expect(lesson.visualization).toBe('chordScaleMap');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 18 is Modes & Scales with chordScaleMap viz', () => {
    const lesson = LESSONS[17];
    expect(lesson.title).toBe('Modes & Scales');
    expect(lesson.visualization).toBe('chordScaleMap');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 19 is Chord-Scale Theory with chordScaleMap viz', () => {
    const lesson = LESSONS[18];
    expect(lesson.title).toBe('Chord-Scale Theory');
    expect(lesson.visualization).toBe('chordScaleMap');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 20 is Modal Interchange with circleOfFifths viz', () => {
    const lesson = LESSONS[19];
    expect(lesson.title).toBe('Modal Interchange');
    expect(lesson.visualization).toBe('circleOfFifths');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 21 is Altered Dominants & Reharmonization with circleOfFifths viz', () => {
    const lesson = LESSONS[20];
    expect(lesson.title).toBe('Altered Dominants & Reharmonization');
    expect(lesson.visualization).toBe('circleOfFifths');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('Lesson 22 is Coltrane Changes & Negative Harmony with circleOfFifths viz', () => {
    const lesson = LESSONS[21];
    expect(lesson.title).toBe('Coltrane Changes & Negative Harmony');
    expect(lesson.visualization).toBe('circleOfFifths');
    expect(lesson.exercises).toHaveLength(3);
  });

  it('lessons 17-22 each have 3 sections', () => {
    for (let i = 16; i < 22; i++) {
      expect(LESSONS[i].sections).toHaveLength(3);
    }
  });

  it('total exercises across all 22 lessons is at least 59', () => {
    const total = LESSONS.reduce((sum, l) => sum + l.exercises.length, 0);
    // 16 original lessons had varying exercise counts + 6 new lessons × 3 = 59
    expect(total).toBeGreaterThanOrEqual(59);
  });
});
