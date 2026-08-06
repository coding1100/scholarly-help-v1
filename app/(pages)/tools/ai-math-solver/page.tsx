import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import {
  mathSolverContent,
  mathSolverMeta,
} from "@/app/components/AiLandingPage/MathSolver/content";
import ToolLanding from "@/app/components/AiLandingPage/ToolLanding/ToolLanding";
import { MathSolverEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";

const path = "/tools/ai-math-solver";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function MathSolverLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={mathSolverMeta.title}
        metaDescription={mathSolverMeta.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <ToolLanding content={mathSolverContent} tool={<MathSolverEmbed />} />
    </MainLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: mathSolverMeta.title,
    description: mathSolverMeta.description,
    alternates: { canonical: `${getBaseUrl()}${path}` },
  };
}
