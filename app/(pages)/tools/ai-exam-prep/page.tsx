import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { ExamPrepEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import {
  examPrepLanding,
  examPrepMeta,
} from "@/app/components/AiLandingPage/ExamPrep/content";

const path = "/tools/ai-exam-prep";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function ExamPrepLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={examPrepMeta.title}
        metaDescription={examPrepMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate content={examPrepLanding} tool={<ExamPrepEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: examPrepMeta.title,
    description: examPrepMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
