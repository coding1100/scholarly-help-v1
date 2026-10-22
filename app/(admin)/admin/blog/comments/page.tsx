"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import type { BlogComment, CommentStatus } from "@/app/lib/blog/types";

type Data = {
  comments: Omit<BlogComment, "ipHash">[];
  posts: Record<string, { title: string; slug: string }>;
  counts: Partial<Record<CommentStatus, number>>;
};

const TABS: { status: CommentStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Approved" },
  { status: "spam", label: "Spam" },
];

export default function BlogCommentsPage() {
  const pageTitle = useAdminPageTitleOptional();
  const { confirmDelete } = useAdminConfirm();
  const [status, setStatus] = useState<CommentStatus>("pending");
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => pageTitle?.setPageTitle("Blog Comments"), [pageTitle]);

  const load = useCallback(() => {
    setData(null);
    fetch(`/api/admin/blog/comments?status=${status}`).then((r) => r.json()).then(setData);
  }, [status]);
  useEffect(load, [load]);

  async function setCommentStatus(id: string, next: CommentStatus) {
    setBusy(id);
    await fetch(`/api/admin/blog/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(null);
    load();
  }

  async function remove(id: string) {
    if (!(await confirmDelete("Delete this comment permanently?"))) return;
    setBusy(id);
    await fetch(`/api/admin/blog/comments/${id}`, { method: "DELETE" });
    setBusy(null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.status}
            type="button"
            onClick={() => setStatus(t.status)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${status === t.status ? "bg-[#283c88] text-white" : "bg-[#eef0f8] text-[#283c88] hover:bg-[#dfe3f3]"}`}
          >
            {t.label} ({data?.counts[t.status] ?? 0})
          </button>
        ))}
      </div>

      {data === null && <p className="text-sm text-[#6b7280]">Loading…</p>}
      {data?.comments.length === 0 && (
        <p className="rounded-xl border border-[#e2e8f4] bg-white p-8 text-center text-sm text-[#6b7280]">No {status} comments.</p>
      )}
      <ul className="space-y-3">
        {data?.comments.map((c) => {
          const post = data.posts[c.postId];
          return (
            <li key={c._id} className="rounded-xl border border-[#e2e8f4] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <strong className="text-[#1a2456]">{c.name}</strong>
                <span className="text-[#6b7280]">{c.email}</span>
                <span className="text-[#6b7280]">{new Date(c.createdAt).toLocaleString()}</span>
                {post && (
                  <a href={`/blog/${post.slug}/`} target="_blank" rel="noopener noreferrer" className="text-[#283c88] hover:underline">
                    on “{post.title}”
                  </a>
                )}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-[#374151]">{c.body}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {status !== "approved" && (
                  <button type="button" disabled={busy === c._id} onClick={() => setCommentStatus(c._id, "approved")} className="rounded-lg bg-[#16a34a] px-3 py-1 font-semibold text-white hover:bg-[#15803d] disabled:opacity-50">Approve</button>
                )}
                {status === "approved" && (
                  <button type="button" disabled={busy === c._id} onClick={() => setCommentStatus(c._id, "pending")} className="rounded-lg border border-[#c9c9c9] px-3 py-1 text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-50">Unapprove</button>
                )}
                {status !== "spam" && (
                  <button type="button" disabled={busy === c._id} onClick={() => setCommentStatus(c._id, "spam")} className="rounded-lg border border-[#c9c9c9] px-3 py-1 text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-50">Mark spam</button>
                )}
                <button type="button" disabled={busy === c._id} onClick={() => remove(c._id)} className="rounded-lg px-3 py-1 text-[#da0e0e] hover:bg-[#fef2f2] disabled:opacity-50">Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
