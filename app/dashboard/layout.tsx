import type { ReactNode } from "react";
import { requireAuth } from "@/lib/supabase/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-charcoal-900 text-cream-100">
      {children}
    </div>
  );
}