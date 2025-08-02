import { SUPABASE_ANON, SUPABASE_URL } from "@/constants/utils";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      async getAll() {
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          console.error("Error setting cookies:", error);
        }
      },
    },
  });
}
