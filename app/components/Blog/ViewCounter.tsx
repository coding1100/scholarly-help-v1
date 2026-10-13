"use client";

import { useEffect, useState } from "react";
import { formatViews } from "@/app/lib/blog/utils";

/**
 * Shows the post's view count and records one view per browser session.
 * `offset` is the count imported from WordPress, shown on top of real views.
 */
export default function ViewCounter({ postId, initialViews, offset = 0 }: { postId: string; initialViews: number; offset?: number }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `blog-viewed-${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked: still count the view.
    }
    fetch("/api/blog/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => typeof data?.views === "number" && setViews(data.views))
      .catch(() => {});
  }, [postId]);

  return (
    <div className="blog-card-panel blog-side-center">
      <div className="blog-side-title">Article Engagement</div>
      <div className="blog-views">
        <strong>{formatViews(views + offset)}</strong>
        <span>Total Views</span>
      </div>
    </div>
  );
}
