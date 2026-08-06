import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import {
  aiDetectorContent,
  aiDetectorMeta,
} from "@/app/components/AiLandingPage/AiDetector/content";
import ToolLanding from "@/app/components/AiLandingPage/ToolLanding/ToolLanding";
import { AiDetectorEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";

const path = "/tools/ai-detector";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function AiDetectorLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={aiDetectorMeta.title}
        metaDescription={aiDetectorMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <ToolLanding content={aiDetectorContent} tool={<AiDetectorEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: aiDetectorMeta.title,
    description: aiDetectorMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
