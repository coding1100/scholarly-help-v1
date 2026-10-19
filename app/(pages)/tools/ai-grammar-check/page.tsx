import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import GrammarCheckerTool from "@/app/components/AiTools/GrammarCheckerTool/GrammarCheckerTool";
import { grammarCheckerLanding, metaContent } from "@/app/components/AiLandingPage/GrammarChecker/content";
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
        pageUrl={`${normalizedBaseUrl}/tools/ai-grammar-check`}
      />
      <LandingTemplate content={grammarCheckerLanding} tool={<GrammarCheckerTool />} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-grammar-check`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
