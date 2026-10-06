// Local save. Streak and the unlock flag are inherently per-device for now
// (Wordezy's Supabase pattern is the natural next step for those). The
// leaderboard is different: scores are already synced server-side
// (lib/leaderboard.ts), so playerId/displayName here are just this
// browser's anonymous identity, not the record of anything.
const KEY = "wordezySearch.save.v1";

export interface SaveData {
  lastSolvedDate: string | null;
  streak: number;
  unlockedUnlimited: boolean;
  /** Anonymous, per-browser identity used to attribute leaderboard scores. */
  playerId: string;
  displayName: string | null;
}

function newPlayerId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULTS: Omit<SaveData, "playerId"> = {
  lastSolvedDate: null,
  streak: 0,
  unlockedUnlimited: false,
  displayName: null,
};

function read(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    const data: SaveData = raw ? { ...DEFAULTS, playerId: newPlayerId(), ...JSON.parse(raw) } : { ...DEFAULTS, playerId: newPlayerId() };
    if (!raw) write(data); // persist the freshly-minted playerId immediately
    return data;
  } catch {
    return { ...DEFAULTS, playerId: newPlayerId() };
  }
}

function write(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
}

export const localSave = {
  get: read,

  recordDailyWin(date: string): SaveData {
    const data = read();
    if (data.lastSolvedDate === date) return data; // already recorded today
    const yesterday = new Date(Date.parse(date + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
    data.streak = data.lastSolvedDate === yesterday ? data.streak + 1 : 1;
    data.lastSolvedDate = date;
    write(data);
    return data;
  },

  /** Placeholder until a real payment processor is wired up — never call
   *  this from anywhere except a confirmed, server-verified purchase once
   *  that exists. */
  setUnlocked(value: boolean): SaveData {
    const data = read();
    data.unlockedUnlimited = value;
    write(data);
    return data;
  },

  setDisplayName(name: string): SaveData {
    const data = read();
    data.displayName = name.trim().slice(0, 20) || null;
    write(data);
    return data;
  },
};
