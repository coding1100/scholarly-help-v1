// Pages that were permanently removed. Their URLs answer 410 Gone (from
// middleware) so search engines drop them instead of following a redirect.
const GONE_PAGE_PATHS = new Set([
  "/math-solver",
  "/pythagoras-solver",
  "/tools/pythagoras-solver",
]);

export function isGonePagePath(pathname: string): boolean {
  return GONE_PAGE_PATHS.has(pathname.replace(/\/+$/, ""));
}
