import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import ParaphraserToolEmbed from "@/app/components/AiLandingPage/Paraphraser/ParaphraserToolEmbed";
import { paraphraserLanding } from "@/app/components/AiLandingPage/Paraphraser/content";
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
        productTitle="Free AI Paraphrasing Tool Rewrite Text | ScholarlyHelp"
        metaDescription="Rewrite text with ScholarlyHelp’s free paraphrasing tool. Choose a style, keep your meaning, and create clear, natural wording. Start paraphrasing today."
        pageUrl={`${normalizedBaseUrl}/tools/ai-paraphraser`}
      />
      <LandingTemplate content={paraphraserLanding} tool={<ParaphraserToolEmbed />} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-paraphraser`;

  return {
    title: "Free AI Paraphrasing Tool Rewrite Text | ScholarlyHelp",
    description:
      "Rewrite text with ScholarlyHelp’s free paraphrasing tool. Choose a style, keep your meaning, and create clear, natural wording. Start paraphrasing today.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
