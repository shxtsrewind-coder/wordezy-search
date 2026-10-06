// Word search grid generation — the one piece of this game with no off-the-shelf
// answer. Places words along one of 8 directions with overlap allowed (so
// grids feel dense and hand-made rather than sparse), retries on collision,
// and fills the gaps with frequency-weighted random letters.
import { makeRng } from "./rng.ts";

export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dRow: number;
  dCol: number;
}

export interface Puzzle {
  size: number;
  grid: string[][];
  words: PlacedWord[];
}

// 8 compass directions as (dRow, dCol) unit steps, split by axis so callers
// can weight how often diagonals get first crack at a placement slot.
const STRAIGHT_DIRECTIONS: Array<[number, number]> = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];
const DIAGONAL_DIRECTIONS: Array<[number, number]> = [
  [1, 1], [1, -1], [-1, -1], [-1, 1],
];
const DIRECTIONS: Array<[number, number]> = [...STRAIGHT_DIRECTIONS, ...DIAGONAL_DIRECTIONS];

/** How hard the grid leans on diagonal/backward placements. */
export type Difficulty = "easy" | "classic" | "hard";

interface DifficultyTuning {
  /** How many copies of the diagonal directions go into the shuffle bag,
   *  per 1 copy of each straight direction — higher skews placement toward
   *  diagonals. Every direction vector already reads in both senses (e.g.
   *  [0,1] and [0,-1] are both in the pool), so biasing which vector wins a
   *  slot is what makes more words read backward/diagonal, without needing
   *  a separate "reverse" step. */
  diagonalWeight: number;
}

const DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  easy: { diagonalWeight: 1 },
  classic: { diagonalWeight: 2.5 },
  hard: { diagonalWeight: 4 },
};

function directionBag(rng: () => number, tuning: DifficultyTuning): Array<[number, number]> {
  const bag: Array<[number, number]> = [...STRAIGHT_DIRECTIONS];
  const diagonalCopies = Math.max(1, Math.round(tuning.diagonalWeight));
  for (let i = 0; i < diagonalCopies; i++) bag.push(...DIAGONAL_DIRECTIONS);
  return bag.sort(() => rng() - 0.5);
}

// Rough English letter frequency, so filler cells don't scream "random noise"
// next to real words and the grid stays readable at a glance.
const LETTER_WEIGHTS: Array<[string, number]> = [
  ["e", 12.7], ["t", 9.1], ["a", 8.2], ["o", 7.5], ["i", 7.0], ["n", 6.7],
  ["s", 6.3], ["h", 6.1], ["r", 6.0], ["d", 4.3], ["l", 4.0], ["c", 2.8],
  ["u", 2.8], ["m", 2.4], ["w", 2.4], ["f", 2.2], ["g", 2.0], ["y", 2.0],
  ["p", 1.9], ["b", 1.5], ["v", 1.0], ["k", 0.8], ["j", 0.15], ["x", 0.15],
  ["q", 0.1], ["z", 0.07],
];
const LETTER_TABLE = LETTER_WEIGHTS.flatMap(([ch, w]) => Array(Math.round(w * 4)).fill(ch));

function randomLetter(rng: () => number): string {
  return LETTER_TABLE[Math.floor(rng() * LETTER_TABLE.length)].toUpperCase();
}

function fits(grid: (string | null)[][], size: number, word: string, row: number, col: number, dRow: number, dCol: number): boolean {
  for (let i = 0; i < word.length; i++) {
    const r = row + dRow * i;
    const c = col + dCol * i;
    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    const existing = grid[r][c];
    if (existing !== null && existing !== word[i]) return false;
  }
  return true;
}

function place(grid: (string | null)[][], word: string, row: number, col: number, dRow: number, dCol: number): void {
  for (let i = 0; i < word.length; i++) {
    grid[row + dRow * i][col + dCol * i] = word[i];
  }
}

/**
 * Builds a puzzle. `size` should comfortably fit the longest word; callers
 * size the grid off the word list (see sizeForWords below). Deterministic
 * for a given seed + word list, so the same inputs always produce the same
 * grid — that's what makes the daily puzzle shareable without a server.
 */
export function generatePuzzle(words: string[], size: number, seed: string, difficulty: Difficulty = "classic"): Puzzle {
  const rng = makeRng(seed);
  const tuning = DIFFICULTY_TUNING[difficulty];
  const upper = words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""));
  // Longest-first: big words are the hardest to place, so give them first pick
  // of the grid while it's still empty.
  const ordered = [...upper].sort((a, b) => b.length - a.length);

  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const placed: PlacedWord[] = [];

  for (const word of ordered) {
    if (word.length > size) continue; // caller sized the grid wrong; skip rather than crash
    const dirOrder = directionBag(rng, tuning);
    let done = false;
    for (let attempt = 0; attempt < 200 && !done; attempt++) {
      const dir = dirOrder[attempt % dirOrder.length];
      const row = Math.floor(rng() * size);
      const col = Math.floor(rng() * size);
      if (fits(grid, size, word, row, col, dir[0], dir[1])) {
        place(grid, word, row, col, dir[0], dir[1]);
        placed.push({ word, row, col, dRow: dir[0], dCol: dir[1] });
        done = true;
      }
    }
    // A handful of long/awkward words may fail to place in a crowded grid —
    // callers should size the grid generously enough that this is rare, and
    // the puzzle still works fine with the words that did place.
  }

  const filled: string[][] = grid.map((row) => row.map((cell) => cell ?? randomLetter(rng)));
  return { size, grid: filled, words: placed };
}

/** Picks a grid size with enough headroom for the longest word and the word count.
 *  A denser multiplier at harder difficulties packs more overlap and makes
 *  diagonals more likely to actually fit, instead of just being requested. */
export function sizeForWords(words: string[], difficulty: Difficulty = "classic"): number {
  const density: Record<Difficulty, number> = { easy: 2.2, classic: 1.8, hard: 1.5 };
  const longest = Math.max(...words.map((w) => w.length));
  const base = Math.ceil(Math.sqrt(words.reduce((sum, w) => sum + w.length, 0) * density[difficulty]));
  return Math.max(longest + 1, base, 10);
}

export interface Cell {
  row: number;
  col: number;
}

/** A straight line (possibly reversed) matches a placed word either forward or backward. */
export function matchSelection(selection: Cell[], puzzle: Puzzle): PlacedWord | null {
  if (selection.length < 2) return null;
  const a = selection[0];
  const b = selection[1];
  const dRow = Math.sign(b.row - a.row);
  const dCol = Math.sign(b.col - a.col);
  for (let i = 1; i < selection.length; i++) {
    const expected = { row: a.row + dRow * i, col: a.col + dCol * i };
    if (selection[i].row !== expected.row || selection[i].col !== expected.col) return null;
  }
  for (const pw of puzzle.words) {
    const endRow = pw.row + pw.dRow * (pw.word.length - 1);
    const endCol = pw.col + pw.dCol * (pw.word.length - 1);
    const forward = pw.row === a.row && pw.col === a.col && pw.dRow === dRow && pw.dCol === dCol && selection.length === pw.word.length;
    const backward = endRow === a.row && endCol === a.col && pw.dRow === -dRow && pw.dCol === -dCol && selection.length === pw.word.length;
    if (forward || backward) return pw;
  }
  return null;
}
