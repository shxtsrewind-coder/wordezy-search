import React, { useCallback, useRef, useState } from "react";
import type { Cell, Puzzle } from "../lib/wordsearch.ts";
import { matchSelection } from "../lib/wordsearch.ts";

interface GridProps {
  puzzle: Puzzle;
  foundWords: Set<string>;
  onWordFound: (word: string) => void;
}

/** Straight-line path from `from` to `to`, snapped to one of the 8
 *  directions — so a slightly wobbly drag still reads as a clean line. */
function pathBetween(from: Cell, to: Cell): Cell[] {
  const dRow = Math.sign(to.row - from.row);
  const dCol = Math.sign(to.col - from.col);
  const steps = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));
  const path: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push({ row: from.row + dRow * i, col: from.col + dCol * i });
  }
  return path;
}

export const Grid: React.FC<GridProps> = ({ puzzle, foundWords, onWordFound }) => {
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [selection, setSelection] = useState<Cell[]>([]);
  const dragging = useRef(false);

  const foundCells = new Set<string>();
  for (const pw of puzzle.words) {
    if (!foundWords.has(pw.word)) continue;
    for (let i = 0; i < pw.word.length; i++) {
      foundCells.add(`${pw.row + pw.dRow * i},${pw.col + pw.dCol * i}`);
    }
  }
  const selectedCells = new Set(selection.map((c) => `${c.row},${c.col}`));

  const cellFromPoint = useCallback((clientX: number, clientY: number): Cell | null => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const row = el?.dataset?.row;
    const col = el?.dataset?.col;
    if (row == null || col == null) return null;
    return { row: Number(row), col: Number(col) };
  }, []);

  const finishSelection = useCallback(
    (path: Cell[]) => {
      const match = matchSelection(path, puzzle);
      if (match && !foundWords.has(match.word)) onWordFound(match.word);
      setAnchor(null);
      setSelection([]);
      dragging.current = false;
    },
    [puzzle, foundWords, onWordFound]
  );

  const handleStart = (cell: Cell) => {
    dragging.current = true;
    setAnchor(cell);
    setSelection([cell]);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragging.current || !anchor) return;
    const cell = cellFromPoint(clientX, clientY);
    if (!cell) return;
    setSelection(pathBetween(anchor, cell));
  };

  const handleEnd = () => {
    if (!dragging.current) return;
    finishSelection(selection);
  };

  return (
    <div
      className="inline-grid select-none touch-none gap-0.5 p-2 bg-surface border border-rule rounded-xl"
      style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))` }}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchEnd={handleEnd}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) handleMove(t.clientX, t.clientY);
      }}
    >
      {puzzle.grid.map((row, r) =>
        row.map((letter, c) => {
          const key = `${r},${c}`;
          const isFound = foundCells.has(key);
          const isSelected = selectedCells.has(key);
          return (
            <div
              key={key}
              data-row={r}
              data-col={c}
              onMouseDown={() => handleStart({ row: r, col: c })}
              onTouchStart={() => handleStart({ row: r, col: c })}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-semibold text-sm rounded-[4px] transition-colors cursor-pointer
                ${isFound ? "bg-correct text-paper" : isSelected ? "bg-present text-ink" : "bg-ink text-paper/80 hover:bg-surface-high"}`}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
};
