import type { VisualizationMode } from '../state/store';

export interface LessonSection {
  heading: string;
  text: string;
}

export interface LessonExercise {
  type: 'select-chord' | 'build-progression' | 'identify-function';
  question: string;
  /** For select-chord: the correct answer as "root-quality" key */
  correctAnswer?: string;
  /** For build-progression: expected sequence of "root-quality" keys */
  expectedProgression?: string[];
  /** For identify-function: the correct function name */
  correctFunction?: string;
  /** Multiple choice options (display labels) */
  options?: string[];
  /** Corresponding answer keys for options */
  optionKeys?: string[];
  /** Explanation shown after answering (correct or incorrect) */
  explanation?: string;
}

export interface LessonDefinition {
  title: string;
  subtitle: string;
  visualization: VisualizationMode;
  sections: LessonSection[];
  exercises: LessonExercise[];
}

export const LESSONS: LessonDefinition[] = [
  {
    title: 'The Major Scale',
    subtitle: 'The foundation of Western harmony',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is a Scale?',
        text: 'A scale is a set of notes arranged in ascending or descending order. The major scale is the most fundamental scale in Western music, consisting of 7 notes following the pattern: Whole-Whole-Half-Whole-Whole-Whole-Half (W-W-H-W-W-W-H).',
      },
      {
        heading: 'The C Major Scale',
        text: 'Starting from C, the major scale gives us: C, D, E, F, G, A, B. These are the white keys on a piano. Every major key follows the same interval pattern but starts on a different note.',
      },
      {
        heading: 'Scale Degrees',
        text: 'Each note in the scale has a degree number (1-7) and a name: 1=Tonic, 2=Supertonic, 3=Mediant, 4=Subdominant, 5=Dominant, 6=Submediant, 7=Leading Tone. These names reflect each note\'s relationship to the tonic.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What is the 5th degree of a major scale called?',
        correctFunction: 'dominant',
        options: ['Tonic', 'Subdominant', 'Dominant', 'Mediant'],
        optionKeys: ['tonic', 'subdominant', 'dominant', 'mediant'],
        explanation: 'The 5th degree is called the Dominant because it has the strongest pull back to the tonic. The dominant-to-tonic resolution (V\u2192I) is the foundation of tonal harmony.',
      },
      {
        type: 'identify-function',
        question: 'What is the 1st degree of a major scale called?',
        correctFunction: 'tonic',
        options: ['Tonic', 'Leading Tone', 'Dominant', 'Supertonic'],
        optionKeys: ['tonic', 'leadingTone', 'dominant', 'supertonic'],
        explanation: 'The 1st degree is the Tonic \u2014 the "home" note that gives the key its name. All other scale degrees are defined by their relationship to the tonic.',
      },
      {
        type: 'identify-function',
        question: 'Which scale degree is the Leading Tone?',
        correctFunction: '7',
        options: ['6th', '7th', '4th', '2nd'],
        optionKeys: ['6', '7', '4', '2'],
        explanation: 'The 7th degree is the Leading Tone because it is only a half step below the tonic, creating a strong upward pull. This semitone relationship is what makes major keys feel resolved.',
      },
    ],
  },
  {
    title: 'Building Triads',
    subtitle: 'Stacking thirds to create chords',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is a Triad?',
        text: 'A triad is a three-note chord built by stacking two thirds on top of a root note. The quality of each third (major or minor) determines the chord type.',
      },
      {
        heading: 'Four Triad Types',
        text: 'Major triad: major 3rd + minor 3rd (C-E-G). Minor triad: minor 3rd + major 3rd (C-Eb-G). Diminished triad: minor 3rd + minor 3rd (C-Eb-Gb). Augmented triad: major 3rd + major 3rd (C-E-G#).',
      },
      {
        heading: 'Diatonic Triads',
        text: 'Building a triad on each degree of the major scale gives us 7 diatonic chords: I(major), ii(minor), iii(minor), IV(major), V(major), vi(minor), vii\u00B0(diminished). Notice the pattern of chord qualities.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What quality is the chord built on the 2nd degree of a major scale?',
        correctFunction: 'minor',
        options: ['Major', 'Minor', 'Diminished', 'Augmented'],
        optionKeys: ['major', 'minor', 'diminished', 'augmented'],
        explanation: 'The ii chord is minor because the major scale\u2019s interval pattern produces a minor 3rd + major 3rd when stacking thirds from the 2nd degree. The diatonic pattern is: I(M), ii(m), iii(m), IV(M), V(M), vi(m), vii\u00B0(dim).',
      },
      {
        type: 'identify-function',
        question: 'What quality is the chord built on the 7th degree?',
        correctFunction: 'diminished',
        options: ['Major', 'Minor', 'Diminished', 'Augmented'],
        optionKeys: ['major', 'minor', 'diminished', 'augmented'],
        explanation: 'The vii\u00B0 chord is diminished because stacking thirds from the 7th degree yields two minor thirds (minor 3rd + minor 3rd). It\u2019s the only diminished triad among the diatonic chords.',
      },
      {
        type: 'select-chord',
        question: 'In C major, what is the iii chord?',
        correctAnswer: '4-minor',
        options: ['D minor', 'E minor', 'F major', 'A minor'],
        optionKeys: ['2-minor', '4-minor', '5-major', '9-minor'],
        explanation: 'The iii chord in C major is E minor (E-G-B). The 3rd degree of C major is E, and building a triad from E using only notes in C major gives a minor triad.',
      },
    ],
  },
  {
    title: 'The Circle of Fifths',
    subtitle: 'Navigating all 12 keys',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is the Circle of Fifths?',
        text: 'The Circle of Fifths arranges all 12 major keys by ascending perfect fifths (7 semitones). Moving clockwise from C: C, G, D, A, E, B, F#/Gb, Db, Ab, Eb, Bb, F, and back to C.',
      },
      {
        heading: 'Key Relationships',
        text: 'Adjacent keys on the circle share 6 of 7 notes, making them closely related. Keys across the circle (tritone apart) share the fewest notes and sound most distant.',
      },
      {
        heading: 'Sharps and Flats',
        text: 'Each clockwise step adds one sharp; each counter-clockwise step adds one flat. C has no sharps or flats. G has one sharp (F#). F has one flat (Bb).',
      },
    ],
    exercises: [
      {
        type: 'select-chord',
        question: 'Which key is one fifth above C major?',
        correctAnswer: '7-major',
        options: ['F major', 'G major', 'D major', 'A major'],
        optionKeys: ['5-major', '7-major', '2-major', '9-major'],
        explanation: 'G major is one fifth (7 semitones) above C. Moving clockwise on the Circle of Fifths from C lands on G. G major has one sharp (F#).',
      },
      {
        type: 'select-chord',
        question: 'Which key is one fifth below C major (counter-clockwise)?',
        correctAnswer: '5-major',
        options: ['G major', 'F major', 'Bb major', 'D major'],
        optionKeys: ['7-major', '5-major', '10-major', '2-major'],
        explanation: 'F major is one fifth below C (or equivalently, a perfect fourth above). Moving counter-clockwise on the circle from C lands on F. F major has one flat (Bb).',
      },
      {
        type: 'identify-function',
        question: 'How many notes do adjacent keys on the Circle of Fifths share?',
        correctFunction: '6',
        options: ['4', '5', '6', '7'],
        optionKeys: ['4', '5', '6', '7'],
        explanation: 'Adjacent keys share 6 out of 7 notes, differing by only one sharp or flat. This is why adjacent keys sound closely related and modulations between them are smooth.',
      },
    ],
  },
  {
    title: 'Tonal Function',
    subtitle: 'Tonic, Subdominant, and Dominant',
    visualization: 'tonalFunctionChart',
    sections: [
      {
        heading: 'Three Functional Groups',
        text: 'Every diatonic chord belongs to one of three functional groups: Tonic (rest/home), Subdominant (departure), or Dominant (tension seeking resolution).',
      },
      {
        heading: 'Tonic Function (T)',
        text: 'Chords I, iii, and vi provide stability and a sense of home. The I chord is the ultimate point of rest. The iii and vi chords can substitute for I.',
      },
      {
        heading: 'Subdominant and Dominant',
        text: 'Subdominant chords (ii, IV) create motion away from tonic. Dominant chords (V, vii\u00B0) create tension that wants to resolve back to tonic. The fundamental harmonic cycle is T \u2192 S \u2192 D \u2192 T.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What is the tonal function of the IV chord?',
        correctFunction: 'subdominant',
        options: ['Tonic', 'Subdominant', 'Dominant'],
        optionKeys: ['tonic', 'subdominant', 'dominant'],
        explanation: 'The IV chord is Subdominant \u2014 it creates motion away from tonic. Along with the ii chord, it forms the subdominant group that typically precedes dominant harmony in the T\u2192S\u2192D\u2192T cycle.',
      },
      {
        type: 'identify-function',
        question: 'Which chord is part of the Tonic function group?',
        correctFunction: 'vi',
        options: ['ii', 'IV', 'vi', 'V'],
        optionKeys: ['ii', 'IV', 'vi', 'V'],
        explanation: 'The vi chord belongs to the Tonic group (along with I and iii) because it shares two notes with the I chord. This is why vi can substitute for I \u2014 as heard in deceptive cadences (V\u2192vi).',
      },
      {
        type: 'identify-function',
        question: 'What is the fundamental harmonic cycle?',
        correctFunction: 'tsdt',
        options: ['T\u2192D\u2192S\u2192T', 'T\u2192S\u2192D\u2192T', 'S\u2192T\u2192D\u2192T', 'D\u2192T\u2192S\u2192D'],
        optionKeys: ['tdst', 'tsdt', 'stdt', 'dtsd'],
        explanation: 'The fundamental cycle is Tonic \u2192 Subdominant \u2192 Dominant \u2192 Tonic (T\u2192S\u2192D\u2192T). You start at rest, move to departure, build tension, then resolve. Most chord progressions follow this underlying pattern.',
      },
    ],
  },
  {
    title: 'The V-I Cadence',
    subtitle: 'The most fundamental harmonic resolution',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is a Cadence?',
        text: 'A cadence is a chord progression that creates a sense of resolution or pause. The V-I cadence (called "authentic cadence") is the strongest resolution in tonal music.',
      },
      {
        heading: 'Why V Resolves to I',
        text: 'The V chord contains the leading tone (7th scale degree) which is one semitone below the tonic, creating a strong pull. In C major, G contains B, which resolves up to C.',
      },
      {
        heading: 'The Deceptive Cadence',
        text: 'Instead of resolving V to I, composers sometimes use V to vi (the "deceptive cadence"). The vi chord shares two notes with I, providing partial resolution while surprising the listener.',
      },
    ],
    exercises: [
      {
        type: 'select-chord',
        question: 'In C major, which chord is the dominant (V)?',
        correctAnswer: '7-major',
        options: ['F major', 'G major', 'A minor', 'D minor'],
        optionKeys: ['5-major', '7-major', '9-minor', '2-minor'],
        explanation: 'G major is the V chord in C major. The 5th degree of C major is G, and the triad built on G using C major scale notes is G-B-D (a major triad). The B natural (leading tone) creates the strong pull to C.',
      },
      {
        type: 'select-chord',
        question: 'In a deceptive cadence, V resolves to which chord instead of I?',
        correctAnswer: '9-minor',
        options: ['IV (F)', 'ii (Dm)', 'vi (Am)', 'iii (Em)'],
        optionKeys: ['5-major', '2-minor', '9-minor', '4-minor'],
        explanation: 'The deceptive cadence resolves V to vi instead of I. The vi chord (Am in C major) shares two notes with I (C and E), providing partial resolution while subverting the listener\u2019s expectation of the tonic.',
      },
    ],
  },
  {
    title: 'Common Progressions',
    subtitle: 'I-IV-V-I and I-vi-IV-V',
    visualization: 'tonalFunctionChart',
    sections: [
      {
        heading: 'I-IV-V-I',
        text: 'The most basic progression: start at home (I), move to subdominant (IV), build tension with dominant (V), and resolve back home (I). Found across folk, rock, blues, and classical music.',
      },
      {
        heading: 'I-vi-IV-V ("50s Progression")',
        text: 'Adding the vi chord before IV creates a smoother, more emotional progression. This is one of the most common pop progressions ever written. In C: C-Am-F-G.',
      },
      {
        heading: 'Why These Work',
        text: 'Both progressions follow the T \u2192 S \u2192 D \u2192 T functional flow. Each chord shares notes with its neighbors, creating smooth voice leading. The dominant at the end creates the pull back to tonic.',
      },
    ],
    exercises: [
      {
        type: 'build-progression',
        question: 'Build the I-IV-V-I progression in C major by clicking chords.',
        expectedProgression: ['0-major', '5-major', '7-major', '0-major'],
        explanation: 'I-IV-V-I (C-F-G-C) follows the T\u2192S\u2192D\u2192T functional cycle. The IV provides departure from home, V builds tension, and the final I resolves it. This is the most foundational progression in Western music.',
      },
      {
        type: 'select-chord',
        question: 'In the "50s progression" (I-vi-IV-V), which chord comes after I?',
        correctAnswer: '9-minor',
        options: ['IV (F)', 'V (G)', 'vi (Am)', 'ii (Dm)'],
        optionKeys: ['5-major', '7-major', '9-minor', '2-minor'],
        explanation: 'The vi chord (Am) follows I in the "50s progression" (I-vi-IV-V). The I to vi movement is smooth because they share two notes (C and E), creating a gentle shift from major to minor before the subdominant.',
      },
    ],
  },
  {
    title: 'Seventh Chords',
    subtitle: 'Adding the 7th for richer harmony',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is a 7th Chord?',
        text: 'A seventh chord adds a fourth note on top of a triad, stacking another third. This creates richer, more colorful harmony with stronger functional identity.',
      },
      {
        heading: 'Types of 7th Chords',
        text: 'Major 7th (Cmaj7): warm, dreamy. Dominant 7th (G7): tense, wants to resolve. Minor 7th (Dm7): smooth, jazzy. Half-diminished 7th (Bm7b5): dark, unstable. Diminished 7th (B\u00B07): extremely tense.',
      },
      {
        heading: 'The Dominant 7th',
        text: 'The dominant 7th (V7) is the most important 7th chord. It contains a tritone (the interval between the 3rd and 7th of the chord) which creates strong tension demanding resolution to the tonic.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'Which type of 7th chord creates the most tension?',
        correctFunction: 'dom7',
        options: ['Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-diminished 7th'],
        optionKeys: ['maj7', 'dom7', 'min7', 'halfDim7'],
        explanation: 'The Dominant 7th creates the most tension because it contains a tritone between its 3rd and 7th. In G7 the tritone is B-F, which resolves naturally to C-E in a C major chord. This makes V7\u2192I the strongest resolution.',
      },
      {
        type: 'identify-function',
        question: 'What interval within a dominant 7th chord creates its characteristic tension?',
        correctFunction: 'tritone',
        options: ['Perfect 5th', 'Minor 3rd', 'Tritone', 'Major 7th'],
        optionKeys: ['p5', 'm3', 'tritone', 'M7'],
        explanation: 'The tritone (6 semitones) between the 3rd and 7th of a dominant 7th chord is the source of its tension. The tritone is the most dissonant interval and it resolves by contrary motion: the 3rd moves up to the tonic while the 7th moves down.',
      },
    ],
  },
  {
    title: 'The ii-V-I Progression',
    subtitle: 'The backbone of jazz harmony',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is ii-V-I?',
        text: 'The ii-V-I is the most common progression in jazz. It follows the S \u2192 D \u2192 T functional path: ii (subdominant) prepares V (dominant), which resolves to I (tonic). In C: Dm7-G7-Cmaj7.',
      },
      {
        heading: 'Voice Leading Magic',
        text: 'The ii-V-I works so well because of smooth voice leading. Each chord shares notes with the next, and the remaining notes move by small intervals. The 7th of each chord falls by step to become the 3rd of the next.',
      },
      {
        heading: 'Secondary ii-V-Is',
        text: 'You can create a ii-V-I targeting any diatonic chord, not just I. For example, to approach the IV chord (F in C major): Gm7-C7-F. These "secondary ii-V-Is" are essential in jazz.',
      },
    ],
    exercises: [
      {
        type: 'build-progression',
        question: 'Build a ii-V-I in C major (Dm, G, C).',
        expectedProgression: ['2-minor', '7-major', '0-major'],
        explanation: 'The ii-V-I in C major is Dm-G-C. The ii (Dm) is subdominant, V (G) is dominant, and I (C) is tonic. The voice leading is exceptionally smooth: the 7th of each chord falls by step to become the 3rd of the next.',
      },
      {
        type: 'identify-function',
        question: 'In the ii-V-I, which functional group does the ii chord belong to?',
        correctFunction: 'subdominant',
        options: ['Tonic', 'Subdominant', 'Dominant'],
        optionKeys: ['tonic', 'subdominant', 'dominant'],
        explanation: 'The ii chord is Subdominant, which is why ii-V-I maps perfectly to S\u2192D\u2192T. The ii chord prepares the dominant by establishing the subdominant function first, making the V\u2192I resolution feel even more inevitable.',
      },
    ],
  },
  {
    title: 'Secondary Dominants',
    subtitle: 'Borrowing dominant tension for any chord',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is a Secondary Dominant?',
        text: 'A secondary dominant is a dominant 7th chord that resolves to a diatonic chord other than I. It\'s like briefly tonicizing that chord. Notated as V7/X where X is the target.',
      },
      {
        heading: 'Examples in C Major',
        text: 'V7/ii = A7 (resolves to Dm), V7/iii = B7 (resolves to Em), V7/IV = C7 (resolves to F), V7/V = D7 (resolves to G), V7/vi = E7 (resolves to Am).',
      },
      {
        heading: 'Using Secondary Dominants',
        text: 'Insert a secondary dominant before its target to add tension and direction. Instead of just going to the IV chord, approach it with V7/IV first: C \u2192 C7 \u2192 F. Turn on the "Dom 7th Ring" and "Secondary Dominants" overlays to see these relationships.',
      },
    ],
    exercises: [
      {
        type: 'select-chord',
        question: 'In C major, what is V7/V (the secondary dominant of V)?',
        correctAnswer: '2-dom7',
        options: ['A7', 'D7', 'E7', 'B7'],
        optionKeys: ['9-dom7', '2-dom7', '4-dom7', '11-dom7'],
        explanation: 'V7/V in C major is D7. The V chord is G, so the dominant of G is D. D7 contains F# (the leading tone of G), which creates a strong pull to resolve to G. Try enabling the Secondary Dominants overlay to see all these relationships.',
      },
      {
        type: 'select-chord',
        question: 'What is V7/ii in C major? (The secondary dominant targeting Dm)',
        correctAnswer: '9-dom7',
        options: ['A7', 'E7', 'B7', 'C7'],
        optionKeys: ['9-dom7', '4-dom7', '11-dom7', '0-dom7'],
        explanation: 'V7/ii is A7. The ii chord is Dm, so the dominant of Dm is A. A7 contains C# (the leading tone of D), creating chromatic tension that resolves beautifully to the ii chord.',
      },
    ],
  },
  {
    title: 'Tritone Substitutions',
    subtitle: 'Replacing dominants with their tritone twin',
    visualization: 'tritoneSubDiagram',
    sections: [
      {
        heading: 'The Tritone Interval',
        text: 'A tritone is an interval of 6 semitones (3 whole tones), exactly half an octave. It\'s the most dissonant interval and the source of dominant chord tension.',
      },
      {
        heading: 'How Tritone Subs Work',
        text: 'Two dominant 7th chords whose roots are a tritone apart share the same tritone interval (3rd and 7th swap roles). G7 has B and F; Db7 has F and Cb(=B). This means Db7 can substitute for G7.',
      },
      {
        heading: 'Chromatic Bass Lines',
        text: 'Tritone subs create smooth chromatic bass motion. Instead of Dm7-G7-C (bass: D-G-C), use Dm7-Db7-C (bass: D-Db-C). The half-step descent into the tonic is very satisfying.',
      },
    ],
    exercises: [
      {
        type: 'select-chord',
        question: 'What is the tritone substitution for G7?',
        correctAnswer: '1-dom7',
        options: ['Db7', 'Eb7', 'Ab7', 'F7'],
        optionKeys: ['1-dom7', '3-dom7', '8-dom7', '5-dom7'],
        explanation: 'Db7 is the tritone sub for G7. Their roots are 6 semitones apart (G to Db), and they share the same tritone interval: G7 has B and F, Db7 has F and Cb (=B). This shared tritone is why one can substitute for the other.',
      },
      {
        type: 'identify-function',
        question: 'What makes tritone subs useful for bass lines?',
        correctFunction: 'chromatic',
        options: ['Chromatic motion', 'Leaping bass', 'Pedal tone', 'Octave jumps'],
        optionKeys: ['chromatic', 'leaping', 'pedal', 'octave'],
        explanation: 'Tritone subs create smooth chromatic (half-step) bass motion. In a ii-V-I, replacing V with its tritone sub changes the bass from D-G-C to D-Db-C \u2014 a satisfying descending chromatic line that leads smoothly into the tonic.',
      },
    ],
  },
  {
    title: 'Diminished & Augmented Symmetry',
    subtitle: 'Symmetric chords that divide the octave evenly',
    visualization: 'diminishedSymmetry',
    sections: [
      {
        heading: 'Diminished 7th Symmetry',
        text: 'A diminished 7th chord divides the octave into 4 equal parts (minor thirds). There are only 3 unique dim7 chords, and each can resolve to 4 different major keys by moving any note up a half step.',
      },
      {
        heading: 'Augmented Triad Symmetry',
        text: 'An augmented triad divides the octave into 3 equal parts (major thirds). There are only 4 unique augmented triads. Moving any single note by one semitone yields 6 different major or minor triads.',
      },
      {
        heading: 'Using Symmetric Chords',
        text: 'Because of their symmetry, diminished and augmented chords act as "pivot" chords for modulation. They connect distant keys smoothly because they can resolve in multiple directions.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'How many unique diminished 7th chords exist?',
        correctFunction: '3',
        options: ['3', '4', '6', '12'],
        optionKeys: ['3', '4', '6', '12'],
        explanation: 'There are only 3 unique diminished 7th chords because each divides the octave into 4 equal minor thirds. With 12 pitch classes \u00F7 4 notes per chord = 3 unique groups. Any inversion of a dim7 is enharmonically equivalent to another dim7.',
      },
      {
        type: 'identify-function',
        question: 'How many unique augmented triads exist?',
        correctFunction: '4',
        options: ['3', '4', '6', '12'],
        optionKeys: ['3', '4', '6', '12'],
        explanation: 'There are 4 unique augmented triads because each divides the octave into 3 equal major thirds. With 12 pitch classes \u00F7 3 notes per chord = 4 unique groups. Each augmented triad can resolve to 6 different major or minor triads by moving a single note by one semitone.',
      },
    ],
  },
  {
    title: 'Neo-Riemannian Transforms',
    subtitle: 'P, L, and R: moving through triads by semitone',
    visualization: 'alternationCircle',
    sections: [
      {
        heading: 'Three Transformations',
        text: 'Neo-Riemannian theory describes three basic transformations between major and minor triads: Parallel (P) changes the third, Leading-tone (L) moves one note by a semitone to a new triad, and Relative (R) connects relative major/minor.',
      },
      {
        heading: 'P (Parallel)',
        text: 'P flips between major and minor: C major \u2194 C minor. The root and fifth stay; only the third moves. This is the simplest transformation.',
      },
      {
        heading: 'L and R',
        text: 'L (Leading-tone): C major \u2192 E minor, C minor \u2192 Ab major. One note moves by semitone. R (Relative): C major \u2192 A minor, C minor \u2192 Eb major. Connects relative keys. Alternating P and L visits all 24 major/minor triads!',
      },
    ],
    exercises: [
      {
        type: 'select-chord',
        question: 'What is the Parallel (P) transform of C major?',
        correctAnswer: '0-minor',
        options: ['C minor', 'A minor', 'E minor', 'G major'],
        optionKeys: ['0-minor', '9-minor', '4-minor', '7-major'],
        explanation: 'The Parallel (P) transform changes C major to C minor. P keeps the root and fifth the same while moving only the third: E moves down to Eb. It\u2019s the simplest Neo-Riemannian transform \u2014 just one note moves by one semitone.',
      },
      {
        type: 'select-chord',
        question: 'What is the Leading-tone (L) transform of C major?',
        correctAnswer: '4-minor',
        options: ['A minor', 'E minor', 'C minor', 'Ab major'],
        optionKeys: ['9-minor', '4-minor', '0-minor', '8-major'],
        explanation: 'The L transform of C major is E minor. L moves the root (C) down by semitone to B, producing E minor (E-G-B). The other two notes (E and G) stay put. L connects chords whose roots are a major third apart.',
      },
      {
        type: 'select-chord',
        question: 'What is the Relative (R) transform of C major?',
        correctAnswer: '9-minor',
        options: ['C minor', 'E minor', 'A minor', 'F major'],
        optionKeys: ['0-minor', '4-minor', '9-minor', '5-major'],
        explanation: 'The R transform of C major is A minor \u2014 the relative minor. R moves the fifth (G) up by a whole step to A, producing A minor (A-C-E). This connects relative major/minor pairs, the most familiar relationship in tonal music.',
      },
    ],
  },

  // ── Advanced Lessons 13–16 ─────────────────────────────────────────

  {
    title: 'Voice Leading',
    subtitle: 'Smooth connections between chords',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is Voice Leading?',
        text: 'Voice leading describes how individual notes (voices) move from one chord to the next. Good voice leading minimizes the distance each voice travels, creating smooth, connected harmony. Each note in a chord is treated as a separate "voice" that should move as little as possible.',
      },
      {
        heading: 'Common Tones',
        text: 'When two chords share notes, those shared notes (common tones) stay in place while the other voices move. For example, going from C (C-E-G) to Am (A-C-E), the notes C and E are common tones that stay put \u2014 only G moves down to A.',
      },
      {
        heading: 'Measuring Smoothness',
        text: 'Voice-leading quality can be measured by total semitone movement across all voices. A "smooth" transition averages 4 or fewer semitones of movement per voice. The ii-V-I progression is prized because each transition moves voices by minimal distances, with the 7th of each chord stepping down to become the 3rd of the next.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What is the primary goal of smooth voice leading?',
        correctFunction: 'minimal',
        options: ['Minimal voice movement', 'Maximum contrast', 'Parallel octaves', 'Wide leaps'],
        optionKeys: ['minimal', 'contrast', 'parallel', 'leaps'],
        explanation: 'Smooth voice leading minimizes the distance each voice moves between chords. This creates connected, flowing harmony where individual voices trace singable lines rather than jumping unpredictably.',
      },
      {
        type: 'identify-function',
        question: 'When C major (C-E-G) moves to A minor (A-C-E), how many common tones are there?',
        correctFunction: '2',
        options: ['0', '1', '2', '3'],
        optionKeys: ['0', '1', '2', '3'],
        explanation: 'C major and A minor share 2 common tones: C and E. These notes stay in place while only G moves down to A. This is why I\u2192vi is such a smooth progression \u2014 two of three voices don\u2019t move at all.',
      },
      {
        type: 'identify-function',
        question: 'In the ii-V-I progression, what happens to the 7th of each chord?',
        correctFunction: 'steps-down',
        options: ['Steps down to 3rd of next chord', 'Leaps up an octave', 'Stays as common tone', 'Drops out entirely'],
        optionKeys: ['steps-down', 'leaps-up', 'common-tone', 'drops-out'],
        explanation: 'The 7th of each chord falls by a single step to become the 3rd of the next chord. In Dm7-G7-C: the C (7th of Dm7) steps down to B (3rd of G7), and F (7th of G7) steps down to E (3rd of C). This stepwise descent is the voice-leading magic of ii-V-I.',
      },
    ],
  },
  {
    title: 'Modulation',
    subtitle: 'Changing keys through pivot chords',
    visualization: 'modulationMap',
    sections: [
      {
        heading: 'What is Modulation?',
        text: 'Modulation is the process of changing from one key to another within a piece of music. A smooth modulation uses a "pivot chord" \u2014 a chord that belongs to both the old key and the new key, so the listener\u2019s ear is gently redirected.',
      },
      {
        heading: 'Pivot Chords',
        text: 'The most common modulation technique uses chords diatonic in both keys. For example, Am is vi in C major and ii in G major. By reinterpreting Am as ii in G, we smoothly transition to the new key. Closely related keys (adjacent on the Circle of Fifths) share more common chords, making modulation easier.',
      },
      {
        heading: 'Key Distance',
        text: 'Key distance is measured on the Circle of Fifths: adjacent keys (distance 1) share 6 notes, while tritone-apart keys (distance 6) are maximally distant. Diminished 7th and augmented chords can bridge distant keys because their symmetry lets them resolve in multiple directions.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'How many common chords do C major and G major share?',
        correctFunction: '4',
        options: ['2', '3', '4', '6'],
        optionKeys: ['2', '3', '4', '6'],
        explanation: 'C major and G major share 4 common chords: C (I/IV), Em (iii/vi), G (V/I), and Am (vi/ii). These chords can serve as pivots because they are diatonic in both keys. Adjacent keys on the Circle of Fifths always share the most common chords.',
      },
      {
        type: 'identify-function',
        question: 'What is the distance between C and G on the Circle of Fifths?',
        correctFunction: '1',
        options: ['1 (one fifth)', '2 (two fifths)', '3 (three fifths)', '6 (tritone)'],
        optionKeys: ['1', '2', '3', '6'],
        explanation: 'C and G are separated by 1 step on the Circle of Fifths (one fifth apart). This makes them closely related keys that share 6 of 7 scale notes \u2014 only F vs F# differs. Modulation between adjacent keys is the smoothest possible.',
      },
      {
        type: 'select-chord',
        question: 'Which chord can serve as a pivot between C major (vi) and G major (ii)?',
        correctAnswer: '9-minor',
        options: ['Em', 'Am', 'Dm', 'F'],
        optionKeys: ['4-minor', '9-minor', '2-minor', '5-major'],
        explanation: 'Am is vi in C major and ii in G major, making it a perfect pivot chord. By reinterpreting Am from a tonic-function chord (vi in C) to a subdominant-function chord (ii in G), the listener is smoothly redirected to the new key.',
      },
    ],
  },
  {
    title: 'Bridge Chords',
    subtitle: 'Chromatic connections between chords',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What are Bridge Chords?',
        text: 'A bridge chord is inserted between two existing chords to create a smoother or more interesting connection. Instead of jumping directly from one chord to the next, a bridge chord fills the gap with chromatic movement or added tension.',
      },
      {
        heading: 'Secondary Dominants as Bridges',
        text: 'A secondary dominant (V7 of the target chord) creates strong directional pull. For example, inserting A7 before Dm makes the progression C\u2192A7\u2192Dm instead of C\u2192Dm. The A7 borrows dominant tension to propel the harmony forward. Any diatonic chord (except the diminished vii\u00B0) can be approached by its secondary dominant.',
      },
      {
        heading: 'Tritone Subs and Chromatic Passing',
        text: 'The tritone substitution of V7/target creates smooth chromatic bass motion. A chromatic passing diminished chord fills in half-step gaps between bass notes. These techniques create elegant chromatic bass lines that connect otherwise distant chords.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What is the purpose of inserting a bridge chord between two chords?',
        correctFunction: 'smoother',
        options: ['Smoother connection', 'Louder dynamics', 'Faster tempo', 'Longer duration'],
        optionKeys: ['smoother', 'louder', 'faster', 'longer'],
        explanation: 'Bridge chords create smoother connections between chords by adding chromatic motion, dominant tension, or passing tones. They fill harmonic gaps and give the bass line more stepwise movement.',
      },
      {
        type: 'select-chord',
        question: 'Which secondary dominant could serve as a bridge chord approaching Dm?',
        correctAnswer: '9-dom7',
        options: ['D7', 'A7', 'E7', 'G7'],
        optionKeys: ['2-dom7', '9-dom7', '4-dom7', '7-dom7'],
        explanation: 'A7 is V7/ii (the secondary dominant of Dm). It contains C# \u2014 the leading tone of D \u2014 which creates strong chromatic pull toward D minor. Inserting A7 before Dm adds dramatic tension to the arrival.',
      },
      {
        type: 'identify-function',
        question: 'What type of bass motion does a tritone substitution approach create?',
        correctFunction: 'chromatic',
        options: ['Chromatic (half-step)', 'Stepwise (whole-step)', 'Leaping (fourth/fifth)', 'Static (pedal)'],
        optionKeys: ['chromatic', 'stepwise', 'leaping', 'static'],
        explanation: 'Tritone substitution approaches create chromatic (half-step) bass motion. For example, approaching C via Db7 instead of G7 gives a Db\u2192C bass movement \u2014 a satisfying descending semitone that leads smoothly into the target chord.',
      },
    ],
  },
  {
    title: 'Capstone: Harmonic Analysis',
    subtitle: 'Combining all concepts in comprehensive analysis',
    visualization: 'tonalFunctionChart',
    sections: [
      {
        heading: 'Putting It All Together',
        text: 'A complete harmonic analysis identifies: the key, the Roman numeral of each chord, the tonal function of each chord (T/S/D), the quality of voice leading between chords, and any modulations or chromatic elements. These layers of understanding reveal why a progression sounds the way it does.',
      },
      {
        heading: 'Analysis Approach',
        text: 'Start by identifying the key from the diatonic chords. Label each chord with its Roman numeral and function. Look for secondary dominants, tritone substitutions, or borrowed chords. Evaluate the voice leading \u2014 do voices move smoothly or leap? Finally, identify any modulations by finding pivot chords.',
      },
      {
        heading: 'Creative Application',
        text: 'Use these tools to build your own progressions. Start with a functional template (T\u2192S\u2192D\u2192T), add bridge chords for chromatic interest, check your voice leading for smoothness, and experiment with modulation to reach new keys. The Explore mode\u2019s visualization tools help you see these relationships as you compose.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'In I-vi-IV-V, what is the functional sequence?',
        correctFunction: 'ttsd',
        options: ['T\u2192S\u2192D\u2192T', 'T\u2192T\u2192S\u2192D', 'S\u2192D\u2192T\u2192T', 'D\u2192T\u2192S\u2192D'],
        optionKeys: ['tsdt', 'ttsd', 'sdtt', 'dtsd'],
        explanation: 'I is Tonic, vi is Tonic (shares 2 notes with I), IV is Subdominant, V is Dominant \u2014 giving T\u2192T\u2192S\u2192D. The double tonic at the start creates a gentle departure before moving through subdominant and dominant. The V at the end sets up the return to I.',
      },
      {
        type: 'build-progression',
        question: 'Build a I-IV-V-I progression in G major (G, C, D, G).',
        expectedProgression: ['7-major', '0-major', '2-major', '7-major'],
        explanation: 'I-IV-V-I in G major is G-C-D-G. This is the same T\u2192S\u2192D\u2192T functional pattern from Lesson 5, now transposed to a new key. The ability to recognize this pattern in any key is fundamental to harmonic analysis.',
      },
      {
        type: 'identify-function',
        question: 'What is the smoothest way to modulate between closely related keys?',
        correctFunction: 'pivot',
        options: ['Pivot (common) chords', 'Diminished 7th pivots', 'Direct key change', 'Augmented pivots'],
        optionKeys: ['pivot', 'diminished', 'direct', 'augmented'],
        explanation: 'Pivot (common) chords provide the smoothest modulation because the chord belongs to both keys \u2014 the listener barely notices the shift. Diminished and augmented pivots are useful for distant keys, while direct key changes are the most abrupt.',
      },
    ],
  },

  // ── Phase 7 Lessons 17–22 ─────────────────────────────────────────

  {
    title: 'Chord Extensions',
    subtitle: '9ths, 11ths, and 13ths — beyond the 7th',
    visualization: 'chordScaleMap',
    sections: [
      {
        heading: 'What are Extensions?',
        text: 'Chord extensions are notes stacked in thirds beyond the 7th: the 9th, 11th, and 13th. They add color and complexity to 7th chords without changing the fundamental quality. A Cmaj9 is a Cmaj7 with an added 9th (D).',
      },
      {
        heading: 'Diatonic Extensions',
        text: 'Each diatonic 7th chord has natural extensions from the scale. In C major: Cmaj9 (I), Dm9 (ii), Em7\u266d9 (iii — the \u266d9 is an "avoid note"), Fmaj9 (IV), G9 (V), Am9 (vi), Bø7\u266d9 (vii). Extensions give each chord a richer, more distinct sound.',
      },
      {
        heading: 'Avoid Notes',
        text: 'An "avoid note" is a scale tone that clashes with a chord tone by forming a minor 9th (semitone in the upper register). For example, F is an avoid note over Cmaj7 because F is a minor 9th above E (the 3rd). Avoid notes can still be used as passing tones.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What note is the 9th of a C chord?',
        correctFunction: 'D',
        options: ['B', 'D', 'E', 'F'],
        optionKeys: ['B', 'D', 'E', 'F'],
        explanation: 'The 9th of C is D. The 9th is the same pitch class as the 2nd, but voiced an octave higher. It sits a whole step above the root (or a major 9th = 14 semitones).',
      },
      {
        type: 'identify-function',
        question: 'Why is F an "avoid note" over Cmaj7?',
        correctFunction: 'minor9th',
        options: ['Forms a minor 9th with E', 'Creates parallel fifths', 'Too dissonant with G', 'Outside the scale'],
        optionKeys: ['minor9th', 'parallels', 'dissonant', 'outside'],
        explanation: 'F forms a minor 9th interval with E (the 3rd of Cmaj7). A minor 9th (13 semitones) is the harshest interval, clashing strongly with the chord tone. It can be used in passing but shouldn\u2019t be sustained.',
      },
      {
        type: 'identify-function',
        question: 'What is the diatonic 9th chord on the ii degree of C major?',
        correctFunction: 'Dm9',
        options: ['Dm9', 'Dm7\u266d9', 'D9', 'Dmaj9'],
        optionKeys: ['Dm9', 'Dm7b9', 'D9', 'Dmaj9'],
        explanation: 'The ii chord in C major is Dm, and its diatonic 9th is E (a natural 9th from D). So the full chord is Dm9 (D-F-A-C-E). The 9th is diatonic because E is in the C major scale.',
      },
    ],
  },
  {
    title: 'Modes & Scales',
    subtitle: '7 major modes and their characteristic tones',
    visualization: 'chordScaleMap',
    sections: [
      {
        heading: 'The 7 Modes',
        text: 'Each degree of the major scale generates a mode: Ionian (I), Dorian (ii), Phrygian (iii), Lydian (IV), Mixolydian (V), Aeolian (vi), Locrian (vii). Each mode has the same notes as its parent major scale but starts on a different degree, giving it a unique character.',
      },
      {
        heading: 'Characteristic Tones',
        text: 'Each mode has one or two "characteristic tones" — the notes that distinguish it from parallel major or minor. Dorian\u2019s characteristic tone is the natural 6th (bright minor). Lydian\u2019s is the \u266f4 (dreamy major). Mixolydian\u2019s is the \u266d7 (bluesy major). Phrygian\u2019s is the \u266d2 (dark, Spanish).',
      },
      {
        heading: 'Identifying Modes',
        text: 'To identify a mode: (1) find the key signature, (2) determine which note acts as the tonal center, (3) compare to parallel major/minor to find the characteristic tone. If a piece in "A minor" keeps emphasizing F\u266f, it\u2019s A Dorian, not A Aeolian.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What is the characteristic tone of the Dorian mode?',
        correctFunction: 'natural6',
        options: ['Natural 6th', '\u266d2nd', '\u266f4th', '\u266d7th'],
        optionKeys: ['natural6', 'flat2', 'sharp4', 'flat7'],
        explanation: 'Dorian\u2019s characteristic tone is the natural 6th. Compared to Aeolian (natural minor), which has a \u266d6, Dorian raises the 6th by a semitone. This gives Dorian its distinctive bittersweet quality — minor but with a brighter color.',
      },
      {
        type: 'identify-function',
        question: 'Which mode has a raised 4th degree (\u266f4)?',
        correctFunction: 'lydian',
        options: ['Dorian', 'Lydian', 'Mixolydian', 'Phrygian'],
        optionKeys: ['dorian', 'lydian', 'mixolydian', 'phrygian'],
        explanation: 'Lydian mode has the \u266f4 (raised 4th) as its characteristic tone. This gives it a dreamy, floating quality — like major but more ethereal. Lydian is the brightest of all modes.',
      },
      {
        type: 'identify-function',
        question: 'D Dorian uses the same notes as which major scale?',
        correctFunction: 'Cmajor',
        options: ['C major', 'D major', 'G major', 'F major'],
        optionKeys: ['Cmajor', 'Dmajor', 'Gmajor', 'Fmajor'],
        explanation: 'D Dorian uses the same notes as C major (all white keys on the piano). Dorian is the mode built on the 2nd degree of the major scale, so D Dorian = C major starting on D. The notes are D-E-F-G-A-B-C.',
      },
    ],
  },
  {
    title: 'Chord-Scale Theory',
    subtitle: 'Matching scales to chords in context',
    visualization: 'chordScaleMap',
    sections: [
      {
        heading: 'The Chord-Scale Approach',
        text: 'Chord-scale theory assigns a specific scale to each chord in a progression. Rather than thinking of one key for the whole song, each chord gets its own scale. This is essential for improvisation and arranging in jazz.',
      },
      {
        heading: 'Context Matters',
        text: 'The same chord quality gets different scales depending on its function. A min7 chord as ii gets Dorian, as vi gets Aeolian, and as iii gets Phrygian. The "right" scale depends on which key the chord is functioning in and what degree it represents.',
      },
      {
        heading: 'Avoid Notes in Practice',
        text: 'When improvising, treat avoid notes as brief passing tones — don\u2019t sustain or emphasize them. Characteristic tones of each scale are the notes to emphasize. For example, over Dm7 as ii in C, emphasize B (the natural 6th, Dorian\u2019s characteristic tone).',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What scale fits a min7 chord functioning as ii?',
        correctFunction: 'dorian',
        options: ['Aeolian', 'Dorian', 'Phrygian', 'Mixolydian'],
        optionKeys: ['aeolian', 'dorian', 'phrygian', 'mixolydian'],
        explanation: 'A min7 chord as ii gets Dorian. In C major, Dm7 is the ii chord. The scale built from D using C major notes is D Dorian. Its natural 6th (B) is the characteristic tone to emphasize in improvisation.',
      },
      {
        type: 'identify-function',
        question: 'What scale fits a dom7 chord functioning as V?',
        correctFunction: 'mixolydian',
        options: ['Lydian', 'Dorian', 'Mixolydian', 'Altered'],
        optionKeys: ['lydian', 'dorian', 'mixolydian', 'altered'],
        explanation: 'A dom7 as V gets Mixolydian. In C major, G7 is the V chord. The scale from G using C major notes gives G Mixolydian. The \u266d7 (F) is already the 7th of G7, making Mixolydian a natural fit.',
      },
      {
        type: 'identify-function',
        question: 'What scale fits a min7 chord functioning as vi?',
        correctFunction: 'aeolian',
        options: ['Dorian', 'Aeolian', 'Phrygian', 'Locrian'],
        optionKeys: ['dorian', 'aeolian', 'phrygian', 'locrian'],
        explanation: 'A min7 as vi gets Aeolian (natural minor). In C major, Am7 is the vi chord. The scale from A using C major notes gives A Aeolian. Its \u266d6 (F) and \u266d7 (G) give it a more melancholic quality than Dorian.',
      },
    ],
  },
  {
    title: 'Modal Interchange',
    subtitle: 'Borrowing chords from parallel modes',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'What is Modal Interchange?',
        text: 'Modal interchange (also called modal mixture or borrowed chords) is the technique of using chords from a parallel mode. For example, in C major, borrowing the iv chord (Fm) from C minor. This adds color without fully modulating to a new key.',
      },
      {
        heading: 'Common Borrowed Chords',
        text: 'The most commonly borrowed chords come from the parallel Aeolian (natural minor): \u266dVII (B\u266d in C), iv (Fm), \u266dVI (A\u266d), and \u266dIII (E\u266d). These chords add a darker, more emotional quality. The \u266dVII\u2192I cadence is iconic in rock music.',
      },
      {
        heading: 'Function of Borrowed Chords',
        text: 'Most borrowed chords function as subdominant: iv, \u266dVI, and \u266dII all create departure from tonic. The \u266dVII can function as either subdominant or dominant substitute. Borrowed chords typically resolve back to diatonic chords, especially I or V.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'In C major, \u266dVII (B\u266d) is borrowed from which parallel mode?',
        correctFunction: 'aeolian',
        options: ['Dorian', 'Aeolian', 'Lydian', 'Mixolydian'],
        optionKeys: ['dorian', 'aeolian', 'lydian', 'mixolydian'],
        explanation: '\u266dVII is borrowed from C Aeolian (natural minor). In C Aeolian the 7th degree is B\u266d, giving us a B\u266d major triad. It\u2019s one of the most common borrowed chords, used extensively in rock (think "Hey Jude").',
      },
      {
        type: 'identify-function',
        question: 'What function do most borrowed chords serve?',
        correctFunction: 'subdominant',
        options: ['Tonic', 'Subdominant', 'Dominant'],
        optionKeys: ['tonic', 'subdominant', 'dominant'],
        explanation: 'Most borrowed chords serve a subdominant function. Chords like iv, \u266dVI, and \u266dII all create a sense of departure from tonic, similar to the diatonic IV and ii. They typically resolve to V or I.',
      },
      {
        type: 'select-chord',
        question: 'Which chord is the borrowed iv in C major?',
        correctAnswer: '5-minor',
        options: ['Fm', 'Dm', 'Gm', 'Am'],
        optionKeys: ['5-minor', '2-minor', '7-minor', '9-minor'],
        explanation: 'The borrowed iv in C major is Fm. In C minor (Aeolian), the 4th degree is F, and the triad built on it is Fm (F-A\u266d-C). Borrowing Fm into C major adds a plaintive, emotional quality.',
      },
    ],
  },
  {
    title: 'Altered Dominants & Reharmonization',
    subtitle: 'Altered tensions, tritone subs, and upper structures',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'Altered Dominant Chords',
        text: 'Altered dominants modify the 5th, 9th, or 13th of a dominant 7th chord. Common alterations: \u266d9, \u266f9, \u266d5/\u266f11, \u266f5/\u266d13. Each alteration increases tension and creates stronger resolution to the target chord. The "altered scale" (7th mode of melodic minor) provides all alterations simultaneously.',
      },
      {
        heading: 'Choosing Alterations',
        text: 'Choose alterations based on voice leading to the target: \u266d9 resolves down to the 5th of the target, \u266f9 resolves up to the 3rd, \u266f11 resolves to the 5th, \u266d13 resolves down to the 3rd. More alterations = more tension = stronger resolution.',
      },
      {
        heading: 'Upper Structure Triads',
        text: 'An upper structure triad (UST) is a triad played in the upper register over a dominant 7th bass. For example, D/G7 produces G7(9,\u266f11,13). USTs provide a practical voicing method for complex altered dominants and create lush, sophisticated sounds.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'What scale provides all possible alterations over a dominant 7th chord?',
        correctFunction: 'altered',
        options: ['Mixolydian', 'Lydian Dominant', 'Altered', 'Whole Tone'],
        optionKeys: ['mixolydian', 'lydianDom', 'altered', 'wholeTone'],
        explanation: 'The Altered scale (7th mode of melodic minor) provides all alterations: \u266d9, \u266f9, \u266d5/\u266f11, and \u266f5/\u266d13. It\u2019s the maximum-tension scale for dominant chords and resolves powerfully to the tonic.',
      },
      {
        type: 'identify-function',
        question: 'What is an upper structure triad?',
        correctFunction: 'triadOverDom',
        options: ['A triad played over a dominant bass', 'A triad in root position', 'A triad above the staff', 'A three-note voicing'],
        optionKeys: ['triadOverDom', 'rootPos', 'aboveStaff', 'threeNote'],
        explanation: 'An upper structure triad is a major or minor triad voiced in the upper register over a dominant 7th bass (root, 3rd, 7th). The combination produces rich extensions. For example, D major over G7 gives G7(9,\u266f11,13) — a single triad voicing that sounds complex and lush.',
      },
      {
        type: 'identify-function',
        question: 'Which alteration creates the strongest pull to resolve down to the 5th of the target?',
        correctFunction: 'flat9',
        options: ['\u266d9', '\u266f9', '\u266f11', '\u266d13'],
        optionKeys: ['flat9', 'sharp9', 'sharp11', 'flat13'],
        explanation: 'The \u266d9 resolves down by half step to the 5th of the target chord. For G7\u266d9 resolving to C: the A\u266d (\u266d9) moves down to G (5th of C). This half-step resolution creates extremely strong voice leading.',
      },
    ],
  },
  {
    title: 'Coltrane Changes & Negative Harmony',
    subtitle: 'Major thirds cycle and harmonic mirroring',
    visualization: 'circleOfFifths',
    sections: [
      {
        heading: 'Coltrane Changes',
        text: 'John Coltrane\u2019s "Giant Steps" divides the octave into three major-third-related tonal centers, connected by V7 chords. From any tonic, the three centers are a major third apart (e.g., B, G, E\u266d). Each center is approached by its V7, creating a rapid, kaleidoscopic modulation pattern.',
      },
      {
        heading: 'The Giant Steps Pattern',
        text: 'The basic pattern: Imaj7 \u2192 V7/center2 \u2192 Imaj7(center2) \u2192 V7/center3 \u2192 Imaj7(center3) \u2192 V7/center1 \u2192 Imaj7. Any ii\u2013V\u2013I can be expanded into Coltrane changes by splitting the harmonic motion through the major-third triangle. Toggle the Coltrane overlay to see the triangle on the Circle of Fifths.',
      },
      {
        heading: 'Negative Harmony',
        text: 'Negative harmony reflects chords around an axis between the tonic and its fifth. In C, the axis is between E and E\u266d (3.5 semitones from C). Under this reflection: C major becomes C minor, G7 becomes Fm6, Dm becomes B\u266d. Negative harmony preserves functional relationships while transforming chord quality \u2014 a fresh compositional tool.',
      },
    ],
    exercises: [
      {
        type: 'identify-function',
        question: 'In Coltrane changes starting from B, what are the three tonal centers?',
        correctFunction: 'BG#Eb',
        options: ['B, G, E\u266d', 'B, F, D\u266d', 'B, E, A', 'B, G\u266d, D'],
        optionKeys: ['BG#Eb', 'BFDb', 'BEA', 'BGbD'],
        explanation: 'Starting from B, the three centers are B, G (=A\u266d enharmonically, +4 semitones), and E\u266d (+8 semitones). These divide the octave into three equal major thirds. Each center is approached by its V7 chord, creating the rapid key-center movement that defines Coltrane changes.',
      },
      {
        type: 'identify-function',
        question: 'In negative harmony (key of C), what does G7 become?',
        correctFunction: 'Fm',
        options: ['Fm6', 'Dm7', 'B\u266d7', 'A\u266dm'],
        optionKeys: ['Fm', 'Dm7', 'Bb7', 'Abm'],
        explanation: 'In C\u2019s negative harmony, G7 (G-B-D-F) reflects to Fm6 or similar. The axis at 3.5 semitones maps: G\u2192F, B\u2192E\u266d, D\u2192C, F\u2192A\u266d, giving notes F-A\u266d-C-E\u266d which is Fm. The dominant function mirrors to subdominant, preserving the functional gravity.',
      },
      {
        type: 'identify-function',
        question: 'How many tonal centers does a Coltrane substitution use?',
        correctFunction: '3',
        options: ['2', '3', '4', '6'],
        optionKeys: ['2', '3', '4', '6'],
        explanation: 'Coltrane substitutions use 3 tonal centers, evenly spaced by major thirds (4 semitones). This divides the octave into 3 equal parts, just as an augmented triad divides it. The rapid movement through these three keys gives Giant Steps its distinctive kaleidoscopic sound.',
      },
    ],
  },
];
