// Daily leaderboard — backed by Supabase (project shared with Wordezy, see
// the wordezy_search_scores / wordezy_search_profiles tables). Writes go
// through a SECURITY DEFINER RPC that reads the player's identity and
// display name from the authenticated session itself (auth.uid() +
// wordezy_search_profiles), never from client-supplied values — see the
// migration for the RLS + RPC definitions.
import { supabase } from "./supabase.ts";
import type { Difficulty } from "./wordsearch.ts";

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  timeMs: number;
  isYou: boolean;
}

/** Submits (or improves) the signed-in player's time for a puzzle date +
 *  difficulty. Requires a profile (i.e. a chosen display name) to already
 *  exist — call after the account/guest choice has resolved. Safe to call
 *  even if the new time is worse — the RPC only ever keeps the best. Each
 *  difficulty is tracked separately so the leaderboard stays an apples-to-
 *  apples comparison (an Easy time isn't ranked against a Hard one). */
export async function submitScore(opts: { puzzleDate: string; difficulty: Difficulty; timeMs: number }): Promise<void> {
  const { error } = await supabase.rpc("submit_wordezy_search_score", {
    p_puzzle_date: opts.puzzleDate,
    p_difficulty: opts.difficulty,
    p_time_ms: Math.round(opts.timeMs),
  });
  if (error) throw error;
}

/** Top times for a given day + difficulty, best first. */
export async function getDailyLeaderboard(
  puzzleDate: string,
  difficulty: Difficulty,
  currentPlayerId: string | null,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("wordezy_search_daily_leaderboard", {
    p_puzzle_date: puzzleDate,
    p_difficulty: difficulty,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []).map((row: { player_id: string; display_name: string; time_ms: number }) => ({
    playerId: row.player_id,
    displayName: row.display_name,
    timeMs: row.time_ms,
    isYou: row.player_id === currentPlayerId,
  }));
}

export interface AllTimeLeaderboardEntry {
  playerId: string;
  displayName: string;
  wins: number;
  bestTimeMs: number;
  isYou: boolean;
}

/** All-time standings across every daily puzzle ever played, ranked by total
 *  wins first and best time as the tiebreaker — rewards showing up every day
 *  over a single lucky fast solve. Backed by a plain SECURITY INVOKER
 *  aggregate RPC, since the scores table is already public-readable. */
export async function getAllTimeLeaderboard(
  currentPlayerId: string | null,
  limit = 10
): Promise<AllTimeLeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("wordezy_search_alltime_leaderboard", { p_limit: limit });
  if (error) throw error;
  return (data ?? []).map((row: { player_id: string; display_name: string; wins: number; best_time_ms: number }) => ({
    playerId: row.player_id,
    displayName: row.display_name,
    wins: row.wins,
    bestTimeMs: row.best_time_ms,
    isYou: row.player_id === currentPlayerId,
  }));
}
