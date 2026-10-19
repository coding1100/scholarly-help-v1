import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import StudyToolEmbed from "@/app/components/AiLandingPage/StudyWorkspace/StudyToolEmbed";
import { studyWorkspaceLanding } from "@/app/components/AiLandingPage/StudyWorkspace/content";
import ProductSchema from "@/app/components/ProductSchema";

const TITLE = "Free AI Study Tools to Study Smarter | ScholarlyHelp";
const DESCRIPTION =
  "Prepare for class with free AI study tools for notes, summaries, flashcards, quizzes, and tutoring. Get study support all in one place. Study smarter.";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle={TITLE}
        metaDescription={DESCRIPTION}
        pageUrl={`${normalizedBaseUrl}/tools/ai-study-workspace`}
      />
      <LandingTemplate content={studyWorkspaceLanding} tool={<StudyToolEmbed />} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-study-workspace`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
