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
import { MathSolverContent } from "@/app/components/AiLandingPage/AiContent";
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
        productTitle="Math Solver for Triangle Calculations"
        metaDescription="Solve Pythagorean theorem problems instantly. Scholarly AI Math Solver provides fast, accurate right triangle solutions. Start solving now."
        pageUrl={`${normalizedBaseUrl}/math-solver`}
      />
      {/* <ThemeToggle /> */}
      <AiHero
        heroContent={MathSolverContent.heroContent}
        imgSection={MathSolverContent.imgSection}
      />
      <AiTrust trustSection={MathSolverContent.trustSection} />
      <KeyFeatures featuresSection={MathSolverContent.featuresSection} />
      <AiMission
        missionSection={MathSolverContent.missionSection}
        guideSection={MathSolverContent.guideSection}
      />
      <AiFaq FaqSestion={MathSolverContent.FaqSestion} />
      <ElevateWriting elevateSection={MathSolverContent.elevateSection} />
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
  const canonicalUrl = `${normalizedBaseUrl}/math-solver`;

  return {
    title: "Math Solver for Triangle Calculations",
    description:
      "Solve Pythagorean theorem problems instantly. Scholarly AI Math Solver provides fast, accurate right triangle solutions. Start solving now.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
