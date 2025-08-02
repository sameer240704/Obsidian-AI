import { SUPABASE_ANON, SUPABASE_URL } from "@/constants/utils";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}
