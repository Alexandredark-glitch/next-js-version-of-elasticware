"use client";

import { useState, useTransition } from "react";
import { deleteKbArticle } from "@/app/dashboard/kb/actions";
import * as Sentry from "@sentry/nextjs";

export function ArticleCard({
  article,
}: {
  article: {
    id: string;
    title: string;
    content: string;
    embedding: unknown;
  };
}) {
  const [isDeleting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDeleting) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteKbArticle(article.id);
      if (!result.ok) {
        setError(result.error);
        Sentry.captureException(new Error(`Failed to delete article: ${result.error}`));
      }
    });
  };

  return (
    <div className="p-4 border border-charcoal-700 rounded-xl flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-cream-100">
          {article.title}
        </h3>

        <p className="text-sm text-charcoal-400 mt-1">
          {article.content}
        </p>

        <p className="text-xs text-charcoal-500 mt-2">
          {article.embedding ? "Embedded" : "Missing embedding"}
        </p>

        {error && (
          <p className="text-xs text-accent-400 mt-2">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={handleDelete} className="flex-shrink-0">
        <button
          type="submit"
          disabled={isDeleting}
          className="text-xs text-accent-400 hover:text-accent-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </form>
    </div>
  );
}
