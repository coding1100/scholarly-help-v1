"use client";

import React, { useState } from "react";
import { Suspense } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import EssayStudio from "@/app/components/AiTools/EssayStudio/EssayStudio";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";

const Page = () => {
  const [flag, setFlag] = useState(false);
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="AI Essay Outline Generator - Scholarly Help"
        metaDescription="Create structured essay outlines in seconds with a free essay outline generator that organizes your thesis, arguments, and supporting points in Essay Studio."
        pageUrl={`${baseUrl}/tools/essay-outline-tool`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <EssayStudio initialStep="outline" />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
