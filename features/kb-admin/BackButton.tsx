"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-block p-2 font-bold bg-white border border-pink-500 rounded text-black mb-6 hover:bg-black hover:text-white transition-colors duration-500 ease-in-out"
    >
      {"<-"} Go back
    </button>
  );
}