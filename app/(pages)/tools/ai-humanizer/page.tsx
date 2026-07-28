import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import HumanizerHero from "@/app/components/AiLandingPage/Humanizer/HumanizerHero";
import BeforeAfter from "@/app/components/AiLandingPage/Humanizer/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/Humanizer/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/Humanizer/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/Humanizer/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/Humanizer/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/Humanizer/TwoWays";
import ExpertBanner from "@/app/components/AiLandingPage/Humanizer/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/Humanizer/StudentReviews";
import HumanizerFaq from "@/app/components/AiLandingPage/Humanizer/HumanizerFaq";
import FooterCta from "@/app/components/AiLandingPage/Humanizer/FooterCta";
import ProductSchema from "@/app/components/ProductSchema";
import { metaContent } from "@/app/components/AiLandingPage/Humanizer/content";

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
        pageUrl={`${normalizedBaseUrl}/tools/ai-humanizer`}
      />
      <div className="font-poppins">
        <HumanizerHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WatchVideo />
        <WhyItWorks />
        <TwoWays />
        <ExpertBanner />
        <StudentReviews />
        <HumanizerFaq />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-humanizer`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
