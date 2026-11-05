"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { name: "Posts", href: "/admin/blog" },
  { name: "Categories", href: "/admin/blog/categories" },
  { name: "Tags", href: "/admin/blog/tags" },
  { name: "Authors", href: "/admin/blog/authors" },
  { name: "Comments", href: "/admin/blog/comments" },
  { name: "Settings", href: "/admin/blog/settings" },
];

const SECTION_TABS = new Set(TABS.map((t) => t.href).filter((h) => h !== "/admin/blog"));

export default function BlogAdminLayout({ children }: { children: ReactNode }) {
  const pathname = (usePathname() || "").replace(/\/+$/, "");
  // Post editor pages (/admin/blog/new, /admin/blog/{id}) belong to the Posts tab.
  const active = SECTION_TABS.has(pathname) ? pathname : "/admin/blog";
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-1 border-b border-[#e2e8f4]" aria-label="Blog sections">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              active === tab.href ? "border-[#283c88] text-[#283c88]" : "border-transparent text-[#6b7280] hover:text-[#283c88]"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
