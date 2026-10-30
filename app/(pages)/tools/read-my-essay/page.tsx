import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import ReadMyEssayTool from "@/app/components/AiTools/ReadMyEssay/ReadMyEssayTool";
import {
  metaContent,
  readMyEssayLanding,
} from "@/app/components/AiLandingPage/ReadMyEssay/content";

const path = "/tools/read-my-essay";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function ReadMyEssayLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate
        content={readMyEssayLanding}
        tool={<ReadMyEssayTool embedded />}
      />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
