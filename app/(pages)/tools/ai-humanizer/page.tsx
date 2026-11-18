import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { HumanizerEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  humanizerLanding,
  humanizerMeta,
} from "@/app/components/AiLandingPage/Humanizer/content";

const path = "/tools/ai-humanizer";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function HumanizerLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={humanizerMeta.title}
        metaDescription={humanizerMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={humanizerLanding} tool={<HumanizerEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: humanizerMeta.title,
    description: humanizerMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
