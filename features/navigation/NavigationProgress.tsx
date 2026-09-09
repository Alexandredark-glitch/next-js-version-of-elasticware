"use client";

import { useEffect, useState, type ReactNode } from "react";

import { usePathname } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  if (!anchor.href) return false;

  const url = new URL(anchor.href, window.location.href);

  return (
    url.origin === window.location.origin &&
    url.pathname + url.search + url.hash !==
      window.location.pathname +
        window.location.search +
        window.location.hash
  );
}

export function NavigationProgress({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) return;

      if (
        anchor.target === "_blank" ||
        anchor.target === "_parent" ||
        anchor.target === "_top" ||
        anchor.hasAttribute("download") ||
        anchor.hasAttribute("data-no-progress")
      ) {
        return;
      }

      if (isInternalNavigation(anchor)) {
        setIsNavigating(true);
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLFormElement)) return;

      if (target.hasAttribute("data-navigation")) {
        setIsNavigating(true);
      }
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-x-0 top-0 z-50 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
      )}

      <div
        className={`transition-opacity duration-200 ease-in-out ${
          isNavigating ? "opacity-75" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}