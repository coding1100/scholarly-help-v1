"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import CollegeGpaCalculator from "@/app/components/AiTools/CgpaTool/CollegeGpaCalculator";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

export default function CgpaCalculatorPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="CGPA Calculator - Scholarly Help"
        metaDescription="Calculate your CGPA and GPA instantly with a free CGPA calculator for students. Add courses, credits, and grades to track your academic performance."
        pageUrl={`${baseUrl}/tools/cgpa-calculator`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <CollegeGpaCalculator />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
