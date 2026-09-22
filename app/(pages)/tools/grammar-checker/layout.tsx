import type { Metadata } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "AI Grammar Checker for Students: Free | ScholarlyHelp",
  description:
    "Check grammar, spelling, punctuation, and clarity with a free AI grammar checker. Review corrections and explanations as you edit. Improve your writing.",
  alternates: {
    canonical: `${baseUrl}/tools/grammar-checker`,
  },
};

export default function GrammarCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
