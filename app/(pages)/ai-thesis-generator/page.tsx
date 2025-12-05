import { FC } from "react";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiThesisContent } from "@/app/components/AiLandingPage/AiContent";
import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <>
      <ThemeToggle />

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
