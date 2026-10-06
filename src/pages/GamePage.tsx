import React, { useMemo, useState } from "react";
import { Lock, Sparkles, RefreshCw, Flame } from "lucide-react";
import { Grid } from "../components/Grid.tsx";
import { WordList } from "../components/WordList.tsx";
import { getDailyPuzzle, getRandomPuzzle, todayUtc } from "../lib/puzzleOfTheDay.ts";
import { localSave } from "../lib/localSave.ts";

type Mode = "daily" | "unlimited";

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
  const [mode, setMode] = useState<Mode>("daily");
  const [save, setSave] = useState(() => localSave.get());
  const [daily] = useState(() => getDailyPuzzle());
  const [unlimited, setUnlimited] = useState(() => getRandomPuzzle());
  const [foundDaily, setFoundDaily] = useState<Set<string>>(new Set());
  const [foundUnlimited, setFoundUnlimited] = useState<Set<string>>(new Set());

  const active = mode === "daily" ? daily : unlimited;
  const found = mode === "daily" ? foundDaily : foundUnlimited;
  const setFound = mode === "daily" ? setFoundDaily : setFoundUnlimited;
  const isComplete = found.size === active.puzzle.words.length && active.puzzle.words.length > 0;

  const handleWordFound = (word: string) => {
    const next = new Set(found);
    next.add(word);
    setFound(next);
    if (mode === "daily" && next.size === daily.puzzle.words.length) {
      setSave(localSave.recordDailyWin(todayUtc()));
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

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center px-4 py-6 gap-5">
      <header className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <WordmarkTiles />
          <h1 className="font-display font-semibold text-lg">Wordezy Search</h1>
        </div>
        {save.streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-present font-mono">
            <Flame className="w-4 h-4" />
            {save.streak}
          </div>
        )}
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
              <p className="text-correct text-sm font-medium mt-1">All found! Nice work.</p>
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
        </>
      )}
    </div>
  );
};
