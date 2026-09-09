import type { Metadata } from "next";

import { SplitView } from "@/features/sandbox/SplitView";
import { requireAuth } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Sandbox — Elasticware",
  description:
    "Split-screen sandbox: see the mock shop and agent dashboard side-by-side and watch the AI-to-agent handover happen live.",
  openGraph: {
    title: "Sandbox — Elasticware",
    description:
      "Watch the AI-to-agent handover live, side-by-side. The store on the left, the agent console on the right.",
    type: "website",
  },
};

export default async function SandboxPage() {
  const { supabase, orgId } = await requireAuth();

  const { data: org } = await supabase
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .single();

  const orgSlug = org?.slug ?? "demo";

  return <SplitView orgSlug={orgSlug} />;
}