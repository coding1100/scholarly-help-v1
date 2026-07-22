import { FC } from "react";
import { Metadata } from "next";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiThesisContent } from "@/app/components/AiLandingPage/AiContent";
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
        productTitle="AI Thesis Statement Generator | Create Strong Thesis Statements Free"
        metaDescription="Craft focused, academic thesis statements instantly. Our AI tool analyzes your topic and perspective to build a strong foundation for your research papers and essays."
        pageUrl={`${normalizedBaseUrl}/tools/ai-thesis-generator`}
      />
      {/* <ThemeToggle /> */}

      <AiHero
        heroContent={AiThesisContent.heroContent}
        imgSection={AiThesisContent.imgSection}
      />
      <AiTrust trustSection={AiThesisContent.trustSection} />
      <KeyFeatures featuresSection={AiThesisContent.featuresSection} />
      <AiMission
        missionSection={AiThesisContent.missionSection}
        guideSection={AiThesisContent.guideSection}
      />
      <AiFaq FaqSestion={AiThesisContent.FaqSestion} />
      <ElevateWriting elevateSection={AiThesisContent.elevateSection} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-thesis-generator`;

  return {
    title:
      "AI Thesis Statement Generator | Create Strong Thesis Statements Free",
    description:
      "Craft focused, academic thesis statements instantly. Our AI tool analyzes your topic and perspective to build a strong foundation for your research papers and essays.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
