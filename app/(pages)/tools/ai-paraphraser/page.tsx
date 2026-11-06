import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { ParaphraserEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  paraphraserLanding,
  paraphraserMeta,
} from "@/app/components/AiLandingPage/Paraphraser/content";

const path = "/tools/ai-paraphraser";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function ParaphraserLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={paraphraserMeta.title}
        metaDescription={paraphraserMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={paraphraserLanding} tool={<ParaphraserEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: paraphraserMeta.title,
    description: paraphraserMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
