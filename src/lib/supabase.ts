import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fails loudly in dev rather than silently shipping a client that can
  // never reach the leaderboard.
  console.warn(
    "Wordezy Search: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "the daily leaderboard will not load. Copy .env.example to .env.local and fill them in."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
