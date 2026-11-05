import type { Metadata } from "next";

// The workspace is reached from the /tools/ai-exam-prep landing page, which
// is the page meant for search, so the workspace is kept out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ExamPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
