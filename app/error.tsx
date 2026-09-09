"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-white">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>

      <p className="text-gray-600 mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>

        <Link
          href="/"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go to home
        </Link>
      </div>

      {isDev && (
        <pre className="mt-8 w-full max-w-2xl p-4 bg-gray-100 rounded-lg text-left overflow-x-auto text-sm text-gray-800">
          <code>{error.stack ?? error.message}</code>
        </pre>
      )}
    </main>
  );
}
//Thanks for reset() next js