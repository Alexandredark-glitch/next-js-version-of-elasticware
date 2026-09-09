import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
}

const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");
}


const url: string = SUPABASE_URL;
const key: string = SUPABASE_PUBLISHABLE_KEY;

export const supabase = createBrowserClient<Database>(
  url,
  key
);