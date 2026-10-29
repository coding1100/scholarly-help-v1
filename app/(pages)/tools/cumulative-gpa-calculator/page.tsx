import type { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import LandingTemplate from "@/app/components/AiLandingPage/Template/LandingTemplate";
import CollegeGpaCalculator from "@/app/components/AiTools/CgpaTool/CollegeGpaCalculator";
import {
  cgpaCalculatorLanding,
  metaContent,
} from "@/app/components/AiLandingPage/CgpaCalculator/content";

const path = "/tools/cumulative-gpa-calculator";

const getBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export default function CumulativeGpaCalculatorLandingPage() {
  return (
    <MainLayout>
      <ProductSchema
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${getBaseUrl()}${path}`}
      />
      <LandingTemplate
        content={cgpaCalculatorLanding}
        tool={<CollegeGpaCalculator embedded />}
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
