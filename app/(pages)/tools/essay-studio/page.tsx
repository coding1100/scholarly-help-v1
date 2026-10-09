"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import EssayStudio from "@/app/components/AiTools/EssayStudio/EssayStudio";
import ProductSchema from "@/app/components/ProductSchema";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function Page() {
  const [flag, setFlag] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Essay Studio & Writing Lab | All-in-One Essay Builder"
        metaDescription="Build thesis statements, generate detailed outlines, draft structured essays, and write discussion board posts in one unified studio."
        pageUrl={`${normalizedBaseUrl}/tools/essay-studio`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <EssayStudio />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
