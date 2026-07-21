"use client";

import { Suspense, useState } from "react";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ExamPrepFlow from "@/app/components/AiTools/ExamPrep/ExamPrepFlow";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function ExamPrepPage() {
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
        productTitle="Exam Prep Tool - Scholarly Help"
        metaDescription="Prepare for exams with an AI-powered study tool that builds practice questions, flashcards, and study plans from your course material."
        pageUrl={`${baseUrl}/tools/exam-prep`}
      />
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <ExamPrepFlow />
        </ToolWithExplore>
      </ToolsLayout>
    </Suspense>
  );
}
