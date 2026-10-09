"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import { inputClass } from "@/app/components/Admin/Blog/fields";
import type { BlogTerm } from "@/app/lib/blog/types";

type Row = {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishAt: string | null;
  categoryId: string | null;
  updatedAt: string;
  views: number;
  importedViews?: number;
};

function statusOf(row: Row) {
  if (row.status === "draft") return { label: "Draft", cls: "bg-[#e5e7eb] text-[#374151]" };
  if (row.publishAt && new Date(row.publishAt) > new Date()) return { label: "Scheduled", cls: "bg-[#dbeafe] text-[#1e40af]" };
  return { label: "Published", cls: "bg-[#dcfce7] text-[#166534]" };
}

export default function BlogPostsPage() {
  const pageTitle = useAdminPageTitleOptional();
  const [posts, setPosts] = useState<Row[] | null>(null);
  const [categories, setCategories] = useState<BlogTerm[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => pageTitle?.setPageTitle("Blog"), [pageTitle]);

  useEffect(() => {
    fetch("/api/admin/blog/terms/categories").then((r) => r.json()).then((d) => setCategories(d.terms ?? []));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    const timer = setTimeout(() => {
      fetch(`/api/admin/blog/posts?${params}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load posts"))))
        .then((d) => setPosts(d.posts))
        .catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, status, categoryId]);

  const catName = useMemo(() => new Map(categories.map((c) => [c._id, c.name])), [categories]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className={`${inputClass} max-w-xs`} placeholder="Search titles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search posts" />
        <select className={`${inputClass} max-w-[160px]`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Drafts</option>
        </select>
        <select className={`${inputClass} max-w-[220px]`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <Link href="/admin/blog/new" className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#283c88] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2f6a]">
          + New post
        </Link>
      </div>

      {error && <p className="text-sm text-[#da0e0e]">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f9fc] text-left text-xs uppercase tracking-wide text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Publish date</th>
              <th className="px-4 py-3 text-right" title="Real visitor views counted by this site. Admins and bots are not counted.">Real views</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f8]">
            {posts === null && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6b7280]">Loading…</td></tr>
            )}
            {posts?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#6b7280]">No posts found.</td></tr>
            )}
            {posts?.map((p) => {
              const s = statusOf(p);
              return (
                <tr key={p._id} className="hover:bg-[#fafbff]">
                  <td className="max-w-md px-4 py-3">
                    <Link href={`/admin/blog/${p._id}`} className="font-semibold text-[#1a2456] hover:text-[#283c88] hover:underline">{p.title}</Link>
                    <div className="truncate text-xs text-[#6b7280]">/blog/{p.slug}/</div>
                  </td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span></td>
                  <td className="px-4 py-3 text-[#374151]">{p.categoryId ? catName.get(p.categoryId) ?? "—" : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#374151]">{p.publishAt ? new Date(p.publishAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right text-[#374151]">
                    {p.views.toLocaleString()}
                    {p.importedViews ? (
                      <div className="text-xs text-[#9ca3af]" title="Shown publicly on top of real views">+{p.importedViews.toLocaleString()} from WordPress</div>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link href={`/admin/blog/${p._id}`} className="mr-3 text-[#283c88] hover:underline">Edit</Link>
                    {s.label === "Published" ? (
                      <a href={`/blog/${p.slug}/`} target="_blank" rel="noopener noreferrer" className="text-[#283c88] hover:underline">View</a>
                    ) : (
                      <a href={`/blog/preview/${p._id}/`} target="_blank" rel="noopener noreferrer" className="text-[#283c88] hover:underline">Preview</a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {posts && posts.length > 0 && <p className="text-xs text-[#6b7280]">{posts.length} post{posts.length === 1 ? "" : "s"}</p>}
    </div>
  );
}
