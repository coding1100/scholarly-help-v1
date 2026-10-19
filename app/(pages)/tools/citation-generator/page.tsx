import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import CitationHeroTool from "@/app/components/AiLandingPage/CitationGenerator/CitationHeroTool";
import { citationGeneratorLanding } from "@/app/components/AiLandingPage/CitationGenerator/content";
import ProductSchema from "@/app/components/ProductSchema";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Free Citation Generator: APA & MLA | ScholarlyHelp"
        metaDescription="Easily create accurate citations with our free citation generator. Obtain APA, MLA, Harvard & Chicago citations from a DOI, URL, PDF or other source."
        pageUrl={`${normalizedBaseUrl}/tools/citation-generator`}
      />
      <LandingTemplate content={citationGeneratorLanding} tool={<CitationHeroTool />} />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/tools/citation-generator`;

  return {
    title: "Free Citation Generator: APA & MLA | ScholarlyHelp",
    description:
      "Easily create accurate citations with our free citation generator. Obtain APA, MLA, Harvard & Chicago citations from a DOI, URL, PDF or other source.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
