import React, { useCallback, useEffect, useState } from "react";
import { Lock, Sparkles, RefreshCw, Flame, Timer as TimerIcon, WifiOff } from "lucide-react";
import { Grid } from "../components/Grid.tsx";
import { WordList } from "../components/WordList.tsx";
import { Leaderboard } from "../components/Leaderboard.tsx";
import { AuthModal } from "../components/AuthModal.tsx";
import { getDailyPuzzle, getRandomPuzzle, todayUtc } from "../lib/puzzleOfTheDay.ts";
import { localSave } from "../lib/localSave.ts";
import { submitScore } from "../lib/leaderboard.ts";
import { supabase, ensureSession } from "../lib/supabase.ts";
import { useTimer, formatTime } from "../hooks/useTimer.ts";

type Mode = "daily" | "unlimited";
type Phase = "auth_checking" | "choice" | "ready" | "auth_blocked";

/** Shown once per browser session — a returning guest who already chose
 *  isn't re-prompted on every reload, only on a fresh session. */
const PLAY_CHOICE_KEY = "wordezySearch.playChoice";

const WordmarkTiles: React.FC = () => (
  <div className="flex items-center gap-1">
    {["W", "O", "R", "D"].map((letter, i) => (
      <span
        key={i}
        className={`w-6 h-6 rounded-[4px] flex items-center justify-center font-display font-semibold text-[11px] ${
          i % 2 === 0 ? "bg-correct text-ink" : "bg-present text-ink"
        }`}
      >
        {letter}
      </span>
    ))}
  </div>
);

export const GamePage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("auth_checking");
  const [authBlockedReason, setAuthBlockedReason] = useState<"anonymous_disabled" | "unknown">("unknown");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState("Player");

  const [mode, setMode] = useState<Mode>("daily");
  const [save, setSave] = useState(() => localSave.get());
  const [daily] = useState(() => getDailyPuzzle());
  const [unlimited, setUnlimited] = useState(() => getRandomPuzzle());
  const [foundDaily, setFoundDaily] = useState<Set<string>>(new Set());
  const [foundUnlimited, setFoundUnlimited] = useState<Set<string>>(new Set());
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [scoreStatus, setScoreStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  const active = mode === "daily" ? daily : unlimited;
  const found = mode === "daily" ? foundDaily : foundUnlimited;
  const setFound = mode === "daily" ? setFoundDaily : setFoundUnlimited;
  const isComplete = found.size === active.puzzle.words.length && active.puzzle.words.length > 0;
  const timerMs = useTimer(`${mode}:${active.date}`, !isComplete && phase === "ready");

  const bootAuth = useCallback(async () => {
    setPhase("auth_checking");
    try {
      const session = await ensureSession();
      if (!session.ok) {
        setAuthBlockedReason(session.reason || "unknown");
        setPhase("auth_blocked");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      const anon = userData.user?.is_anonymous ?? true;
      setUserId(uid);
      setIsAnonymous(anon);

      if (uid) {
        const { data: profileRow } = await supabase
          .from("wordezy_search_profiles")
          .select("display_name")
          .eq("id", uid)
          .maybeSingle();
        if (profileRow?.display_name) setDisplayName(profileRow.display_name);
      }

      const choiceDone = typeof window !== "undefined" && sessionStorage.getItem(PLAY_CHOICE_KEY) === "true";
      setPhase(!anon || choiceDone ? "ready" : "choice");
    } catch (err) {
      console.error("Failed to establish session:", err);
      setAuthBlockedReason("unknown");
      setPhase("auth_blocked");
    }
  }, []);

  useEffect(() => {
    bootAuth();
  }, [bootAuth]);

  const handleAuthResolved = useCallback((opts: { isAnonymous: boolean; displayName?: string }) => {
    if (typeof window !== "undefined") sessionStorage.setItem(PLAY_CHOICE_KEY, "true");
    setIsAnonymous(opts.isAnonymous);
    if (opts.displayName) setDisplayName(opts.displayName);
    setPhase("ready");
  }, []);

  const handleWordFound = (word: string) => {
    const next = new Set(found);
    next.add(word);
    setFound(next);
    if (mode === "daily" && next.size === daily.puzzle.words.length) {
      setSave(localSave.recordDailyWin(todayUtc()));
      // Guests never created a wordezy_search_profiles row, so the RPC would
      // reject them anyway — skip the call rather than show a failure.
      if (!isAnonymous) {
        setScoreStatus("saving");
        submitScore({ puzzleDate: daily.date, timeMs })
          .then(() => {
            setScoreStatus("saved");
            setLeaderboardKey((k) => k + 1);
          })
          .catch(() => setScoreStatus("failed"));
      }
    }
  };

  const newUnlimitedPuzzle = () => {
    setUnlimited(getRandomPuzzle());
    setFoundUnlimited(new Set());
  };

  const handleUnlock = () => {
    // Stub — no payment processor wired up yet. Replace with a real
    // server-verified purchase flow before this ever ships.
    alert("Payments aren't set up yet — Classic Unlimited will unlock for $2 once that's wired in.");
  };

  const locked = mode === "unlimited" && !save.unlockedUnlimited;

  if (phase === "auth_checking") {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <WordmarkTiles />
      </div>
    );
  }

  if (phase === "auth_blocked") {
    return (
      <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center gap-4 px-4 text-center">
        <WifiOff className="w-8 h-8 text-danger" />
        <p className="text-sm text-muted max-w-xs">
          {authBlockedReason === "anonymous_disabled"
            ? "Guest play is temporarily unavailable for this game. Please try again shortly."
            : "Couldn't connect right now. Check your connection and try again."}
        </p>
        <button
          type="button"
          onClick={bootAuth}
          className="px-4 py-2 rounded-md bg-correct hover:bg-correct-dim text-paper text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (phase === "choice") {
    return <AuthModal currentDisplayName={displayName} onResolved={handleAuthResolved} />;
  }

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center px-4 py-6 gap-5">
      <header className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WordmarkTiles />
          <h1 className="font-display font-semibold text-lg">Wordezy Search</h1>
        </div>
        <div className="flex items-center gap-3">
          {!locked && (
            <div className="flex items-center gap-1.5 text-sm text-paper/80 font-mono">
              <TimerIcon className="w-4 h-4" />
              {formatTime(timerMs)}
            </div>
          )}
          {save.streak > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-present font-mono">
              <Flame className="w-4 h-4" />
              {save.streak}
            </div>
          )}
        </div>
      </header>

      <div className="flex items-center gap-1 p-1 bg-surface border border-rule rounded-lg">
        <button
          type="button"
          onClick={() => setMode("daily")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "daily" ? "bg-correct text-paper" : "text-muted hover:text-paper"
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setMode("unlimited")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "unlimited" ? "bg-correct text-paper" : "text-muted hover:text-paper"
          }`}
        >
          {!save.unlockedUnlimited && <Lock className="w-3.5 h-3.5" />}
          Classic Unlimited
        </button>
      </div>

      {locked ? (
        <div className="w-full max-w-sm bg-surface border border-rule rounded-xl p-6 text-center space-y-4 mt-6">
          <div className="w-12 h-12 rounded-full bg-present-soft border border-present-dim/50 flex items-center justify-center text-present mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Classic Unlimited</h2>
            <p className="text-sm text-muted mt-1.5">
              Unlock endless puzzles across every theme — no daily limit, play as many as you want, whenever you want.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            className="w-full py-2.5 px-4 rounded-md bg-correct hover:bg-correct-dim text-paper font-medium text-sm transition-colors"
          >
            Unlock for $2
          </button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-xs font-mono text-muted uppercase tracking-wide">{active.themeLabel}</p>
            {isComplete && (
              <p className="text-correct text-sm font-medium mt-1">
                Solved in {formatTime(timerMs)}
                {mode === "daily" && isAnonymous ? " — sign in to join the leaderboard" : ""}
                {mode === "daily" && scoreStatus === "failed" ? " — saved locally, leaderboard unreachable" : ""}
              </p>
            )}
          </div>

          <div className="w-full max-w-3xl flex flex-col sm:flex-row items-start justify-center gap-5">
            <Grid puzzle={active.puzzle} foundWords={found} onWordFound={handleWordFound} />
            <div className="w-full sm:w-44 shrink-0">
              <WordList words={active.puzzle.words} found={found} />
            </div>
          </div>

          {mode === "unlimited" && (
            <button
              type="button"
              onClick={newUnlimitedPuzzle}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New puzzle
            </button>
          )}

          {mode === "daily" && <Leaderboard date={daily.date} currentPlayerId={userId} refreshKey={leaderboardKey} />}
        </>
      )}
    </div>
  );
};
