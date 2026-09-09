"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SplitView({ orgSlug }: { orgSlug: string }) {
  const shopRef = useRef<HTMLIFrameElement>(null);
  const dashRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();

  function reloadBoth() {
    setReloadKey((k) => k + 1);
  }

   useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== "elasticware") return;

      if (event.data.type === "logout") {
        router.replace("/login");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]); //Fucking hell.



  return (
    <div className="h-screen flex flex-col bg-charcoal-950">
     

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
        <div className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-charcoal-700">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-charcoal-800 border-b border-charcoal-700">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span className="text-xs font-semibold text-charcoal-200 uppercase tracking-wider">
              Storefront — Customer View
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-cream-50">
            <iframe
              key={`shop-${reloadKey}`}
              ref={shopRef}
               src={`/mock-shop?org=${encodeURIComponent(orgSlug)}`}
              title="Mock Shop"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="flex flex-col min-h-0">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-charcoal-800 border-b border-charcoal-700">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold text-charcoal-200 uppercase tracking-wider">
              Agent Console — Dashboard
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-charcoal-900">
            <iframe
              key={`dash-${reloadKey}`}
              ref={dashRef}
              src="/dashboard"
              title="Agent Dashboard"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
