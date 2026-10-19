import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { CoursePlannerEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  coursePlannerLanding,
  metaContent,
} from "@/app/components/AiLandingPage/CoursePlanner/content";

const pagePath = "/tools/ai-course-planner";

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
        pageUrl={`${normalizedBaseUrl}${pagePath}`}
      />
      <LandingTemplate content={coursePlannerLanding} tool={<CoursePlannerEmbed />} />
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
  const canonicalUrl = `${normalizedBaseUrl}${pagePath}`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
