import { requireAuth } from "@/lib/supabase/auth";
import { DashboardShell } from "@/features/dashboard/DashboardShell";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Agent Dashboard — Elasticware",
  description: "The agent console: view the ticket queue, read message threads, and see the status of every conversation — from bot-handled to resolved.",
  openGraph: {
    title: "Agent Dashboard — Elasticware",
    description: "Agent console with a live ticket queue and message threads. See bot-handled, open, and resolved conversations.",
    type: "website",
  },
};

export default async function Dashboard() {
  const { user, agent, orgId } = await requireAuth();

  return (
    <DashboardShell
      user={user}
      name={agent["full name"]}
      orgId={orgId}
    />
  );
}
