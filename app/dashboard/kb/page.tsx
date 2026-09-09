import type { Metadata } from "next";
import { BackButton } from "@/features/kb-admin/BackButton";

import { requireAuth } from "@/lib/supabase/auth";
import { listArticles, getOrgSlug } from "@/lib/services/kb";

import { ArticleList } from "@/features/kb-admin/ArticleList";
import { ArticleEditor } from "@/features/kb-admin/ArticleEditor";
import { EmbedCodeCard } from "@/features/kb-admin/EmbedCodeCard";

export const metadata: Metadata = {
  title: "Knowledge Base — Elasticware",
  description: "Manage your organization's knowledge base and regenerate article embeddings.",
};

export default async function KnowledgeBasePage() {
  const { supabase, orgId } = await requireAuth();

  const [articles, orgSlug] = await Promise.all([
    listArticles(supabase, orgId),
    getOrgSlug(supabase, orgId),
  ]);

  return (
    <div className="min-h-screen bg-charcoal-900 text-cream-100 p-8">
     <BackButton />

      <h1 className="text-2xl font-bold mb-6">
        Knowledge Base
      </h1>

      <EmbedCodeCard orgSlug={orgSlug} />

      <ArticleEditor />

      <ArticleList articles={articles} />
    </div>
  );
}
