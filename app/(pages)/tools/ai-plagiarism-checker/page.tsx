import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { PlagiarismCheckerEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  plagiarismCheckerLanding,
  plagiarismCheckerMeta,
} from "@/app/components/AiLandingPage/PlagiarismChecker/content";

const path = "/tools/ai-plagiarism-checker";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function PlagiarismCheckerLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={plagiarismCheckerMeta.title}
        metaDescription={plagiarismCheckerMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={plagiarismCheckerLanding} tool={<PlagiarismCheckerEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: plagiarismCheckerMeta.title,
    description: plagiarismCheckerMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
