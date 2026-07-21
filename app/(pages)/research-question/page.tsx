import { FC } from "react";
import { Metadata } from "next";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";
import { ResearchQuestionContent } from "@/app/components/AiLandingPage/AiContent";
import ProductSchema from "@/app/components/ProductSchema";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  // return <div>test</div>
  return (
    <>
      <ProductSchema
        productTitle="Research Question Generator for Papers & Thesis"
        metaDescription="Not sure how to frame your research question? Scholarly AI research question generator helps students create research-ready questions in seconds. Start generating questions for free."
        pageUrl={`${normalizedBaseUrl}/research-question`}
      />
      {/* <ThemeToggle /> */}
      <AiHero
        heroContent={ResearchQuestionContent.heroContent}
        imgSection={ResearchQuestionContent.imgSection}
      />
      <AiTrust trustSection={ResearchQuestionContent.trustSection} />
      <KeyFeatures featuresSection={ResearchQuestionContent.featuresSection} />
      <AiMission
        missionSection={ResearchQuestionContent.missionSection}
        guideSection={ResearchQuestionContent.guideSection}
      />
      <AiFaq FaqSestion={ResearchQuestionContent.FaqSestion} />
      <ElevateWriting elevateSection={ResearchQuestionContent.elevateSection} />
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
  const canonicalUrl = `${normalizedBaseUrl}/research-question`;

  return {
    title: "Research Question Generator for Papers & Thesis",
    description:
      "Not sure how to frame your research question? Scholarly AI research question generator helps students create research-ready questions in seconds. Start generating questions for free.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
