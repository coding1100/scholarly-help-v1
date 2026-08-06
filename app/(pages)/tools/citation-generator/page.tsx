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
import ExpertBanner from "@/app/components/AiLandingPage/ToolLanding/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/ToolLanding/StudentReviews";
import LandingFaq from "@/app/components/AiLandingPage/ToolLanding/LandingFaq";
import FooterCta from "@/app/components/AiLandingPage/ToolLanding/FooterCta";
import CitationHeroTool from "@/app/components/AiLandingPage/CitationGenerator/CitationHeroTool";
import {
  heroContent,
  useCasesContent,
  howItWorksContent,
  whyItWorksContent,
  twoWaysContent,
  watchVideoContent,
  expertBannerContent,
  reviewsContent,
  faqContent,
  footerCtaContent,
} from "@/app/components/AiLandingPage/CitationGenerator/content";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Free Citation Generator | ScholarlyHelp"
        metaDescription="Use the free ScholarlyHelp citation generator to make APA, MLA, Harvard and Chicago citations in seconds. Paste a link, get both citations."
        pageUrl={`${normalizedBaseUrl}/tools/citation-generator`}
      />
      <div className="font-poppins">
        <LandingHero content={heroContent} toolAnchorId="citation-tool">
          <CitationHeroTool />
        </LandingHero>
        <UseCases content={useCasesContent} />
        <HowItWorks content={howItWorksContent} />
        <WhyItWorks content={whyItWorksContent} />
        <TwoWays content={twoWaysContent} />
        <WatchVideo content={watchVideoContent} />
        <ExpertBanner content={expertBannerContent} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/citation-generator`;

  return {
    title: "Free Citation Generator | ScholarlyHelp",
    description:
      "Use the free ScholarlyHelp citation generator to make APA, MLA, Harvard and Chicago citations in seconds. Paste a link, get both citations.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
