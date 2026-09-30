import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import {
  mathSolverContent,
  mathSolverMeta,
} from "@/app/components/AiLandingPage/MathSolver/content";
import ToolLanding from "@/app/components/AiLandingPage/ToolLanding/ToolLanding";
import { MathSolverEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
<<<<<<< HEAD
=======
import MathSolverHero from "@/app/components/AiLandingPage/MathSolver/MathSolverHero";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

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
<<<<<<< HEAD
      <ToolLanding content={mathSolverContent} tool={<MathSolverEmbed />} />
=======
      <ToolLanding
        content={mathSolverContent}
        tool={<MathSolverEmbed />}
        hero={<MathSolverHero />}
      />
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
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
