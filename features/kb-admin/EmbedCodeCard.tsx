"use client";

import { useState } from "react";

export function EmbedCodeCard({ orgSlug }: { orgSlug: string }) {
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

  const embedCode = `<script src="${origin}/widget.js" data-org-key="${orgSlug}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = embedCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 rounded-xl border border-charcoal-600 bg-charcoal-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-cream-100">Embed Code</h2>
          <p className="text-sm text-charcoal-400 mt-1">
            Paste this into any website to add your chat widget. Specifically, place it just before the closing <code className="text-red-500 font-bold font-2xl">&lt;/body&gt;</code> tag.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="rounded-lg bg-charcoal-900 border border-charcoal-700 p-4 overflow-x-auto">
        <code className="text-sm font-mono text-teal-300">{embedCode}</code>
      </pre>
    </div>
  );
}