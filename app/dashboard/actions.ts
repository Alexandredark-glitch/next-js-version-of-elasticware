"use server";

import { requireAuth } from "@/lib/supabase/auth";
import { supabaseService } from "@/lib/supabase/service";
import { CreateMessageSchema } from "@/lib/db/schema";
import * as Sentry from "@sentry/nextjs";

async function getAuthorizedTicket(
  ticketId: string,
  orgId: string
) {
  const { data: ticket, error } = await supabaseService
    .from("tickets")
    .select("id, org_id")
    .eq("id", ticketId)
    .single();

  if (error || !ticket) {
    Sentry.captureException(new Error(`Ticket not found: ${error}`));
    return {
      ok: false as const,
      error: "Ticket not found",
    };
  }

  if (!ticket.org_id) {
    Sentry.captureException(new Error(`Ticket has no organization: ${ticketId}`));
    return {
      ok: false as const,
      error: "Ticket has no organization",
    };
  }

  if (ticket.org_id !== orgId) {
    Sentry.captureException(new Error(`Ticket not found: ${ticketId}`));
    return {
      ok: false as const,
      error: "Ticket not found",
    };
  }

  return {
    ok: true as const,
    ticket,
  };
}

export async function sendAgentMessage(
  ticketId: string,
  content: string
) {
  const { supabase, orgId } = await requireAuth();

  const parsed = CreateMessageSchema.safeParse({
    ticket_id: ticketId,
    sender: "agent",
    content,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Invalid input",
    };
  }

  const {
    ticket_id,
    content: messageContent,
  } = parsed.data;

  const ticketResult = await getAuthorizedTicket(ticket_id, orgId);

  if (!ticketResult.ok) {
    return ticketResult;
  }

  const { error: messageError } = await supabase
    .from("messages")
    .insert({
      ticket_id,
      sender: "agent",
      content: messageContent,
    });

  if (messageError) {
    Sentry.captureException(new Error(`Failed to save message: ${messageError}`));
    return {
      ok: false as const,
      error: "Failed to save message",
    };
  }

  const { error: ticketUpdateError } = await supabase
    .from("tickets")
    .update({
      status: "open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket_id);

  if (ticketUpdateError) {
    Sentry.captureException(new Error(`Failed to update ticket status: ${ticketUpdateError}`));
    return {
      ok: false as const,
      error: "Message saved, but failed to update ticket status",
    };
  }

  return {
    ok: true as const,
  };
}

export async function resolveTicket(ticketId: string) {
  const { supabase, orgId } = await requireAuth();

  if (!ticketId) {
  
    return {
      ok: false as const,
      error: "Missing ticket_id",
    };
  }

  const ticketResult = await getAuthorizedTicket(ticketId, orgId);

  if (!ticketResult.ok) {
    return ticketResult;
  }

  const { error: ticketUpdateError } = await supabase
    .from("tickets")
    .update({
      status: "resolved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (ticketUpdateError) {
    Sentry.captureException(new Error(`Failed to resolve ticket: ${ticketUpdateError}`));
    return {
      ok: false as const,
      error: "Failed to resolve ticket",
    };
  }

  return {
    ok: true as const,
    resolved: true as const,
  };
}

export async function deleteTicket(ticketId: string) {
  const { supabase, orgId } = await requireAuth();

  if (!ticketId) {
    
    return {
      ok: false as const,
      error: "Missing ticket_id",
    };
  }

  const ticketResult = await getAuthorizedTicket(ticketId, orgId);

  if (!ticketResult.ok) {
    return ticketResult;
  }

  const { error: messageDeleteError } = await supabase
    .from("messages")
    .delete()
    .eq("ticket_id", ticketId);

  if (messageDeleteError) {
    Sentry.captureException(new Error(`Failed to delete messages: ${messageDeleteError}`));
    return {
      ok: false as const,
      error: "Failed to delete messages",
    };
  }

  const { error: ticketDeleteError } = await supabase
    .from("tickets")
    .delete()
    .eq("id", ticketId);

  if (ticketDeleteError) {
    Sentry.captureException(new Error(`Failed to delete ticket: ${ticketDeleteError}`));
    return {
      ok: false as const,
      error: "Failed to delete ticket",
    };
  }

  return {
    ok: true as const,
    ticket_id: ticketId,
  };
}