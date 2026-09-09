import type { Metadata } from "next";

import { Storefront } from "@/features/mock-shop/Storefront";
import {ChatWidget} from "@/features/chat-widget/ChatWidget";


export const metadata: Metadata = {
  title: "Elasticware — Mock Storefront",
  description:
    "A demo storefront with handcrafted goods. Browse the collection and chat with a Bot — the AI support assistant.",
  openGraph: {
    title: "Elasticware — Mock Storefront",
    description:
      "Browse handcrafted goods and chat with a bot, the AI assistant that handles customer questions.",
    type: "website",
  },
};

export default async function MockShopPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const params = await searchParams;
  const orgKey = params.org || "demo";

  return (
    <>
      <Storefront />
      <ChatWidget orgKey={orgKey} />
    </>
  );
}