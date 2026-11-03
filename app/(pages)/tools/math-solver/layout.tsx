import type { Metadata } from "next";

// The workspace is reached from the /tools/ai-math-helper landing page, which
// is the page meant for search, so the workspace is kept out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function MathSolverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
