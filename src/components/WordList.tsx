import React from "react";
import { Check } from "lucide-react";
import type { PlacedWord } from "../lib/wordsearch.ts";

export const WordList: React.FC<{ words: PlacedWord[]; found: Set<string> }> = ({ words, found }) => (
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 content-start">
    {words.map((w) => {
      const isFound = found.has(w.word);
      return (
        <div
          key={w.word}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-mono transition-colors ${
            isFound ? "bg-correct-soft text-correct line-through decoration-2" : "bg-ink text-paper/80"
          }`}
        >
          <Check className={`w-3.5 h-3.5 shrink-0 ${isFound ? "opacity-100" : "opacity-0"}`} />
          <span>{w.word}</span>
        </div>
      );
    })}
  </div>
);
