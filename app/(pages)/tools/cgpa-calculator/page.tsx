"use client";

import { Suspense } from "react";
import CollegeGpaCalculator from "@/app/components/AiTools/CgpaTool/CollegeGpaCalculator";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ProductSchema from "@/app/components/ProductSchema";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function MathSolverPage() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      <ProductSchema
        productTitle="CGPA Calculator - Scholarly Help"
        metaDescription="Calculate your CGPA and GPA instantly with a free CGPA calculator for students. Add courses, credits, and grades to track your academic performance."
        pageUrl={`${baseUrl}/tools/cgpa-calculator`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <CollegeGpaCalculator />
      <ToolGrid />
    </Suspense>
  );
}
