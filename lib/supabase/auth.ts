import { cache } from "react";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "./server";

import type { Database } from "@/lib/db/database.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];

type ServerClientInstance =
  Awaited<ReturnType<typeof createSupabaseServerClient>>;

export interface AuthContext {
  user: SupabaseUser;
  agent: AgentRow;
  orgId: string;
  supabase: ServerClientInstance["supabase"];
}

export const requireAuth = cache(
  async (): Promise<AuthContext> => {
    const { supabase } = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", user.id)
      .single();

    if (agentError || !agent) {
      redirect("/login?error=unauthorized");
    }

    if (!agent.org_id) {
      redirect("/login?error=no-org");
    }

    return {
      user,
      agent,
      orgId: agent.org_id,
      supabase,
    };
  }
);