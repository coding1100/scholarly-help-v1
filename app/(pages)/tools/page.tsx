import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import ToolsGrid from "@/app/components/ToolsGrid/ToolsGrid";
import { FC } from "react";
import { content } from "./content";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import Ratings from "@/app/components/LandingPage/Ratings";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  return (
    <MainLayout>
      <HeroSection />
      <Ratings />
      <ToolsGrid
        mainHeading={content.conversionTools.mainheading}
        content={content.conversionTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.algebraTools.mainheading}
        content={content.algebraTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.physicsTools.mainheading}
        content={content.physicsTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.chemistryTools.mainheading}
        content={content.chemistryTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.writingTools.mainheading}
        content={content.writingTools.toolsContent}
      />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.tools.url}`;
  return {
    title: `${MetaData.tools.title}`,
    description: `${MetaData.tools.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
