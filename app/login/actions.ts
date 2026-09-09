"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const intent = String(formData.get("intent") ?? "login");

  const redirectTo =
    String(formData.get("redirectTo") ?? "").trim() || "/dashboard";

  const email =
    intent === "demo"
      ? "demo@elasticbot.com"
      : String(formData.get("email") ?? "");

  const password =
    intent === "demo"
      ? "demo123456"
      : String(formData.get("password") ?? "");

  const { supabase } = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    Sentry.captureException(new Error(`Login failed: ${error.message}`));
    return {
      error: error.message,
    };
  }

  redirect(intent === "demo" ? "/sandbox" : redirectTo);
}