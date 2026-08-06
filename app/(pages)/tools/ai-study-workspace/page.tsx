import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import StudyHero from "@/app/components/AiLandingPage/StudyWorkspace/StudyHero";
import BeforeAfter from "@/app/components/AiLandingPage/StudyWorkspace/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/StudyWorkspace/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/StudyWorkspace/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/StudyWorkspace/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/StudyWorkspace/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/StudyWorkspace/TwoWays";
import ExpertBanner from "@/app/components/AiLandingPage/StudyWorkspace/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/StudyWorkspace/StudentReviews";
import StudyFaq from "@/app/components/AiLandingPage/StudyWorkspace/StudyFaq";
import FooterCta from "@/app/components/AiLandingPage/StudyWorkspace/FooterCta";
import ProductSchema from "@/app/components/ProductSchema";

const TITLE = "Free AI Study Tools | ScholarlyHelp Workspace";
const DESCRIPTION =
  "Upload any material to get AI notes, flashcards, quizzes and a 24/7 AI tutor in one place. Try the free AI study workspace today.";

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
      <div className="font-poppins">
        <StudyHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WatchVideo />
        <WhyItWorks />
        <TwoWays />
        <ExpertBanner />
        <StudentReviews />
        <StudyFaq />
        <FooterCta />
      </div>
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
