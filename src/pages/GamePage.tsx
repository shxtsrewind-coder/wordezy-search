import React, { useCallback, useEffect, useState } from "react";
import { Lock, Sparkles, RefreshCw, Flame, Timer as TimerIcon, WifiOff, Award, Lightbulb, Eye } from "lucide-react";
import { Grid } from "../components/Grid.tsx";
import { WordList } from "../components/WordList.tsx";
import { Leaderboard } from "../components/Leaderboard.tsx";
import { AuthModal } from "../components/AuthModal.tsx";
import { Confetti } from "../components/Confetti.tsx";
import { AchievementToastStack } from "../components/AchievementToast.tsx";
import { AchievementsModal } from "../components/AchievementsModal.tsx";
import { getDailyPuzzle, getRandomPuzzle, todayUtc } from "../lib/puzzleOfTheDay.ts";
import { localSave } from "../lib/localSave.ts";
import { submitScore } from "../lib/leaderboard.ts";
import { supabase, ensureSession } from "../lib/supabase.ts";
import { useTimer, formatTime } from "../hooks/useTimer.ts";
import { ACHIEVEMENTS, diffNewlyUnlocked, type Achievement } from "../data/achievements.ts";
import { THEMES } from "../data/wordbank.ts";
import type { Cell, Difficulty } from "../lib/wordsearch.ts";
import { DIFFICULTIES } from "../lib/wordsearch.ts";

type Mode = "daily" | "unlimited";
type Phase = "auth_checking" | "choice" | "ready" | "auth_blocked";

/** Matches the Washington Post / Arkadium word search's own labels — our
 *  internal "classic" id (reused from Classic Unlimited) reads as "Normal"
 *  here. */
const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: "Easy", classic: "Normal", hard: "Hard" };

// Free, limited-use hints — no ad network wired up (Arkadium's "Reveal Word"
// unlocks via a rewarded ad; we don't have one yet), so both are just capped
// per puzzle instead of ad-gated.
const HINT_LETTER_LIMIT = 3;
const HINT_WORD_LIMIT = 1;

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
  const [unlimitedDifficulty, setUnlimitedDifficulty] = useState<Difficulty>(
    () => localSave.get().lastUnlimitedDifficulty
  );
  const [unlimited, setUnlimited] = useState(() => getRandomPuzzle(undefined, unlimitedDifficulty));
  const [foundDaily, setFoundDaily] = useState<Set<string>>(new Set());
  const [foundUnlimited, setFoundUnlimited] = useState<Set<string>>(new Set());
  const [leaderboardKey, setLeaderboardKey] = useState(0);
  const [scoreStatus, setScoreStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [showAchievements, setShowAchievements] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintLettersUsed, setHintLettersUsed] = useState(0);
  const [hintWordsUsed, setHintWordsUsed] = useState(0);
  const [revealedCell, setRevealedCell] = useState<Cell | null>(null);

  // A new daily puzzle resets its own progress and hint allowances — each
  // puzzle gets its own 3 letter reveals + 1 word reveal, not a running
  // total. (There's only ever one daily puzzle per date, so this really
  // only fires once per day; it's here for symmetry with Unlimited below.)
  useEffect(() => {
    setFoundDaily(new Set());
    setHintLettersUsed(0);
    setHintWordsUsed(0);
    setRevealedCell(null);
  }, [daily.date]);

  // Dealing a fresh Classic Unlimited grid (new puzzle, or new difficulty)
  // resets that mode's own progress and hint allowances independently of
  // Daily's, so switching tabs never spuriously burns a hint.
  useEffect(() => {
    setFoundUnlimited(new Set());
    setHintLettersUsed(0);
    setHintWordsUsed(0);
    setRevealedCell(null);
  }, [unlimited.date]);

  const active = mode === "daily" ? daily : unlimited;
  const found = mode === "daily" ? foundDaily : foundUnlimited;
  const setFound = mode === "daily" ? setFoundDaily : setFoundUnlimited;
  const isComplete = found.size === active.puzzle.words.length && active.puzzle.words.length > 0;
  const timerMs = useTimer(`${mode}:${active.date}:${active.difficulty}`, !isComplete && phase === "ready");

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
      const prevUnlocked = save.unlockedAchievements;
      const updated = localSave.recordDailyWin(todayUtc(), daily.themeId, timerMs);
      setSave(updated);

      const newlyUnlockedIds = diffNewlyUnlocked(updated, THEMES.length, prevUnlocked);
      if (newlyUnlockedIds.length > 0) {
        localSave.setUnlockedAchievements([...prevUnlocked, ...newlyUnlockedIds]);
        setNewlyUnlocked(ACHIEVEMENTS.filter((a) => newlyUnlockedIds.includes(a.id)));
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);

      // Guests never created a wordezy_search_profiles row, so the RPC would
      // reject them anyway — skip the call rather than show a failure.
      if (!isAnonymous) {
        setScoreStatus("saving");
        submitScore({ puzzleDate: daily.date, difficulty: daily.difficulty, timeMs })
          .then(() => {
            setScoreStatus("saved");
            setLeaderboardKey((k) => k + 1);
          })
          .catch(() => setScoreStatus("failed"));
      }
    }
  };

  const handleSelectUnlimitedDifficulty = (difficulty: Difficulty) => {
    if (difficulty === unlimitedDifficulty) return;
    setUnlimitedDifficulty(difficulty);
    setSave(localSave.setLastUnlimitedDifficulty(difficulty));
    setUnlimited(getRandomPuzzle(undefined, difficulty));
  };

  /** Flashes the first letter of an unfound word — doesn't mark anything
   *  found, just points at where to look. */
  const handleRevealLetter = () => {
    if (hintLettersUsed >= HINT_LETTER_LIMIT) return;
    const target = active.puzzle.words.find((w) => !found.has(w.word));
    if (!target) return;
    setRevealedCell({ row: target.row, col: target.col });
    setHintLettersUsed((n) => n + 1);
    setTimeout(() => setRevealedCell(null), 1500);
  };

  /** Fully reveals one unfound word, same as finding it by dragging. */
  const handleRevealWord = () => {
    if (hintWordsUsed >= HINT_WORD_LIMIT) return;
    const target = active.puzzle.words.find((w) => !found.has(w.word));
    if (!target) return;
    setHintWordsUsed((n) => n + 1);
    handleWordFound(target.word);
  };

  const newUnlimitedPuzzle = () => {
    setUnlimited(getRandomPuzzle(undefined, unlimitedDifficulty));
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
          {!locked && mode === "daily" && save.bestDailyTimeMs !== null && (
            <div className="text-xs text-muted font-mono" title="Best daily time">
              Best {formatTime(save.bestDailyTimeMs)}
            </div>
          )}
          {save.streak > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-present font-mono">
              <Flame className="w-4 h-4" />
              {save.streak}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAchievements(true)}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-paper transition-colors"
            aria-label="Achievements"
          >
            <Award className="w-4 h-4" />
            {save.unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </button>
        </div>
      </header>

      {showConfetti && <Confetti durationMs={1800} />}
      {newlyUnlocked && newlyUnlocked.length > 0 && (
        <AchievementToastStack achievements={newlyUnlocked} onDone={() => setNewlyUnlocked(null)} />
      )}
      {showAchievements && <AchievementsModal save={save} onClose={() => setShowAchievements(false)} />}

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

      {mode === "unlimited" && !locked && (
        <div className="flex items-center gap-1 p-1 bg-surface border border-rule rounded-lg">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleSelectUnlimitedDifficulty(d)}
              className={`px-3.5 py-1 rounded-md text-xs font-medium transition-colors ${
                unlimitedDifficulty === d ? "bg-present text-ink" : "text-muted hover:text-paper"
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      )}

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
            <Grid puzzle={active.puzzle} foundWords={found} onWordFound={handleWordFound} revealedCell={revealedCell} />
            <div className="w-full sm:w-44 shrink-0 space-y-3">
              <WordList words={active.puzzle.words} found={found} />
              {!isComplete && (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleRevealLetter}
                    disabled={hintLettersUsed >= HINT_LETTER_LIMIT}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-paper disabled:opacity-40 disabled:hover:text-muted transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Reveal letter ({HINT_LETTER_LIMIT - hintLettersUsed} left)
                  </button>
                  <button
                    type="button"
                    onClick={handleRevealWord}
                    disabled={hintWordsUsed >= HINT_WORD_LIMIT}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-paper disabled:opacity-40 disabled:hover:text-muted transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Reveal word ({HINT_WORD_LIMIT - hintWordsUsed} left)
                  </button>
                </div>
              )}
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

          {mode === "daily" && (
            <Leaderboard date={daily.date} difficulty={daily.difficulty} currentPlayerId={userId} refreshKey={leaderboardKey} />
          )}
        </>
      )}
    </div>
  );
};
