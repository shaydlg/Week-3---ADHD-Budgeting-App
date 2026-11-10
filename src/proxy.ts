import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In this version of Next.js, the file that runs on every request is called
// "proxy" (it used to be called "middleware"). Its job here is to keep the
// user's login session fresh as they move around the app.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on all pages except static files and images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
