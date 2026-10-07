import React, { useEffect, useState } from "react";
import { Trophy, CalendarDays } from "lucide-react";
import {
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  type LeaderboardEntry,
  type AllTimeLeaderboardEntry,
} from "../lib/leaderboard.ts";
import { formatTime } from "../hooks/useTimer.ts";
import type { Difficulty } from "../lib/wordsearch.ts";

type Tab = "today" | "alltime";

export const Leaderboard: React.FC<{
  date: string;
  difficulty: Difficulty;
  currentPlayerId: string | null;
  refreshKey: number;
}> = ({ date, difficulty, currentPlayerId, refreshKey }) => {
  const [tab, setTab] = useState<Tab>("today");
  const [dailyEntries, setDailyEntries] = useState<LeaderboardEntry[] | null>(null);
  const [allTimeEntries, setAllTimeEntries] = useState<AllTimeLeaderboardEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setDailyEntries(null);
    getDailyLeaderboard(date, difficulty, currentPlayerId)
      .then((rows) => { if (!cancelled) setDailyEntries(rows); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [date, difficulty, currentPlayerId, refreshKey]);

  useEffect(() => {
    if (tab !== "alltime" || allTimeEntries !== null) return;
    let cancelled = false;
    getAllTimeLeaderboard(currentPlayerId)
      .then((rows) => { if (!cancelled) setAllTimeEntries(rows); })
      .catch(() => { /* all-time stays empty — today's tab still works */ });
    return () => { cancelled = true; };
  }, [tab, currentPlayerId, allTimeEntries]);

  // A new score just landed (refreshKey bumped) — the all-time standings are
  // now stale, so drop the cache and let the effect above refetch next visit.
  useEffect(() => {
    setAllTimeEntries(null);
  }, [refreshKey]);

  if (failed) return null; // no backend reachable — leaderboard quietly stays hidden

  return (
    <div className="w-full max-w-sm bg-surface border border-rule rounded-xl p-4 mt-2">
      <div className="flex items-center gap-1 mb-3">
        <button
          type="button"
          onClick={() => setTab("today")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            tab === "today" ? "bg-correct-soft text-correct" : "text-muted hover:text-paper"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Today · {difficulty === "classic" ? "Normal" : difficulty[0].toUpperCase() + difficulty.slice(1)}
        </button>
        <button
          type="button"
          onClick={() => setTab("alltime")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            tab === "alltime" ? "bg-correct-soft text-correct" : "text-muted hover:text-paper"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          All-Time
        </button>
      </div>

      {tab === "today" ? (
        dailyEntries === null ? null : dailyEntries.length === 0 ? (
          <p className="text-sm text-muted">No times yet today — be the first.</p>
        ) : (
          <ol className="space-y-1">
            {dailyEntries.map((entry, i) => (
              <li
                key={entry.playerId}
                className={`flex items-center justify-between text-sm font-mono px-2 py-1 rounded-md ${
                  entry.isYou ? "bg-correct-soft text-correct" : "text-paper/80"
                }`}
              >
                <span>
                  {i + 1}. {entry.displayName}
                  {entry.isYou ? " (you)" : ""}
                </span>
                <span>{formatTime(entry.timeMs)}</span>
              </li>
            ))}
          </ol>
        )
      ) : allTimeEntries === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : allTimeEntries.length === 0 ? (
        <p className="text-sm text-muted">No wins recorded yet — be the first.</p>
      ) : (
        <ol className="space-y-1">
          {allTimeEntries.map((entry, i) => (
            <li
              key={entry.playerId}
              className={`flex items-center justify-between text-sm font-mono px-2 py-1 rounded-md ${
                entry.isYou ? "bg-correct-soft text-correct" : "text-paper/80"
              }`}
            >
              <span>
                {i + 1}. {entry.displayName}
                {entry.isYou ? " (you)" : ""}
              </span>
              <span className="text-right">
                {entry.wins} win{entry.wins === 1 ? "" : "s"}
                <span className="text-muted"> · {formatTime(entry.bestTimeMs)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
