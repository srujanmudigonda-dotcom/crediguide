import { createClient } from "@supabase/supabase-js";

// Public project values (publishable key is designed to be public —
// every query is protected by Row Level Security on the database).
// They can be overridden per-environment with VITE_ variables
// (see .env.example); the defaults point at the Team 2 project.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://rmkdzxhhvfgxffvzhjpz.supabase.co";

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_YgK5XktedvpM-9B7nH6TrQ_vUP-vvQm";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
