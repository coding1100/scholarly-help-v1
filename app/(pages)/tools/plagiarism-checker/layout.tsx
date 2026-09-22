import type { Metadata } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Free Plagiarism Checker | ScholarlyHelp",
  description:
    "Check your paper against web and academic sources with a free plagiarism checker. Find matching text, review source links, and check your paper.",
  alternates: {
    canonical: `${baseUrl}/tools/plagiarism-checker`,
  },
};

export default function PlagiarismCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
