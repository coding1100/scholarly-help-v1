import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import HumanizerToolEmbed from "@/app/components/AiLandingPage/Humanizer/HumanizerToolEmbed";
import { humanizerLanding, metaContent } from "@/app/components/AiLandingPage/Humanizer/content";
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
        pageUrl={`${normalizedBaseUrl}/tools/ai-humanizer`}
      />
      <LandingTemplate content={humanizerLanding} tool={<HumanizerToolEmbed />} />
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
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-humanizer`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
