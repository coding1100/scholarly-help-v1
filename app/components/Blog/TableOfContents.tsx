"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/app/lib/blog/utils";
import { ListIcon } from "./BlogIcons";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;
  return (
    <nav className="blog-card-panel blog-toc" aria-label="Table of contents">
      <div className="blog-toc-head">
        <div className="blog-side-title" style={{ margin: 0 }}>Table of Contents</div>
        <button type="button" className="blog-toc-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Toggle table of contents">
          <ListIcon className="h-4 w-4" />
        </button>
      </div>
      {open && (
        <ol style={{ marginTop: 12 }}>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined}>{item.text}</a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
