import { signWidgetToken } from "@/lib/supabase/widget-auth";
import { supabaseApi } from "@/lib/supabase/api";
import { corsResponse, corsPreflight } from "@/lib/cors";
import * as Sentry from "@sentry/nextjs";
import {
  rateLimit,
  getClientIp,
} from "@/lib/rate-limit";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const form = await request.formData();

  const session_id = form.get("session_id");
  const org_key = form.get("org_key");

  const rate = rateLimit(
  `widget-auth:${getClientIp(request)}`,
  10,
  60_000,
);

if (!rate.success) {
  return corsResponse(
    { error: "Too many requests" },
    429,
    new Headers({
      "Retry-After": String(rate.retryAfter),
    }),
  );
}

  if (typeof session_id !== "string" || typeof org_key !== "string") {
    return corsResponse(
      { error: "Missing session_id or org_key" },
      400,
    );
  }

  const { data: org, error: orgError } = await supabaseApi
    .from("organizations")
    .select("id")
    .eq("slug", org_key)
    .single();

  if (orgError || !org) {
    Sentry.captureException(new Error("Invalid org_key"));
    return corsResponse(
      { error: "Invalid org_key" },
      404,
    );
  }

  const token = await signWidgetToken({
    sub: session_id,
    org_id: org.id,
  });

  return corsResponse({
    token,
    expires_in: 3600,
  });
}