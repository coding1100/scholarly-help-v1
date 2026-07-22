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
import { AiEssayContent } from "@/app/components/AiLandingPage/AiContent";
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
        productTitle="Free AI Essay Generator | Write High-Quality Essays Instantly"
        metaDescription="Create structured, high-quality essays in minutes with our intelligent AI essay builder. Perfect for academic practice, reflections, and coursework assignments."
        pageUrl={`${normalizedBaseUrl}/tools/ai-essay-generator`}
      />
      {/* <ThemeToggle /> */}
      <AiHero
        heroContent={AiEssayContent.heroContent}
        imgSection={AiEssayContent.imgSection}
      />
      <AiTrust trustSection={AiEssayContent.trustSection} />
      <KeyFeatures featuresSection={AiEssayContent.featuresSection} />
      <AiMission
        missionSection={AiEssayContent.missionSection}
        guideSection={AiEssayContent.guideSection}
      />
      <AiFaq FaqSestion={AiEssayContent.FaqSestion} />
      <ElevateWriting elevateSection={AiEssayContent.elevateSection} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-essay-generator`;

  return {
    title: "Free AI Essay Generator | Write High-Quality Essays Instantly",
    description:
      "Create structured, high-quality essays in minutes with our intelligent AI essay builder. Perfect for academic practice, reflections, and coursework assignments.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
