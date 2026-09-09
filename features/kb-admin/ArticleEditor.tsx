"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createKbArticle } from "@/app/dashboard/kb/actions";
import * as Sentry from "@sentry/nextjs";

export function ArticleEditor() {
  const formRef = useRef<HTMLFormElement>(null);
  const justFinished = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) {
      justFinished.current = true;
    } else if (justFinished.current) {
      justFinished.current = false;
      formRef.current?.reset();
    }
  }, [isPending]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");

    setError(null);
    startTransition(async () => {
      const result = await createKbArticle(title, content);
      if (!result.ok) {
        setError(result.error);
        Sentry.captureException(new Error(`Failed to create article: ${result.error}`));
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mb-8 space-y-3">
      {error && (
        <p className="text-sm text-accent-400">
          {error}
        </p>
      )}
      
      <input
        name="title"
        placeholder="Article title"
        required
        className="w-full rounded-lg bg-charcoal-800 border border-charcoal-600 px-3 py-2 text-sm text-cream-100"
      />
      
      <textarea
        name="content"
        placeholder="Article content"
        required
        rows={3}
        className="w-full rounded-lg bg-charcoal-800 border border-charcoal-600 px-3 py-2 text-sm text-cream-100"
      />
      
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-accent-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding..." : "Add Article"}
      </button>
    </form>
  );
}
