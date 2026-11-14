import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Server-side idle timeout (see ADR-0009). The client-side IdleTimeout handles
// the live, in-tab experience; this makes the same 5-minute limit impossible to
// bypass by turning JavaScript off, because the server itself refuses a session
// that has gone quiet for too long. "Activity" is any request that reaches the
// proxy (a page navigation or a server action), recorded in an http-only cookie
// the browser cannot forge.
const IDLE_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_COOKIE = "last_activity";

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!;
}
function supabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
}

// This runs on every request. It keeps the user's login session fresh (refreshes
// the token) and enforces the idle timeout.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // This refreshes the session on each request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const now = Date.now();
    const last = Number(request.cookies.get(ACTIVITY_COOKIE)?.value);

    if (last && now - last > IDLE_LIMIT_MS) {
      // Idle too long: sign the session out on the server and send to login.
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("timeout", "1");
      const redirectResponse = NextResponse.redirect(url);

      // Bind a client to the redirect so signOut clears the auth cookies onto it.
      const signOutClient = createServerClient(supabaseUrl(), supabaseKey(), {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            );
          },
        },
      });
      // Local scope clears the session cookies without a network round-trip.
      await signOutClient.auth.signOut({ scope: "local" });
      redirectResponse.cookies.set(ACTIVITY_COOKIE, "", {
        maxAge: 0,
        path: "/",
      });
      return redirectResponse;
    }

    // Still active: stamp the activity time. http-only so the client cannot
    // forge it; the value is refreshed on every request.
    supabaseResponse.cookies.set(ACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  } else if (request.cookies.has(ACTIVITY_COOKIE)) {
    // No session (e.g. the login page): drop any leftover activity marker so a
    // stale one from a previous session can't instantly bounce the next login
    // back out "for inactivity." A fresh login then starts with a clean timer.
    supabaseResponse.cookies.set(ACTIVITY_COOKIE, "", { maxAge: 0, path: "/" });
  }

  return supabaseResponse;
}
