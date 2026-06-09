import { FC } from "react";
import { Metadata } from "next";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiAcademicResearchContent } from "@/app/components/AiLandingPage/AiContent";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  return (
    <>
      {/* <ThemeToggle /> */}

      <AiHero
        heroContent={AiAcademicResearchContent.heroContent}
        imgSection={AiAcademicResearchContent.imgSection}
      />
      <AiTrust trustSection={AiAcademicResearchContent.trustSection} />
      <KeyFeatures featuresSection={AiAcademicResearchContent.featuresSection} />
      <AiMission
        missionSection={AiAcademicResearchContent.missionSection}
        guideSection={AiAcademicResearchContent.guideSection}
      />
      <AiFaq FaqSestion={AiAcademicResearchContent.FaqSestion} />
      <ElevateWriting elevateSection={AiAcademicResearchContent.elevateSection} />
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
  const canonicalUrl = `${normalizedBaseUrl}/ai-academic-research`;

  return {
    title: "AI Academic Research Assistant | Scholarly Academic Research",
    description:
      "Use Scholarly academic research to explore sources, organize notes, write stronger academic drafts, and prepare citation-ready research with confidence.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
