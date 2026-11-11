import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import EssayGeneratorToolEmbed from "@/app/components/AiLandingPage/EssayGenerator/EssayGeneratorToolEmbed";
import {
  essayGeneratorLanding,
  essayGeneratorMeta,
} from "@/app/components/AiLandingPage/EssayGenerator/content";

const path = "/tools/ai-essay-generator";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function EssayGeneratorLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={essayGeneratorMeta.title}
        metaDescription={essayGeneratorMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={essayGeneratorLanding} tool={<EssayGeneratorToolEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: essayGeneratorMeta.title,
    description: essayGeneratorMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
