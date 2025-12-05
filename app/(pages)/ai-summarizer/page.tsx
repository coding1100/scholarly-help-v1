import { FC } from "react";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiSummarizerContent } from "@/app/components/AiLandingPage/AiContent";
import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <>
      <ThemeToggle />

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

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.aboutUs.url}`;
  return {
    title: `${MetaData.aboutUs.title}`,
    description: `${MetaData.aboutUs.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
