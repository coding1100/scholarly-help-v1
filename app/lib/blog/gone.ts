// Blog posts that were permanently removed during SEO pruning. Their URLs answer
// 410 Gone (from middleware) so search engines drop them instead of retrying.
const GONE_BLOG_SLUGS = new Set([
  "what-can-you-do-with-a-biological-science-degree",
  "what-is-a-signed-integer-in-chemistry",
  "associate-degree-vs-bachelor-degree",
  "is-english-hard-to-learn",
  "ai-for-medical-students",
  "ai-internships-for-high-school-students",
  "who-invented-homework",
  "expensive-school-leading-to-educational-inequality",
  "accounting-interview-questions",
  "law-internships-for-high-school-students",
  "common-internship-interview-questions",
  "is-a-masters-in-computer-science-worth-it",
  "internships-for-high-school-students",
  "writing-contests-for-high-school-students",
  "part-time-jobs-for-college-students",
]);

export function isGoneBlogPath(pathname: string): boolean {
  const match = /^\/blog\/([^/]+)\/?$/.exec(pathname);
  return match !== null && GONE_BLOG_SLUGS.has(match[1]);
}
