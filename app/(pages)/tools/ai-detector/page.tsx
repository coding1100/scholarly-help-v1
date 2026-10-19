import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import {
  aiDetectorLanding,
  aiDetectorMeta,
} from "@/app/components/AiLandingPage/AiDetector/content";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
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
      <LandingTemplate content={aiDetectorLanding} tool={<AiDetectorEmbed />} />
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
