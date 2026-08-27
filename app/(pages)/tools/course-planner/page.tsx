import { Suspense } from "react";
import { Metadata } from "next";
import CoursePlannerPageContent from "./CoursePlannerPageContent";
import ProductSchema from "@/app/components/ProductSchema";

const TITLE = "AI Course Planner & Timetable Scheduler | Scholarly Help";
const DESCRIPTION =
  "Plan your semester schedule with AI syllabus extraction, automated conflict resolution, attendance tracking, and adaptive workload planning.";

export default function CoursePlannerPage() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  return (
    <Suspense fallback={<div className="h-72 animate-pulse bg-slate-100" />}>
      <ProductSchema
        productTitle={TITLE}
        metaDescription={DESCRIPTION}
        pageUrl={`${baseUrl}/tools/course-planner`}
      />
      <CoursePlannerPageContent />
    </Suspense>
  );
}

export function generateMetadata(): Metadata {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const canonicalUrl = `${baseUrl}/tools/course-planner`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
