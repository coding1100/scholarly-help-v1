import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import EssayGeneratorToolEmbed from "@/app/components/AiLandingPage/EssayGenerator/EssayGeneratorToolEmbed";
import { essayGeneratorLanding, metaContent } from "@/app/components/AiLandingPage/EssayGenerator/content";
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
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${normalizedBaseUrl}/tools/ai-essay-generator`}
      />
      <LandingTemplate content={essayGeneratorLanding} tool={<EssayGeneratorToolEmbed />} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-essay-generator`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
