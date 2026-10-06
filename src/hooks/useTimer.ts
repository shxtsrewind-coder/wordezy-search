import { useEffect, useRef, useState } from "react";

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** A simple running stopwatch, pausable, reset by changing `resetKey`. */
export function useTimer(resetKey: string, running: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setElapsedMs(0);
  }, [resetKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsedMs(Date.now() - startRef.current), 250);
    return () => clearInterval(id);
  }, [running, resetKey]);

  return elapsedMs;
}
