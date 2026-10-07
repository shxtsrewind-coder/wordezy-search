// Achievement definitions. Pure and local-stats-driven for this pass — they
// read off the same per-device SaveData the streak already lives in, not a
// server record, so unlocking one doesn't require an account. A natural
// next step if this needs to follow a player across devices: move
// `unlockedAchievements` into the wordezy_search_profiles row instead.
import { bestDailyTimeMsOverall, type SaveData } from "../lib/localSave.ts";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** lucide-react icon name, resolved by the component that renders these. */
  icon: "Star" | "Flame" | "Zap" | "Gauge" | "Compass" | "Trophy";
  /** `themeCount` is only meaningful for "explorer"; every check gets it so
   *  the signature stays uniform. */
  isUnlocked: (save: SaveData, themeCount: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    title: "First Find",
    description: "Solve your first daily puzzle.",
    icon: "Star",
    isUnlocked: (s) => s.totalDailyWins >= 1,
  },
  {
    id: "streak_3",
    title: "On a Roll",
    description: "Reach a 3-day streak.",
    icon: "Flame",
    isUnlocked: (s) => s.maxStreak >= 3,
  },
  {
    id: "streak_7",
    title: "Week Streak",
    description: "Reach a 7-day streak.",
    icon: "Flame",
    isUnlocked: (s) => s.maxStreak >= 7,
  },
  {
    id: "streak_30",
    title: "Unstoppable",
    description: "Reach a 30-day streak.",
    icon: "Flame",
    isUnlocked: (s) => s.maxStreak >= 30,
  },
  {
    id: "speed_90",
    title: "Speed Demon",
    description: "Solve a daily puzzle in under 90 seconds.",
    icon: "Gauge",
    isUnlocked: (s) => {
      const best = bestDailyTimeMsOverall(s);
      return best !== null && best < 90_000;
    },
  },
  {
    id: "speed_60",
    title: "Lightning Fast",
    description: "Solve a daily puzzle in under 60 seconds.",
    icon: "Zap",
    isUnlocked: (s) => {
      const best = bestDailyTimeMsOverall(s);
      return best !== null && best < 60_000;
    },
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Solve a daily puzzle in every theme.",
    icon: "Compass",
    isUnlocked: (s, themeCount) => s.themesCleared.length >= themeCount,
  },
  {
    id: "dedicated_25",
    title: "Dedicated",
    description: "Solve 25 daily puzzles.",
    icon: "Trophy",
    isUnlocked: (s) => s.totalDailyWins >= 25,
  },
];

/** Returns the ids of achievements newly true in `save` that weren't
 *  already recorded as unlocked. */
export function diffNewlyUnlocked(save: SaveData, themeCount: number, prevUnlockedIds: string[]): string[] {
  const prev = new Set(prevUnlockedIds);
  return ACHIEVEMENTS.filter((a) => !prev.has(a.id) && a.isUnlocked(save, themeCount)).map((a) => a.id);
}
