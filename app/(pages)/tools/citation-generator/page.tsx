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
        productTitle="Free Citation Generator: APA & MLA | ScholarlyHelp"
        metaDescription="Easily create accurate citations with our free citation generator. Obtain APA, MLA, Harvard & Chicago citations from a DOI, URL, PDF or other source."
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
    title: "Free Citation Generator: APA & MLA | ScholarlyHelp",
    description:
      "Easily create accurate citations with our free citation generator. Obtain APA, MLA, Harvard & Chicago citations from a DOI, URL, PDF or other source.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
