"use client";
import * as Sentry from "@sentry/nextjs";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

   useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-white">
        <main className="w-full max-w-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>

          <p className="text-gray-600 mb-8">
            An unexpected application error occurred.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try again
          </button>

          {isDev && (
            <pre className="mt-8 w-full p-4 bg-gray-100 rounded-lg text-left overflow-x-auto text-sm text-gray-800">
              <code>{error.stack ?? error.message}</code>
            </pre>
          )}
        </main>
      </body>
    </html>
  );
}