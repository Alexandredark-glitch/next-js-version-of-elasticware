import { CreateTicketSchema } from "@/lib/db/schema";
import { requireAuth, type AuthContext } from "@/lib/supabase/auth";
import { supabaseService } from "@/lib/supabase/service";
import { handleBotReply } from "@/lib/bot/engine";
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
  const intent = form.get("intent");

  if (intent === "resolve") {
    const ticket_id = form.get("ticket_id");

    if (!ticket_id || typeof ticket_id !== "string") {
      Sentry.captureException(new Error("Missing ticket_id"));
      return corsResponse(
        { error: "Missing ticket_id" },
        400,
      );
    }

    let auth: AuthContext | null = null;

    try {
      auth = await requireAuth();
    } catch {
      Sentry.captureException(new Error("Unauthorized"));
      auth = null;
    }

    if (auth) {
      const { error } = await auth.supabase
        .from("tickets")
        .update({
          status: "resolved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ticket_id);

      if (error) {
        Sentry.captureException(new Error(`Failed to resolve ticket: ${error}`));
        return corsResponse(
          { error: "Failed to resolve ticket" },
          500,
        );
      }

      return corsResponse({
        ok: true,
        resolved: true,
      });
    }

    const session_id = form.get("session_id");

    if (!session_id || typeof session_id !== "string") {
      Sentry.captureException(new Error("Missing session_id"));
      return corsResponse(
        { error: "Unauthorized" },
        401,
      );
    }

    const { error } = await supabaseService
      .from("tickets")
      .update({
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket_id)
      .eq("customer_session_id", session_id);

    if (error) {
      Sentry.captureException(new Error(`Failed to resolve ticket: ${error}`));
      console.error("Widget resolve error:", error);

      return corsResponse(
        { error: "Failed to resolve ticket" },
        500,
      );
    }

    return corsResponse({
      ok: true,
      resolved: true,
    });
  }

  const raw = {
    org_key: form.get("org_key"),
    session_id: form.get("session_id"),
    content: form.get("content"),
  };

  const parsed = CreateTicketSchema.safeParse(raw);

  if (!parsed.success) {
    return corsResponse(
      {
        error: "Invalid input",
        issues: parsed.error.issues,
      },
      400,
    );
  }

  const { org_key, session_id, content } = parsed.data;

  const rate = rateLimit(
  `tickets:${getClientIp(request)}`,
  5,
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

  const { data: org } = await supabaseService
    .from("organizations")
    .select("id")
    .eq("slug", org_key)
    .single();

  if (!org) {
    return corsResponse(
      { error: "Org not found" },
      404,
    );
  }

  const { data: ticket, error: ticketErr } = await supabaseService
    .from("tickets")
    .insert({
      org_id: org.id,
      customer_session_id: session_id,
      status: "bot_handling",
      subject: content.slice(0, 100),
      preview: content.slice(0, 150),
    })
    .select()
    .single();

  if (ticketErr || !ticket) {
    return corsResponse(
      { error: "Failed to create ticket" },
      500,
    );
  }

  const { error: msgErr } = await supabaseService
    .from("messages")
    .insert({
      ticket_id: ticket.id,
      sender: "customer",
      content,
    });

  if (msgErr) {
    return corsResponse(
      { error: "Failed to save message" },
      500,
    );
  }

  try {
    await handleBotReply({
      supabase: supabaseService,
      ticketId: ticket.id,
      orgId: org.id,
      customerMessage: content,
    });
  } catch (err) {
    Sentry.captureException(new Error(`Bot reply failed and ${err}`));
    console.error("Bot reply failed:", err);
  }

  return corsResponse({
    ticket_id: ticket.id,
  });
}