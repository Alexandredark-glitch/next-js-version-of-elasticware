import { supabaseApi } from "@/lib/supabase/api";
import { supabaseService } from "@/lib/supabase/service";
import { CreateMessageSchema } from "@/lib/db/schema";
import { requireAuth } from "@/lib/supabase/auth";
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

  const raw = {
    ticket_id: form.get("ticket_id"),
    sender: form.get("sender"),
    content: form.get("content"),
  };

  const parsed = CreateMessageSchema.safeParse(raw);

  if (!parsed.success) {
    return corsResponse(
      {
        error: "Invalid input",
        issues: parsed.error.issues,
      },
      400,
    );
  }

  const {
    ticket_id,
    sender: clientSender,
    content,
  } = parsed.data;

  const rate = rateLimit(
  `messages:${getClientIp(request)}`,
  20,
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

  let sender = clientSender;
  let writeClient = supabaseApi;

  if (clientSender === "agent") {
    try {
      const auth = await requireAuth();

      sender = "agent";
      writeClient = auth.supabase;
    } catch {
      Sentry.captureException(new Error("Unauthorized"));
      return corsResponse(
        { error: "Unauthorized" },
        401,
      );
    }
  }

  const { data: ticket, error: ticketError } = await supabaseService
    .from("tickets")
    .select("id, status, org_id")
    .eq("id", ticket_id)
    .single();

  if (ticketError || !ticket) {
    Sentry.captureException(new Error(`Ticket not found: ${ticketError}`));
    return corsResponse(
      { error: "Ticket not found" },
      404,
    );
  }

  if (!ticket.org_id) {
    Sentry.captureException(new Error(`Ticket has no organization: ${ticket_id}`));
    return corsResponse(
      { error: "Ticket has no organization" },
      500,
    );
  }

  const { error: msgError } = await writeClient
    .from("messages")
    .insert({
      ticket_id,
      sender,
      content,
    });

  if (msgError) {
    Sentry.captureException(new Error(`Failed to save message: ${msgError}`));
    return corsResponse(
      { error: "Failed to save message" },
      500,
    );
  }

  if (sender === "customer" && ticket.status === "bot_handling") {
    try {
      await handleBotReply({
        supabase: supabaseService,
        ticketId: ticket_id,
        orgId: ticket.org_id,
        customerMessage: content,
      });
    } catch (err) {
      Sentry.captureException(new Error(`Bot reply failed and ${err}`));
      console.error("Bot reply failed:", err);
    }
  }

  if (sender === "agent") {
    const { error: updateError } = await writeClient
      .from("tickets")
      .update({
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket_id);

    if (updateError) {
      Sentry.captureException(new Error(`Failed to update ticket status: ${updateError}`));
      return corsResponse(
        {
          error:
            "Message saved, but failed to update ticket status",
        },
        500,
      );
    }
  }

  return corsResponse({ ok: true });
}