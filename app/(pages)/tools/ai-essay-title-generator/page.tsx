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
import EssayTitleHeroTool from "@/app/components/AiLandingPage/EssayTitleGenerator/EssayTitleHeroTool";
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
} from "@/app/components/AiLandingPage/EssayTitleGenerator/content";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Free Essay Title Generator | ScholarlyHelp"
        metaDescription="Use the free ScholarlyHelp essay title generator to get strong, relevant titles in seconds. Enter your topic and pick your favorite."
        pageUrl={`${normalizedBaseUrl}/tools/ai-essay-title-generator`}
      />
      <div className="font-poppins">
        <LandingHero content={heroContent} toolAnchorId="essay-title-tool">
          <EssayTitleHeroTool />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-essay-title-generator`;

  return {
    title: "Free Essay Title Generator | ScholarlyHelp",
    description:
      "Use the free ScholarlyHelp essay title generator to get strong, relevant titles in seconds. Enter your topic and pick your favorite.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
