import type { Metadata } from "next";

const baseUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "AI Detector: Free & Online | ScholarlyHelp",
  description:
    "Wondering if your writing may be AI-generated? An AI detector highlights patterns to help you assess whether text appears AI, human, or mixed. Check it.",
  alternates: {
    canonical: `${baseUrl}/tools/ai-detector-tool`,
  },
};

export default function AiDetectorToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
