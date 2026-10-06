import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { getDailyLeaderboard, type LeaderboardEntry } from "../lib/leaderboard.ts";
import { formatTime } from "../hooks/useTimer.ts";

export const Leaderboard: React.FC<{ date: string; currentPlayerId: string | null; refreshKey: number }> = ({
  date,
  currentPlayerId,
  refreshKey,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    getDailyLeaderboard(date, currentPlayerId)
      .then((rows) => { if (!cancelled) setEntries(rows); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [date, currentPlayerId, refreshKey]);

  if (failed) return null; // no backend reachable — leaderboard quietly stays hidden
  if (!entries) return null;

  return (
    <div className="w-full max-w-sm bg-surface border border-rule rounded-xl p-4 mt-2">
      <div className="flex items-center gap-1.5 text-sm font-medium text-present mb-2">
        <Trophy className="w-4 h-4" />
        Today's fastest
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted">No times yet today — be the first.</p>
      ) : (
        <ol className="space-y-1">
          {entries.map((entry, i) => (
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
      )}
    </div>
  );
};
