import { createBrowserClient } from "@supabase/ssr";

// This builds a Supabase connection for code that runs in the browser
// (for example, a button a user clicks). Use this in client components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
