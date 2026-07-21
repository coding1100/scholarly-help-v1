import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ParaphraserHero from "@/app/components/AiLandingPage/Paraphraser/ParaphraserHero";
import BeforeAfter from "@/app/components/AiLandingPage/Paraphraser/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/Paraphraser/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/Paraphraser/HowItWorks";
import WatchVideo from "@/app/components/AiLandingPage/Paraphraser/WatchVideo";
import WhyItWorks from "@/app/components/AiLandingPage/Paraphraser/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/Paraphraser/TwoWays";
import ExpertBanner from "@/app/components/AiLandingPage/Paraphraser/ExpertBanner";
import StudentReviews from "@/app/components/AiLandingPage/Paraphraser/StudentReviews";
import ParaphraserFaq from "@/app/components/AiLandingPage/Paraphraser/ParaphraserFaq";
import FooterCta from "@/app/components/AiLandingPage/Paraphraser/FooterCta";

const Page: FC = () => {
  return (
    <MainLayout>
      <div className="font-poppins">
        <ParaphraserHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WatchVideo />
        <WhyItWorks />
        <TwoWays />
        <ExpertBanner />
        <StudentReviews />
        <ParaphraserFaq />
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
  const canonicalUrl = `${normalizedBaseUrl}/ai-paraphraser`;

  return {
    title: "Free Paraphrasing Tool | ScholarlyHelp",
    description:
      "Use the free ScholarlyHelp’s paraphrasing tool to rewrite any text in seconds. Choose your style, keep your meaning, and just copy and paste it.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
