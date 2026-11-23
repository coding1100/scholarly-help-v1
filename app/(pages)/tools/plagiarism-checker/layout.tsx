import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Plagiarism Checker | ScholarlyHelp",
  description:
    "Check your paper against web and academic sources with a free plagiarism checker. Find matching text, review source links, and check your paper.",
  robots: { index: false, follow: true },
};

export default function PlagiarismCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
