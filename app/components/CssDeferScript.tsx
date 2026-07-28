"use client";

import { usePathname } from "next/navigation";

// Scoped rollout: only these routes get the deferred-CSS swap while we
// validate render-blocking savings on staging before going wider.
const DEFER_ROUTES = ["/take-my-class"];

export default function CssDeferScript() {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  if (!DEFER_ROUTES.includes(normalizedPathname)) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            var links = document.querySelectorAll('link[rel="stylesheet"]');
            for (var i = 0; i < links.length; i++) {
              var link = links[i];
              link.media = 'print';
              link.onload = function () {
                this.media = 'all';
                this.onload = null;
              };
            }
          })();
        `,
      }}
    />
  );
}
