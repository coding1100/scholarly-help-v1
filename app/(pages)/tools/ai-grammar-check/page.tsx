import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import GrammarCheckerTool from "@/app/components/AiTools/GrammarCheckerTool/GrammarCheckerTool";
import {
  grammarCheckerLanding,
  grammarCheckerMeta,
} from "@/app/components/AiLandingPage/GrammarChecker/content";

const path = "/tools/ai-grammar-check";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function GrammarCheckerLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={grammarCheckerMeta.title}
        metaDescription={grammarCheckerMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate
        content={grammarCheckerLanding}
        tool={<GrammarCheckerTool embedded />}
      />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: grammarCheckerMeta.title,
    description: grammarCheckerMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
