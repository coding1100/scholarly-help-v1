"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import EssayStudio from "@/app/components/AiTools/EssayStudio/EssayStudio";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

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
        productTitle="AI Thesis Statement Generator - Scholarly Help"
        metaDescription="Generate clear, arguable thesis statements for your essays and research papers in Essay Studio."
        pageUrl={`${baseUrl}/tools/thesis-generator-tool`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <EssayStudio initialStep="thesis" />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
