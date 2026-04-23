export function mergeSearchParams(
  baseUrl: string,
  paramsToMerge: URLSearchParams,
  opts?: { excludeKeys?: string[] },
) {
  const exclude = new Set(opts?.excludeKeys || []);
  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  paramsToMerge.forEach((value, key) => {
    if (exclude.has(key)) return;
    // If destination already has the param, keep its value.
    if (url.searchParams.has(key)) return;
    url.searchParams.set(key, value);
  });
  // Keep it as path+query for next/navigation router APIs.
  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildHrefWithSameQuery(
  pathname: string,
  currentParams: URLSearchParams,
): string {
  const qs = currentParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function appendQueryString(pathnameOrUrl: string, queryString: string) {
  if (!queryString) return pathnameOrUrl;
  const qs = queryString.startsWith("?") ? queryString.slice(1) : queryString;
  if (!qs) return pathnameOrUrl;
  return pathnameOrUrl.includes("?")
    ? `${pathnameOrUrl}&${qs}`
    : `${pathnameOrUrl}?${qs}`;
}

