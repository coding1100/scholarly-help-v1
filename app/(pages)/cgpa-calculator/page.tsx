import { FC } from "react";
import { Metadata } from "next";
import AiHero from "@/app/components/AiLandingPage/AiHero";
// import AiTrust from "@/app/components/AiLandingPage/AITrust";
// import KeyFeatures from "@/app/components/AiLandingPage/KeyFeatures";
// import AiMission from "@/app/components/AiLandingPage/AiMission";
// import AiFaq from "@/app/components/AiLandingPage/AiFaq";
// import ElevateWriting from "@/app/components/AiLandingPage/ElevateWriting";
import { CgpaCalculatorContent } from "@/app/components/AiLandingPage/AiContent";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  return (
    <>
      {/* <ThemeToggle /> */}

      <AiHero
        heroContent={CgpaCalculatorContent.heroContent}
        imgSection={CgpaCalculatorContent.imgSection}
      />

      {/* <AiTrust trustSection={CgpaCalculatorContent.trustSection} />
      <KeyFeatures featuresSection={CgpaCalculatorContent.featuresSection} />
      <AiMission
        missionSection={CgpaCalculatorContent.missionSection}
        guideSection={CgpaCalculatorContent.guideSection}
      />
      <AiFaq FaqSestion={CgpaCalculatorContent.FaqSestion} />
      <ElevateWriting elevateSection={CgpaCalculatorContent.elevateSection} /> */}
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
  const canonicalUrl = `${normalizedBaseUrl}/cgpa-calculator`;

  return {
    title: "CGPA Calculator | Calculate GPA & Track Academic Progress",
    description:
      "Calculate your semester GPA and CGPA with Scholarly Help's easy academic calculator. Add courses, credits, and grades to track your academic progress.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
