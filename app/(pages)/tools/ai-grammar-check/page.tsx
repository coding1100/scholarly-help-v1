import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import GrammarCheckerHero from "@/app/components/AiLandingPage/GrammarChecker/GrammarCheckerHero";
import BeforeAfter from "@/app/components/AiLandingPage/GrammarChecker/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/GrammarChecker/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/GrammarChecker/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/GrammarChecker/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/GrammarChecker/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/GrammarChecker/TwoWays";
import ExpertBanner from "@/app/components/AiLandingPage/GrammarChecker/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/GrammarChecker/StudentReviews";
import GrammarCheckerFaq from "@/app/components/AiLandingPage/GrammarChecker/GrammarCheckerFaq";
import FooterCta from "@/app/components/AiLandingPage/GrammarChecker/FooterCta";
import ProductSchema from "@/app/components/ProductSchema";
import { metaContent } from "@/app/components/AiLandingPage/GrammarChecker/content";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  return (
    <MainLayout>
      <ProductSchema
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${normalizedBaseUrl}/tools/ai-grammar-check`}
      />
      <div className="font-poppins">
        <GrammarCheckerHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WatchVideo />
        <WhyItWorks />
        <TwoWays />
        <ExpertBanner />
        <StudentReviews />
        <GrammarCheckerFaq />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-grammar-check`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
