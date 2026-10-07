// Local save for what's inherently per-device: the win streak, Classic
// Unlimited unlock flag, and the stats achievements are computed from.
// Identity and leaderboard standing live in Supabase (lib/supabase.ts
// ensureSession + lib/leaderboard.ts) — the cached displayName here is just
// so the header can render before the profile fetch resolves, never the
// source of truth.
import type { Difficulty } from "./wordsearch.ts";

const KEY = "wordezySearch.save.v1";

export type BestTimesByDifficulty = Record<Difficulty, number | null>;

export interface SaveData {
  lastSolvedDate: string | null;
  streak: number;
  unlockedUnlimited: boolean;
  displayName: string | null;
  /** Remembers the player's last-picked daily difficulty across visits. */
  lastDailyDifficulty: Difficulty;
  /** Stats achievements.ts reads — see data/achievements.ts. */
  totalDailyWins: number;
  bestDailyTimeMsByDifficulty: BestTimesByDifficulty;
  maxStreak: number;
  /** Theme ids solved at least once in daily mode. */
  themesCleared: string[];
  unlockedAchievements: string[];
}

const DEFAULTS: SaveData = {
  lastSolvedDate: null,
  streak: 0,
  unlockedUnlimited: false,
  displayName: null,
  lastDailyDifficulty: "classic",
  totalDailyWins: 0,
  bestDailyTimeMsByDifficulty: { easy: null, classic: null, hard: null },
  maxStreak: 0,
  themesCleared: [],
  unlockedAchievements: [],
};

function read(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS, bestDailyTimeMsByDifficulty: { ...DEFAULTS.bestDailyTimeMsByDifficulty } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      bestDailyTimeMsByDifficulty: { ...DEFAULTS.bestDailyTimeMsByDifficulty, ...parsed.bestDailyTimeMsByDifficulty },
    };
  } catch {
    return { ...DEFAULTS, bestDailyTimeMsByDifficulty: { ...DEFAULTS.bestDailyTimeMsByDifficulty } };
  }
}

function write(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
}

/** Fastest daily time across any difficulty — what the speed achievements
 *  (data/achievements.ts) check against. */
export function bestDailyTimeMsOverall(save: SaveData): number | null {
  const times = Object.values(save.bestDailyTimeMsByDifficulty).filter((t): t is number => t !== null);
  return times.length ? Math.min(...times) : null;
}

export const localSave = {
  get: read,

  /** Records a daily win's streak, stats, theme coverage, and per-difficulty
   *  best time. The streak/total-wins count once per calendar day (picking
   *  a second difficulty the same day still improves that difficulty's best
   *  time, but isn't a second "win" for streak purposes). */
  recordDailyWin(date: string, difficulty: Difficulty, themeId: string, timeMs: number): SaveData {
    const data = read();
    const bestForDifficulty = data.bestDailyTimeMsByDifficulty[difficulty];
    data.bestDailyTimeMsByDifficulty = {
      ...data.bestDailyTimeMsByDifficulty,
      [difficulty]: bestForDifficulty === null ? timeMs : Math.min(bestForDifficulty, timeMs),
    };
    if (!data.themesCleared.includes(themeId)) data.themesCleared = [...data.themesCleared, themeId];
    data.lastDailyDifficulty = difficulty;

    if (data.lastSolvedDate !== date) {
      const yesterday = new Date(Date.parse(date + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
      data.streak = data.lastSolvedDate === yesterday ? data.streak + 1 : 1;
      data.lastSolvedDate = date;
      data.maxStreak = Math.max(data.maxStreak, data.streak);
      data.totalDailyWins += 1;
    }
    write(data);
    return data;
  },

  setLastDailyDifficulty(difficulty: Difficulty): SaveData {
    const data = read();
    data.lastDailyDifficulty = difficulty;
    write(data);
    return data;
  },

  setUnlockedAchievements(ids: string[]): SaveData {
    const data = read();
    data.unlockedAchievements = ids;
    write(data);
    return data;
  },

  /** Placeholder until a real payment processor is wired up — never call
   *  this from anywhere except a confirmed, server-verified purchase once
   *  that exists. */
  setUnlocked(value: boolean): SaveData {
    const data = read();
    data.unlockedUnlimited = value;
    write(data);
    return data;
  },

  setDisplayName(name: string): SaveData {
    const data = read();
    data.displayName = name.trim().slice(0, 20) || null;
    write(data);
    return data;
  },
};
