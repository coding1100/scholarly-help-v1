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
import { CitationGeneratorContent } from "@/app/components/AiLandingPage/AiContent";
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
        productTitle="AI Citation Generator | Free APA, MLA, Chicago & More"
        metaDescription="Generate accurate citations instantly with Scholarly AI. Free citation generator for APA, MLA, Chicago, Turabian, and other formats. Reduce errors and save time."
        pageUrl={`${normalizedBaseUrl}/citation-generator`}
      />
      {/* <ThemeToggle /> */}
      <AiHero
        heroContent={CitationGeneratorContent.heroContent}
        imgSection={CitationGeneratorContent.imgSection}
      />
      <AiTrust trustSection={CitationGeneratorContent.trustSection} />
      <KeyFeatures featuresSection={CitationGeneratorContent.featuresSection} />
      <AiMission
        missionSection={CitationGeneratorContent.missionSection}
        guideSection={CitationGeneratorContent.guideSection}
      />
      <AiFaq FaqSestion={CitationGeneratorContent.FaqSestion} />
      <ElevateWriting
        elevateSection={CitationGeneratorContent.elevateSection}
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
  const canonicalUrl = `${normalizedBaseUrl}/citation-generator`;

  return {
    title: "AI Citation Generator | Free APA, MLA, Chicago & More",
    description:
      "Generate accurate citations instantly with Scholarly AI. Free citation generator for APA, MLA, Chicago, Turabian, and other formats. Reduce errors and save time.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
