// Local-only save for this first pass — no backend yet (Wordezy's Supabase
// pattern is the natural next step: daily streak synced across devices,
// real purchase verification for Classic Unlimited). For now, progress and
// the unlock flag live in this browser only.
const KEY = "wordezySearch.save.v1";

export interface SaveData {
  lastSolvedDate: string | null;
  streak: number;
  unlockedUnlimited: boolean;
}

const DEFAULTS: SaveData = {
  lastSolvedDate: null,
  streak: 0,
  unlockedUnlimited: false,
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
};
