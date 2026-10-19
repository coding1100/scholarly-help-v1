"use client";

import { RefObject, useEffect } from "react";

/**
 * Publishes a sticky bottom CTA bar's height on <html> as
 * `--mobile-cta-bar-height`, so the layouts that host it (ToolsLayout,
 * MainLayout) reserve the same space and the bar never covers the end of the
 * page. While the bar is visible, `data-mobile-cta-bar` is also set so the
 * floating WhatsApp/SMS bubbles, which it duplicates, are hidden.
 */
export function useMobileCtaBar(barRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const publish = () => {
      const height = bar.offsetHeight;
      root.style.setProperty("--mobile-cta-bar-height", `${height}px`);
      if (height > 0) root.dataset.mobileCtaBar = "";
      else delete root.dataset.mobileCtaBar;
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--mobile-cta-bar-height");
      delete root.dataset.mobileCtaBar;
    };
  }, [barRef]);
}
