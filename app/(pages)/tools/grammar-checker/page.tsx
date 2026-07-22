"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import GrammarCheckerTool from "@/app/components/AiTools/GrammarCheckerTool/GrammarCheckerTool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

export default function GrammarCheckerPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Grammar Checker - Scholarly Help"
        metaDescription="Check your writing for grammar, tense, clarity, and tone issues with inline explanations, one-click fixes, and a downloadable performance report."
        pageUrl={`${baseUrl}/tools/grammar-checker`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <GrammarCheckerTool />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
