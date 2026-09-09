"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/supabase/auth";
import {
  createArticle,
  deleteArticle,
  regenerateMissingEmbeddings,
} from "@/lib/services/kb";
import * as Sentry from "@sentry/nextjs";

export type KbActionState =
  | { ok: true; updated?: number }
  | { ok: false; error: string };

export async function regenerateEmbeddings(): Promise<KbActionState> {
  try {
    const { supabase, orgId } = await requireAuth();
    const updated = await regenerateMissingEmbeddings(supabase, orgId);

    revalidatePath("/dashboard/kb");
    return { ok: true, updated };
  } catch (error) {
    Sentry.captureException(new Error(`Failed to regenerate embeddings: ${error}`));
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function createKbArticle(
  title: string,
  content: string
): Promise<KbActionState> {
  try {
    const { supabase, orgId } = await requireAuth();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return { ok: false, error: "Title and content are required" };
    }

    await createArticle(supabase, orgId, trimmedTitle, trimmedContent);

    revalidatePath("/dashboard/kb");
    return { ok: true };
  } catch (error) {
    Sentry.captureException(new Error(`Failed to create article: ${error}`));
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function deleteKbArticle(id: string): Promise<KbActionState> {
  try {
    const { supabase } = await requireAuth();

    if (!id) {
      return { ok: false, error: "Missing article ID" };
    }

    await deleteArticle(supabase, id);

    revalidatePath("/dashboard/kb");
    return { ok: true };
  } catch (error) {
    Sentry.captureException(new Error(`Failed to delete article: ${error}`));
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}