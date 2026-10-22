import type { Metadata } from "next";

// The tool workspace. /tools/ai-essay-generator/ is its indexable landing page.
export const metadata: Metadata = {
  title: "AI Essay Generator | ScholarlyHelp",
  robots: { index: false, follow: true },
};

export default function EssayGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
