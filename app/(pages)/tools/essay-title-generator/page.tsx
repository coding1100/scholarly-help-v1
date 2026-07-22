import { FC } from "react";
import { Metadata } from "next";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { EssayTitleGeneratorContent } from "@/app/components/AiLandingPage/AiContent";
import ProductSchema from "@/app/components/ProductSchema";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <>
      <ProductSchema
        productTitle="AI Essay Title Generator for Research & Assignments"
        metaDescription="Make a strong first impression with the right essay title. Scholarly AI helps students generate accurate, academic-ready essay titles quickly. Try it for free."
        pageUrl={`${normalizedBaseUrl}/essay-title-generator`}
      />
      {/* <ThemeToggle /> */}
      <AiHero
        heroContent={EssayTitleGeneratorContent.heroContent}
        imgSection={EssayTitleGeneratorContent.imgSection}
      />
      <AiTrust trustSection={EssayTitleGeneratorContent.trustSection} />
      <KeyFeatures
        featuresSection={EssayTitleGeneratorContent.featuresSection}
      />
      <AiMission
        missionSection={EssayTitleGeneratorContent.missionSection}
        guideSection={EssayTitleGeneratorContent.guideSection}
      />
      <AiFaq FaqSestion={EssayTitleGeneratorContent.FaqSestion} />
      <ElevateWriting
        elevateSection={EssayTitleGeneratorContent.elevateSection}
      />
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
  const canonicalUrl = `${normalizedBaseUrl}/essay-title-generator`;

  return {
    title: "AI Essay Title Generator for Research & Assignments",
    description:
      "Make a strong first impression with the right essay title. Scholarly AI helps students generate accurate, academic-ready essay titles quickly. Try it for free.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
