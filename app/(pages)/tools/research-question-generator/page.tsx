import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import ResearchQuestionHeroTool from "@/app/components/AiLandingPage/ResearchQuestionGenerator/ResearchQuestionHeroTool";
import {
  researchQuestionLanding,
  researchQuestionMeta,
} from "@/app/components/AiLandingPage/ResearchQuestionGenerator/content";

const path = "/tools/research-question-generator";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function ResearchQuestionLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={researchQuestionMeta.title}
        metaDescription={researchQuestionMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate
        content={researchQuestionLanding}
        tool={<ResearchQuestionHeroTool />}
      />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: researchQuestionMeta.title,
    description: researchQuestionMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
