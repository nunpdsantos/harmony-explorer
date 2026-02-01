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
];
