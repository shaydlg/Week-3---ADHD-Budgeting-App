import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This builds a Supabase connection for code that runs on the server
// (server components and server actions). It reads the user's login cookie
// so the database knows who is asking, which is what Row Level Security needs.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be safely ignored when called from a Server Component,
            // as long as middleware refreshes the user's session.
          }
        },
      },
    }
  );
}
