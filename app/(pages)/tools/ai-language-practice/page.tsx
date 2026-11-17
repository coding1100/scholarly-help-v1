import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { LanguagePracticeEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  languagePracticeLanding,
  languagePracticeMeta,
} from "@/app/components/AiLandingPage/LanguagePractice/content";

const path = "/tools/ai-language-practice";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function LanguagePracticeLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={languagePracticeMeta.title}
        metaDescription={languagePracticeMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={languagePracticeLanding} tool={<LanguagePracticeEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: languagePracticeMeta.title,
    description: languagePracticeMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
