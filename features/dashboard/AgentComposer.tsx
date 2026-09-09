"use client";

import { useState, useTransition } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { Database } from "@/lib/db/database.types";

import { sendAgentMessage } from "@/app/dashboard/actions";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export function AgentComposer({
  ticketId,
  disabled,
}: {
  ticketId: string;
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();

  const [isSending, startSending] = useTransition();
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = () => {
    const trimmed = text.trim();

    if (!trimmed || isSending || disabled) {
      return;
    }

    setSendError(null);

    const queryKey = ["messages", ticketId, "global"] as const;
    const pendingId = `pending-${Date.now()}`;

    const optimisticMessage = {
      id: pendingId,
      ticket_id: ticketId,
      sender: "agent",
      content: trimmed,
      created_at: new Date().toISOString(),
    } as MessageRow;

    setText("");

    queryClient.setQueryData<MessageRow[]>(
      queryKey,
      (currentMessages = []) => [
        ...currentMessages,
        optimisticMessage,
      ]
    );

    startSending(async () => {
      const result = await sendAgentMessage(ticketId, trimmed);

      if (!result.ok) {
        queryClient.setQueryData<MessageRow[]>(
          queryKey,
          (currentMessages = []) =>
            currentMessages.filter(
              (message) => message.id !== pendingId
            )
        );

        setSendError(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["messages", ticketId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-charcoal-700 p-4">
      {sendError && (
        <div className="mb-3 px-3 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded">
          <p className="text-xs text-accent-400">
            Failed to send: {sendError}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || disabled}
          placeholder="Type your reply…"
          className="flex-1 bg-charcoal-900 text-cream-100 text-sm px-4 py-2.5 rounded-lg border border-charcoal-700 focus:border-accent-500 focus:outline-none transition-colors disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !text.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send"
        >
         <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        </button>
      </div>
    </div>
  );
}