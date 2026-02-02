/**
 * Arpeggiation pattern definitions.
 * Each pattern takes a chord voicing (sorted MIDI notes) and returns
 * an ordered sequence of notes to play as an arpeggio.
 */

export type ArpPatternName = 'block' | 'up' | 'down' | 'upDown' | 'random' | 'alberti';

export interface ArpPattern {
  name: string;
  /** Generate note sequence from a voicing. Returns array of MIDI note arrays (each sub-array plays simultaneously). */
  generate: (voicing: number[]) => number[][];
}

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const ARP_PATTERNS: Record<ArpPatternName, ArpPattern> = {
  block: {
    name: 'Block',
    generate: (voicing) => [voicing],
  },
  up: {
    name: 'Up',
    generate: (voicing) => {
      const sorted = [...voicing].sort((a, b) => a - b);
      return sorted.map(n => [n]);
    },
  },
  down: {
    name: 'Down',
    generate: (voicing) => {
      const sorted = [...voicing].sort((a, b) => b - a);
      return sorted.map(n => [n]);
    },
  },
  upDown: {
    name: 'Up-Down',
    generate: (voicing) => {
      const sorted = [...voicing].sort((a, b) => a - b);
      if (sorted.length <= 1) return sorted.map(n => [n]);
      const down = sorted.slice(1, -1).reverse();
      return [...sorted, ...down].map(n => [n]);
    },
  },
  random: {
    name: 'Random',
    generate: (voicing) => shuffled(voicing).map(n => [n]),
  },
  alberti: {
    name: 'Alberti',
    generate: (voicing) => {
      const sorted = [...voicing].sort((a, b) => a - b);
      if (sorted.length < 3) return sorted.map(n => [n]);
      // Classic alberti bass: low, high, mid, high
      const [low, mid, high] = [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
      return [[low], [high], [mid], [high]];
    },
  },
};

export const ARP_PATTERN_NAMES: ArpPatternName[] = ['block', 'up', 'down', 'upDown', 'random', 'alberti'];
