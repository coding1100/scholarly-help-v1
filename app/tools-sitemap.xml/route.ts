// Sitemap for the Tools section, served at /tools-sitemap.xml.
// Lists only public tool pages that return 200, declare a self-referencing
// canonical and are not noindex. Tool workspaces without their own metadata,
// dashboard/account pages and redirecting URLs are deliberately left out.
// Service pages stay in public/sitemap.xml.

const TOOL_PATHS = [
  "/tools/",

  // Tool landing pages
  "/tools/ai-academic-research/",
  "/tools/ai-course-planner/",
  "/tools/ai-detector/",
  "/tools/ai-essay-generator/",
  "/tools/ai-essay-title-generator/",
  "/tools/ai-grammar-check/",
  "/tools/ai-humanizer/",
  "/tools/ai-math-solver/",
  "/tools/ai-paraphraser/",
  "/tools/ai-study-workspace/",
  "/tools/ai-summarizer/",
  "/tools/ai-thesis-generator/",
  "/tools/ai-thesis-statement-generator/",
  "/tools/citation-generator/",
  "/tools/essay-title-generator/",
  "/tools/research-question-generator/",

  // Tool pages with their own canonical metadata
  "/tools/ai-detector-tool/",
  "/tools/cgpa-calculator/",
  "/tools/course-planner/",
  "/tools/grammar-checker/",
  "/tools/miles-to-millimeters/",
  "/tools/plagiarism-checker/",

  // Top-level tool pages
  "/cgpa-calculator/",
  "/math-solver/",
  "/research-question/",
] as const;

export function GET() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com"
  ).replace(/\/$/, "");

  const urls = TOOL_PATHS.map(
    (path) => `<url>\n<loc>${baseUrl}${path}</loc>\n</url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
