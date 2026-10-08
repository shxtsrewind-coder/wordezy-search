import { THEMES } from "../data/wordbank.ts";
import { makeRng } from "./rng.ts";
import { generatePuzzle, sizeForWords, type Puzzle, type Difficulty } from "./wordsearch.ts";

const WORDS_PER_PUZZLE = 10;
// Dropping from 12 to 10 words would otherwise shrink the grid (size scales
// with total letter count) — this floor keeps the board the same size as
// before, just a little less crowded.
const GRID_SIZE_FLOOR = 11;
// Daily is always the hardest setting — it's the one puzzle everyone is
// racing on the same leaderboard, so there's no picking an easier board to
// climb it. Difficulty choice lives in Classic Unlimited instead.
const DAILY_DIFFICULTY: Difficulty = "hard";

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickWords(allWords: string[], count: number, rng: () => number): string[] {
  const pool = [...allWords];
  const picked: string[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = Math.floor(rng() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export interface DailyPuzzle {
  date: string;
  difficulty: Difficulty;
  themeId: string;
  themeLabel: string;
  puzzle: Puzzle;
}

/**
 * One puzzle per UTC day, identical for every player — same idea as
 * Wordezy's daily word: the date is the only input, so there's nothing to
 * fetch or agree on with a server. Always generated on Hard, since the
 * daily leaderboard is one shared ranking rather than one per difficulty.
 */
export function getDailyPuzzle(date: string = todayUtc()): DailyPuzzle {
  const difficulty = DAILY_DIFFICULTY;
  const rng = makeRng(`daily:${date}`);
  const theme = THEMES[Math.floor(rng() * THEMES.length)];
  const words = pickWords(theme.words, WORDS_PER_PUZZLE, rng);
  const size = Math.max(sizeForWords(words, difficulty), GRID_SIZE_FLOOR);
  const puzzle = generatePuzzle(words, size, `daily:${date}:${difficulty}`, difficulty);
  return { date, difficulty, themeId: theme.id, themeLabel: theme.label, puzzle };
}

/**
 * Classic Unlimited: a fresh, non-deterministic puzzle every time it's
 * called — the paid mode's whole value is "as many as you want," so unlike
 * the daily puzzle this is seeded from the current instant, not the date.
 */
export function getRandomPuzzle(themeId?: string, difficulty: Difficulty = "hard"): DailyPuzzle {
  const theme = themeId ? THEMES.find((t) => t.id === themeId) ?? THEMES[0] : THEMES[Math.floor(Math.random() * THEMES.length)];
  const seed = `random:${Date.now()}:${Math.random()}`;
  const rng = makeRng(seed);
  const words = pickWords(theme.words, WORDS_PER_PUZZLE, rng);
  const size = Math.max(sizeForWords(words, difficulty), GRID_SIZE_FLOOR);
  const puzzle = generatePuzzle(words, size, seed, difficulty);
  return { date: seed, difficulty, themeId: theme.id, themeLabel: theme.label, puzzle };
}
