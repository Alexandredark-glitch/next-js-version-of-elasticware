"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export type SignupState = {
  error?: string;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const { supabase } = await createSupabaseServerClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const { data: authData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

  if (signUpError) {
    Sentry.captureException(new Error(`Signup failed: ${signUpError.message}`));
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Signup failed" };
  }

  const slug = `${name
    .toLowerCase()
    .replace(/\s+/g, "-")}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: `${name}'s Organization`,
      slug,
    })
    .select()
    .single();

  if (orgError || !org) {
    return { error: "Failed to create organization" };
  }

  const { error: agentError } = await supabase
    .from("agents")
    .insert({
      id: authData.user.id,
      org_id: org.id,
      role: "admin",
      "full name": name,
    });

  if (agentError) {
    return { error: "Failed to link agent account" };
  }

  redirect("/dashboard");
}