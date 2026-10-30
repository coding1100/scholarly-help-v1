import type { Metadata } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
).replace(/\/$/, "");

// The workspace shares the landing page's tool, so search engines are pointed
// at the landing page instead of indexing both.
export const metadata: Metadata = {
  title: "Read My Essay Tool: Free Text-to-Speech | ScholarlyHelp",
  description:
    "Paste your essay and listen to it read aloud. Choose a voice and language, adjust speed and pitch, and follow each word as it is spoken.",
  alternates: {
    canonical: `${baseUrl}/tools/read-my-essay`,
  },
};

export default function ReadMyEssayToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
