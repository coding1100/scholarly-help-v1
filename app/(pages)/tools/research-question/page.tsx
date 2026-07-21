"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ResearchQuestion from "@/app/components/AiTools/ResearchQuestion/ResearchQuestion";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function ResearchQuestionPage() {
  const [flag, setFlag] = useState<boolean>(false);
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
        productTitle="Research Question Generator - Scholarly Help"
        metaDescription="Generate focused, well-structured research questions for your papers and studies with Scholarly Help's AI tool."
        pageUrl={`${baseUrl}/tools/research-question`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <ResearchQuestion setFlag={setFlag} />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
