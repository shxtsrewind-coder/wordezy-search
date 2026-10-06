// Local save for what's inherently per-device: the win streak and the
// Classic Unlimited unlock flag. Identity and leaderboard standing now live
// in Supabase (lib/supabase.ts ensureSession + lib/leaderboard.ts) — the
// cached displayName here is just so the header can render before the
// profile fetch resolves, never the source of truth.
const KEY = "wordezySearch.save.v1";

export interface SaveData {
  lastSolvedDate: string | null;
  streak: number;
  unlockedUnlimited: boolean;
  displayName: string | null;
}

const DEFAULTS: SaveData = {
  lastSolvedDate: null,
  streak: 0,
  unlockedUnlimited: false,
  displayName: null,
};

function read(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
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
