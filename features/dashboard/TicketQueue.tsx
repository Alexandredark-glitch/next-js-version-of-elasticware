

import { useState, useTransition } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteTicket } from "@/app/dashboard/actions";
import * as Sentry from "@sentry/nextjs";

import type { QueueTicket } from "./DashboardShell";

export function TicketQueue({
  tickets,
  selectedId,
  onSelect,
  tab,
}: {
  tickets: QueueTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  tab?: "open" | "resolved";
}) {
  const queryClient = useQueryClient();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  const handleDelete = (ticketId: string) => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this ticket and all its related messages permanently?"
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setDeletingId(ticketId);

    startDeleting(async () => {
  const result = await deleteTicket(ticketId);

  if (!result.ok) {
    setDeleteError(result.error);
    setDeletingId(null);
    Sentry.captureException(new Error(`Failed to delete ticket: ${result.error}`));
    return;
  }

  if (selectedId === ticketId) {
    const remainingTickets = tickets.filter(
      (ticket) => ticket.id !== ticketId
    );
    onSelect(remainingTickets[0]?.id ?? "");
  }

 
  queryClient.setQueriesData<QueueTicket[]>(
    { queryKey: ["tickets"] },
    (old) => old?.filter((ticket) => ticket.id !== ticketId) ?? old
  );

  setDeletingId(null);
});
  };

  const visibleTickets = tickets.filter(
    (ticket) => ticket.id !== deletingId
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-charcoal-700 flex items-center justify-between flex-shrink-0">
        <h2 className="font-heading text-sm font-semibold text-cream-100 uppercase tracking-wider">
          Queue
        </h2>

        <span className="px-2 py-0.5 text-xs font-mono text-charcoal-300 bg-charcoal-700 rounded-full">
          {tickets.length}
        </span>
      </div>

      {deleteError && (
        <div className="mx-3 mt-3 px-3 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded">
          <p className="text-xs text-accent-400">
            Failed to delete ticket: {deleteError}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-chat p-3 space-y-2">
        {visibleTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-charcoal-500">
            <p className="text-sm">No active tickets</p>
          </div>
        )}

        {visibleTickets.map((ticket) => {
          const ticketIsDeleting =
            isDeleting && deletingId === ticket.id;

          return (
            <div
              key={ticket.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(ticket.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(ticket.id);
                }
              }}
              className={cn(
                "ticket-stub w-full text-left pl-5 pr-4 py-3 rounded-lg border transition-all focus-ring cursor-pointer",
                selectedId === ticket.id
                  ? "bg-charcoal-700 border-accent-500/50"
                  : "bg-charcoal-800 border-charcoal-700 hover:border-charcoal-600 hover:bg-charcoal-750",
                ticketIsDeleting && "opacity-50 pointer-events-none"
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs text-charcoal-400">
                  {ticket.id.slice(0, 8)}…
                </span>

                <StatusBadge
                  status={
                    ticket.status as
                      | "bot_handling"
                      | "open"
                      | "resolved"
                  }
                />
              </div>

              <p className="text-sm font-medium text-cream-100 leading-snug mb-1 truncate">
                {ticket.subject}
              </p>

              <p className="text-xs text-charcoal-400 truncate">
                {ticket.preview}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-charcoal-700/50">
                <span className="text-xs text-charcoal-300">
                  {ticket.customer}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-500">
                    {ticket.updatedAt}
                  </span>

                  {tab === "resolved" && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(ticket.id);
                      }}
                      disabled={isDeleting}
                      className={cn(
                        "text-xs transition-colors",
                        ticketIsDeleting
                          ? "text-charcoal-500 cursor-wait"
                          : "text-accent-400 hover:text-accent-300 px-1.5 py-0.5 rounded hover:bg-accent-500/10"
                      )}
                    >
                      {ticketIsDeleting ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}