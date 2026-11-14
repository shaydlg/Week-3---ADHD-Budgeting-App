"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Activity that counts as "the user is still here."
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
] as const;
const STORAGE_KEY = "lastActivityAt";

// Signs the user out after a period of no activity. Covers two cases:
//  - the tab stays open but idle -> a timer fires and signs out;
//  - the app is closed and reopened after the limit -> a stored timestamp is
//    checked on load / when the tab regains focus, and signs out.
// Enforced client-side; server-side enforcement (shorter Supabase token life)
// is the stricter standard and a future step. See ADR-0009.
export default function IdleTimeout({
  timeoutMs = 5 * 60 * 1000,
}: {
  timeoutMs?: number;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let signedOut = false;
    let lastWrite = 0;

    async function signOut() {
      if (signedOut) return;
      signedOut = true;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      await supabase.auth.signOut();
      router.replace("/login?timeout=1");
    }

    function stamp(now: number) {
      try {
        localStorage.setItem(STORAGE_KEY, String(now));
      } catch {}
    }

    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(signOut, timeoutMs);
    }

    function markActivity() {
      const now = Date.now();
      // Reschedule on every event, but only touch storage every 10s.
      if (now - lastWrite > 10_000) {
        stamp(now);
        lastWrite = now;
      }
      schedule();
    }

    function idleTooLong() {
      try {
        const last = Number(localStorage.getItem(STORAGE_KEY));
        return last > 0 && Date.now() - last > timeoutMs;
      } catch {
        return false;
      }
    }

    // Was the app left idle (including fully closed) past the limit?
    if (idleTooLong()) {
      signOut();
      return;
    }

    function onVisible() {
      if (document.visibilityState === "visible" && idleTooLong()) signOut();
    }
    function onHide() {
      // Record the moment we leave so a reopen is measured from real activity.
      stamp(Date.now());
    }

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, markActivity, { passive: true })
    );
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pagehide", onHide);
    markActivity();

    return () => {
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, markActivity)
      );
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pagehide", onHide);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [router, timeoutMs]);

  return null;
}
