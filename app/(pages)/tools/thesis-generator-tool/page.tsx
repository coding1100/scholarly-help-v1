"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ThesisGenerator from "@/app/components/AiTools/ThesisGenerator-tool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

const Page = () => {
  const [flag, setFlag] = useState<boolean>(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Thesis Statement Generator - Scholarly Help"
        metaDescription="Generate clear, arguable thesis statements for your essays and research papers with Scholarly Help's AI tool."
        pageUrl={`${baseUrl}/tools/thesis-generator-tool`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <ThesisGenerator />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
