import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import ResearchQuestionHeroTool from "@/app/components/AiLandingPage/ResearchQuestionGenerator/ResearchQuestionHeroTool";
import { researchQuestionLanding } from "@/app/components/AiLandingPage/ResearchQuestionGenerator/content";
import ProductSchema from "@/app/components/ProductSchema";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Research Question Generator | ScholarlyHelp Free Tools"
        metaDescription="Create focused research questions from any topic with our free AI tool for essays, papers, theses & academic research. Generate better questions today."
        pageUrl={`${normalizedBaseUrl}/tools/research-question-generator`}
      />
      <LandingTemplate content={researchQuestionLanding} tool={<ResearchQuestionHeroTool />} />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/tools/research-question-generator`;

  return {
    title: "Research Question Generator | ScholarlyHelp Free Tools",
    description:
      "Create focused research questions from any topic with our free AI tool for essays, papers, theses & academic research. Generate better questions today.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
