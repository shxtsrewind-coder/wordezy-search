// Daily leaderboard — backed by Supabase (project shared with Wordezy, see
// the wordezy_search_scores table). Writes go through a SECURITY DEFINER
// RPC, never direct table inserts, so a player can only ever submit or
// improve their own time for a given day (see the migration for the RLS +
// RPC definition).
import { supabase } from "./supabase.ts";

export interface LeaderboardEntry {
  displayName: string;
  timeMs: number;
  isYou: boolean;
}

/** Submits (or improves) this player's time for a puzzle date. Safe to call
 *  even if the player's new time is worse — the RPC only ever keeps the
 *  best. */
export async function submitScore(opts: {
  playerId: string;
  displayName: string;
  puzzleDate: string;
  timeMs: number;
}): Promise<void> {
  const { error } = await supabase.rpc("submit_wordezy_search_score", {
    p_player_id: opts.playerId,
    p_display_name: opts.displayName,
    p_puzzle_date: opts.puzzleDate,
    p_time_ms: Math.round(opts.timeMs),
  });
  if (error) throw error;
}

/** Top times for a given day, best first. */
export async function getDailyLeaderboard(
  puzzleDate: string,
  playerId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("wordezy_search_scores")
    .select("player_id, display_name, time_ms")
    .eq("puzzle_date", puzzleDate)
    .order("time_ms", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    displayName: row.display_name,
    timeMs: row.time_ms,
    isYou: row.player_id === playerId,
  }));
}
