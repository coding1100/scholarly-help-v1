import { FC } from "react";
import { MetaData } from "@/app/metadata/metadata";
import AiHero from "@/app/components/AiLandingPage/AiHero";
import AiTrust from "@/app/components/AiLandingPage/AITrust";
import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
import AiMission from "@/app/components/AiLandingPage/AiMission";
import AiFaq from "@/app/components/AiLandingPage/AiFaq";
import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { AiEssayContent } from "@/app/components/AiLandingPage/AiContent";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <>
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
