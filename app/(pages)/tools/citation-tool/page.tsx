"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import CitationTool from "@/app/components/AiTools/CitationTool/CitationTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function CitationPage() {
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
        productTitle="Citation Generator - Scholarly Help"
        metaDescription="Generate accurate citations in APA, MLA, Chicago, and more with a free citation generator for books, journals, websites, and other sources."
        pageUrl={`${baseUrl}/tools/citation-tool`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <CitationTool setFlag={setFlag} />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
