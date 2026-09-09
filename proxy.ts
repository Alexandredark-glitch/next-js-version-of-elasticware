import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 renamed middleware → proxy and recommends it as a last resort.
 * We honor that: the proxy does exactly ONE thing — Supabase session
 * cookie refresh. It never touches route guards, headers, or redirects.
 *
 * Authorization: app/dashboard/layout.tsx → requireAuth() → redirect().
 * Redirecting logged-in users away from /login: the login page's own
 * Server Component (Phase 4). Both run on the Node runtime with full DB
 * access, which the Edge proxy never had anyway.
 *
 * No codemod needed — this file is generated natively as proxy.ts.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Tight scope: only authed app areas need fresh cookies.
  // Excluded by construction: /api/* (widget CORS handles itself),
  // /widget.js + all static assets, /login, /signup, /mock-shop, /sandbox.
  matcher: ["/dashboard/:path*"],
};
