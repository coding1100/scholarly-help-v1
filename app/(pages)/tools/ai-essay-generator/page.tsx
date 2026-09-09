import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import EssayGeneratorHero from "@/app/components/AiLandingPage/EssayGenerator/EssayGeneratorHero";
import BeforeAfter from "@/app/components/AiLandingPage/EssayGenerator/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/EssayGenerator/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/EssayGenerator/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/EssayGenerator/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/EssayGenerator/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/EssayGenerator/TwoWays";
import ExpertBanner from "@/app/components/AiLandingPage/EssayGenerator/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/EssayGenerator/StudentReviews";
import EssayGeneratorFaq from "@/app/components/AiLandingPage/EssayGenerator/EssayGeneratorFaq";
import FooterCta from "@/app/components/AiLandingPage/EssayGenerator/FooterCta";
import ProductSchema from "@/app/components/ProductSchema";
import { metaContent } from "@/app/components/AiLandingPage/EssayGenerator/content";

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
        pageUrl={`${normalizedBaseUrl}/tools/ai-essay-generator`}
      />
      <div className="font-poppins">
        <EssayGeneratorHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WatchVideo />
        <WhyItWorks />
        <TwoWays />
        <ExpertBanner />
        <StudentReviews />
        <EssayGeneratorFaq />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-essay-generator`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
