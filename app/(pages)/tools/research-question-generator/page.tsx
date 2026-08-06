import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingHero from "@/app/components/AiLandingPage/ToolLanding/LandingHero";
import UseCases from "@/app/components/AiLandingPage/ToolLanding/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/ToolLanding/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/ToolLanding/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/ToolLanding/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/ToolLanding/TwoWays";
import StudentReviews from "@/app/components/AiLandingPage/ToolLanding/StudentReviews";
import LandingFaq from "@/app/components/AiLandingPage/ToolLanding/LandingFaq";
import FooterCta from "@/app/components/AiLandingPage/ToolLanding/FooterCta";
import ResearchQuestionHeroTool from "@/app/components/AiLandingPage/ResearchQuestionGenerator/ResearchQuestionHeroTool";
import {
  heroContent,
  useCasesContent,
  howItWorksContent,
  whyItWorksContent,
  watchVideoContent,
  twoWaysContent,
  reviewsContent,
  faqContent,
  footerCtaContent,
} from "@/app/components/AiLandingPage/ResearchQuestionGenerator/content";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Free Research Question Generator | ScholarlyHelp"
        metaDescription="Turn any topic into focused research questions with the free ScholarlyHelp research question generator."
        pageUrl={`${normalizedBaseUrl}/tools/research-question-generator`}
      />
      <div className="font-poppins">
        <LandingHero
          content={heroContent}
          toolAnchorId="research-question-tool"
        >
          <ResearchQuestionHeroTool />
        </LandingHero>
        <UseCases content={useCasesContent} />
        <HowItWorks content={howItWorksContent} />
        <WhyItWorks content={whyItWorksContent} />
        <WatchVideo content={watchVideoContent} />
        <TwoWays content={twoWaysContent} />
        <StudentReviews content={reviewsContent} />
        <LandingFaq content={faqContent} />
        <FooterCta content={footerCtaContent} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/research-question-generator`;

  return {
    title: "Free Research Question Generator | ScholarlyHelp",
    description:
      "Turn any topic into focused research questions with the free ScholarlyHelp research question generator.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
