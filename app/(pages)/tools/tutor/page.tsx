"use client";

import TutorFlow from "@/app/components/AiTools/Tutor/TutorFlow";
import { ChatProvider } from "@/app/context/ChatContext";
import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import AIParaphraser from "@/app/components/AiTools/AIParaphraser-tool";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function TutorPage() {
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
        productTitle="AI Tutor - Scholarly Help"
        metaDescription="Get instant, step-by-step help on any subject from Scholarly Help's AI tutor."
        pageUrl={`${baseUrl}/tools/tutor`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ChatProvider>
          <ToolWithExplore>
            <div className="">
              <TutorFlow />
            </div>
          </ToolWithExplore>
        </ChatProvider>
      </ToolsLayout>
    </Suspense>
  );
}
