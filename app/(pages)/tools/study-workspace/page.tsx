import { Suspense } from "react";
import type { Metadata } from "next";
import StudyWorkspacePageContent from "./StudyWorkspacePageContent";
import ProductSchema from "@/app/components/ProductSchema";

// The tool workspace. /tools/ai-study-workspace/ is its indexable landing page.
export const metadata: Metadata = {
  title: "AI Study Workspace | ScholarlyHelp",
  robots: { index: false, follow: true },
};

export default function StudyWorkspacePage() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<div className="h-72 animate-pulse bg-gray-200" />}>
      <ProductSchema
        productTitle="AI Tutor - Scholarly Help"
        metaDescription="Organize study materials and learn faster with AI-generated notes, flashcards, quizzes, and tutoring in one workspace."
        pageUrl={`${baseUrl}/tools/study-workspace`}
      />
      <StudyWorkspacePageContent />
    </Suspense>
  );
}
