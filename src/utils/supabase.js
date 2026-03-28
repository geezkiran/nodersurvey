import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (typeof window !== "undefined" && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else if (typeof window !== "undefined") {
  console.warn(
    "Supabase client not initialized: missing NEXT_PUBLIC_SUPABASE_URL or anon key."
  );
}

export { supabase };
