import { THEMES } from "../data/wordbank.ts";
import { makeRng } from "./rng.ts";
import { generatePuzzle, sizeForWords, type Puzzle } from "./wordsearch.ts";

const WORDS_PER_PUZZLE = 8;

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
  themeLabel: string;
  puzzle: Puzzle;
}

/**
 * One puzzle per UTC day, identical for every player — same idea as
 * Wordezy's daily word: the date is the only input, so there's nothing to
 * fetch or agree on with a server.
 */
export function getDailyPuzzle(date: string = todayUtc()): DailyPuzzle {
  const rng = makeRng(`daily:${date}`);
  const theme = THEMES[Math.floor(rng() * THEMES.length)];
  const words = pickWords(theme.words, WORDS_PER_PUZZLE, rng);
  const size = sizeForWords(words);
  const puzzle = generatePuzzle(words, size, `daily:${date}`);
  return { date, themeLabel: theme.label, puzzle };
}

/**
 * Classic Unlimited: a fresh, non-deterministic puzzle every time it's
 * called — the paid mode's whole value is "as many as you want," so unlike
 * the daily puzzle this is seeded from the current instant, not the date.
 */
export function getRandomPuzzle(themeId?: string): DailyPuzzle {
  const theme = themeId ? THEMES.find((t) => t.id === themeId) ?? THEMES[0] : THEMES[Math.floor(Math.random() * THEMES.length)];
  const seed = `random:${Date.now()}:${Math.random()}`;
  const rng = makeRng(seed);
  const words = pickWords(theme.words, WORDS_PER_PUZZLE, rng);
  const size = sizeForWords(words);
  const puzzle = generatePuzzle(words, size, seed);
  return { date: seed, themeLabel: theme.label, puzzle };
}
