import { FC } from "react";
import { Metadata } from "next";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiSummarizerContent } from "@/app/components/AiLandingPage/AiContent";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";
import ProductSchema from "@/app/components/ProductSchema";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <>
      <ProductSchema
        productTitle="AI Summarizer Tool | Condense Articles & Research Papers Instantly"
        metaDescription="Turn long chapters, PDFs, notes, or articles into clear, concise summaries. Save study time and capture main ideas quickly with our intelligent AI summarizer."
        pageUrl={`${normalizedBaseUrl}/tools/ai-summarizer`}
      />
      {/* <ThemeToggle /> */}

      <AiHero
        heroContent={AiSummarizerContent.heroContent}
        imgSection={AiSummarizerContent.imgSection}
      />
      <AiTrust trustSection={AiSummarizerContent.trustSection} />
      <KeyFeatures featuresSection={AiSummarizerContent.featuresSection} />
      <AiMission
        missionSection={AiSummarizerContent.missionSection}
        guideSection={AiSummarizerContent.guideSection}
      />
      <AiFaq FaqSestion={AiSummarizerContent.FaqSestion} />
      <ElevateWriting elevateSection={AiSummarizerContent.elevateSection} />
    </>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-summarizer`;

  return {
    title: "AI Summarizer Tool | Condense Articles & Research Papers Instantly",
    description:
      "Turn long chapters, PDFs, notes, or articles into clear, concise summaries. Save study time and capture main ideas quickly with our intelligent AI summarizer.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
