import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import {
  mathSolverLanding,
  mathSolverMeta,
} from "@/app/components/AiLandingPage/MathSolver/content";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import { MathSolverEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import SampleProblemLink from "@/app/components/AiLandingPage/MathSolver/SampleProblemLink";

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
      <LandingTemplate
        content={mathSolverLanding}
        tool={<MathSolverEmbed />}
        heroExtra={<SampleProblemLink />}
      />
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
