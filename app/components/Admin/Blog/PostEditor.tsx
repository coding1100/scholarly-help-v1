"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminButton from "@/app/components/Admin/AdminButton";
import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import type { BlogAuthor, BlogPost, BlogTerm, HeroCta } from "@/app/lib/blog/types";
import { slugify } from "@/app/lib/blog/utils";
import BlockEditor from "./BlockEditor";
import { Field, ImageField, inputClass, Panel } from "./fields";

type Draft = Omit<BlogPost, "_id" | "views" | "createdAt" | "updatedAt" | "wpId">;

const EMPTY: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  status: "draft",
  publishAt: null,
  categoryId: null,
  tagIds: [],
  authorId: null,
  coverImage: null,
  heroVideoUrl: "",
  heroCta: null,
  finalCta: null,
  blocks: [],
  seo: {},
  commentsEnabled: true,
};

/** ISO -> value for <input type="datetime-local"> in the editor's local time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CtaFields({ label, value, onChange }: { label: string; value: HeroCta | null | undefined; onChange: (v: HeroCta | null) => void }) {
  const v = value ?? { heading: "", text: "", buttonLabel: "", buttonUrl: "" };
  const set = (patch: Partial<HeroCta>) => {
    const next = { ...v, ...patch };
    onChange(next.heading || next.buttonLabel || next.text || next.buttonUrl ? next : null);
  };
  return (
    <fieldset className="space-y-3 rounded-lg border border-[#e2e8f4] p-3">
      <legend className="px-1 text-sm font-semibold text-[#283c88]">{label}</legend>
      <input className={inputClass} placeholder="Heading" value={v.heading} onChange={(e) => set({ heading: e.target.value })} />
      <input className={inputClass} placeholder="Text (optional)" value={v.text ?? ""} onChange={(e) => set({ text: e.target.value })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} placeholder="Button label" value={v.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} />
        <input className={inputClass} placeholder="Button link, e.g. /take-my-class/" value={v.buttonUrl} onChange={(e) => set({ buttonUrl: e.target.value })} />
      </div>
    </fieldset>
  );
}

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const { confirmDelete } = useAdminConfirm();
  const { showSuccess } = useAdminSuccess();
  const pageTitle = useAdminPageTitleOptional();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [meta, setMeta] = useState<{ views: number; updatedAt?: string; slug?: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!postId);
  const [categories, setCategories] = useState<BlogTerm[]>([]);
  const [tags, setTags] = useState<BlogTerm[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    pageTitle?.setPageTitle(postId ? "Edit Post" : "New Post");
  }, [pageTitle, postId]);

  useEffect(() => {
    const load = (kind: string) => fetch(`/api/admin/blog/terms/${kind}`).then((r) => r.json()).then((d) => d.terms ?? []);
    Promise.all([load("categories"), load("tags"), load("authors")]).then(([c, t, a]) => {
      setCategories(c);
      setTags(t);
      setAuthors(a);
    });
  }, []);

  useEffect(() => {
    if (!postId) return;
    // Ignore a stale response (e.g. React re-running the effect) so it can't overwrite edits.
    let active = true;
    fetch(`/api/admin/blog/posts/${postId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Post not found"))))
      .then(({ post }: { post: BlogPost }) => {
        if (!active) return;
        const { _id, views, createdAt, updatedAt, wpId, ...rest } = post;
        setDraft({ ...EMPTY, ...rest });
        setMeta({ views, updatedAt, slug: post.slug });
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }, []);

  const isScheduled = draft.status === "published" && !!draft.publishAt && new Date(draft.publishAt) > new Date();
  const statusLabel = draft.status === "draft" ? "Draft" : isScheduled ? "Scheduled" : "Published";

  async function save(nextStatus?: "draft" | "published") {
    setSaving(true);
    setError("");
    const body = { ...draft, status: nextStatus ?? draft.status };
    try {
      const res = await fetch(postId ? `/api/admin/blog/posts/${postId}` : "/api/admin/blog/posts", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      const saved: BlogPost = data.post;
      const { _id, views, createdAt, updatedAt, wpId, ...rest } = saved;
      setDraft({ ...EMPTY, ...rest });
      setMeta({ views, updatedAt, slug: saved.slug });
      setDirty(false);
      const wasPublished = draft.status === "published";
      const scheduled = saved.status === "published" && !!saved.publishAt && new Date(saved.publishAt) > new Date();
      showSuccess(
        nextStatus === "draft"
          ? wasPublished ? "Post unpublished" : "Saved as draft"
          : scheduled ? "Post scheduled" : wasPublished ? "Post updated" : "Post published",
      );
      if (!postId) router.replace(`/admin/blog/${saved._id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!postId) return;
    const ok = await confirmDelete({ title: "Delete post", message: `Delete "${draft.title}"? Its comments are deleted too. This cannot be undone.` });
    if (!ok) return;
    const res = await fetch(`/api/admin/blog/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setDirty(false);
      router.push("/admin/blog");
    } else setError("Delete failed");
  }

  const seoTitle = draft.seo.title || (draft.title ? `${draft.title} - Scholarly Help` : "Post title - Scholarly Help");
  const seoDescription = draft.seo.description || draft.excerpt || "Meta description shown in Google results.";
  const liveUrl = useMemo(() => `/blog/${draft.slug || slugify(draft.title) || "post-url"}/`, [draft.slug, draft.title]);

  if (loading) return <div className="p-8 text-[#6b7280]">Loading post…</div>;

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/blog" className="text-sm font-medium text-[#283c88] hover:underline">← All posts</Link>
        <div className="flex items-center gap-3 text-sm text-[#4b5563]">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusLabel === "Published" ? "bg-[#dcfce7] text-[#166534]" : statusLabel === "Scheduled" ? "bg-[#dbeafe] text-[#1e40af]" : "bg-[#e5e7eb] text-[#374151]"}`}>
            {statusLabel}
          </span>
          {meta && <span>{meta.views} views</span>}
          {meta?.updatedAt && <span>Saved {new Date(meta.updatedAt).toLocaleString()}</span>}
          {dirty && <span className="font-semibold text-[#c99700]">Unsaved changes</span>}
        </div>
      </div>

      {error && <div role="alert" className="rounded-lg border border-[#f5c2c2] bg-[#fef2f2] px-4 py-3 text-sm text-[#da0e0e]">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel title="Post">
            <Field label="Title">
              <input
                className={`${inputClass} text-lg font-semibold`}
                value={draft.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="Post title"
              />
            </Field>
            <Field
              label="URL slug"
              hint={
                <>
                  scholarlyhelp.com{liveUrl}
                  {postId && meta?.slug && draft.slug !== meta.slug && " — the old URL will redirect here automatically."}
                </>
              }
            >
              <input className={inputClass} value={draft.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
            </Field>
            <Field label="Intro" hint="Shown under the title in the header. Also used as the meta description if none is set.">
              <textarea className={`${inputClass} min-h-[80px]`} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
            </Field>
          </Panel>

          <Panel title="Header">
            <ImageField
              label="Featured image"
              value={draft.coverImage?.url ?? ""}
              onChange={(url) => set("coverImage", url ? { url, alt: draft.coverImage?.alt ?? "" } : null)}
            />
            {draft.coverImage && (
              <Field label="Featured image alt text">
                <input className={inputClass} value={draft.coverImage.alt} onChange={(e) => set("coverImage", { url: draft.coverImage!.url, alt: e.target.value })} />
              </Field>
            )}
            <Field label="Header video (YouTube URL, optional)" hint="Shown next to the title. Without a video, the featured image is shown there instead.">
              <input className={inputClass} value={draft.heroVideoUrl ?? ""} onChange={(e) => set("heroVideoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            </Field>
            <CtaFields label="Header call to action (optional)" value={draft.heroCta} onChange={(v) => set("heroCta", v)} />
          </Panel>

          <Panel title="Content">
            <BlockEditor blocks={draft.blocks} onChange={(blocks) => set("blocks", blocks)} />
          </Panel>

          <Panel title="Closing call to action">
            <CtaFields label="Shown at the bottom of the post (optional)" value={draft.finalCta} onChange={(v) => set("finalCta", v)} />
          </Panel>

          <Panel title="SEO">
            <div className="rounded-lg border border-[#e2e8f4] bg-white p-4">
              <p className="text-xs text-[#4b5563]">Google preview</p>
              <p className="truncate text-xs text-[#202124]">scholarlyhelp.com › blog › {draft.slug || "post-url"}</p>
              <p className="truncate text-lg text-[#1a0dab]">{seoTitle}</p>
              <p className="line-clamp-2 text-sm text-[#4d5156]">{seoDescription}</p>
            </div>
            <Field label="SEO title" hint={`${(draft.seo.title || seoTitle).length} characters (aim for under 60)`}>
              <input className={inputClass} value={draft.seo.title ?? ""} placeholder={seoTitle} onChange={(e) => set("seo", { ...draft.seo, title: e.target.value })} />
            </Field>
            <Field label="Meta description" hint={`${(draft.seo.description ?? "").length} characters (aim for 120–160)`}>
              <textarea className={`${inputClass} min-h-[70px]`} value={draft.seo.description ?? ""} onChange={(e) => set("seo", { ...draft.seo, description: e.target.value })} />
            </Field>
            <Field label="Canonical URL (optional)" hint="Leave empty to use this post's own URL.">
              <input className={inputClass} value={draft.seo.canonical ?? ""} onChange={(e) => set("seo", { ...draft.seo, canonical: e.target.value })} />
            </Field>
            <ImageField label="Social share image (optional, defaults to the featured image)" value={draft.seo.ogImage ?? ""} onChange={(url) => set("seo", { ...draft.seo, ogImage: url })} />
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={!!draft.seo.noindex} onChange={(e) => set("seo", { ...draft.seo, noindex: e.target.checked })} />
              Hide from Google (noindex)
            </label>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publish">
            <Field label="Publish date & time" hint={isScheduled ? "Scheduled: goes live automatically at this time." : "Leave empty to publish now. A future date schedules the post."}>
              <input
                type="datetime-local"
                className={inputClass}
                value={toLocalInput(draft.publishAt)}
                onChange={(e) => set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={draft.commentsEnabled} onChange={(e) => set("commentsEnabled", e.target.checked)} />
              Allow comments on this post
            </label>
          </Panel>

          <Panel title="Organize">
            <Field label="Category">
              <select className={inputClass} value={draft.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Author">
              <select className={inputClass} value={draft.authorId ?? ""} onChange={(e) => set("authorId", e.target.value || null)}>
                <option value="">— None —</option>
                {authors.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Field>
            <div>
              <span className="mb-1 block text-sm font-semibold text-[#283c88]">Tags</span>
              {tags.length === 0 ? (
                <p className="text-xs text-[#6b7280]">No tags yet. <Link className="underline" href="/admin/blog/tags">Create tags</Link></p>
              ) : (
                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                  {tags.map((t) => {
                    const on = draft.tagIds.includes(t._id);
                    return (
                      <button
                        key={t._id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("tagIds", on ? draft.tagIds.filter((id) => id !== t._id) : [...draft.tagIds, t._id])}
                        className={`rounded-full border px-3 py-1 text-xs ${on ? "border-[#283c88] bg-[#283c88] text-white" : "border-[#c5cce8] text-[#283c88] hover:bg-[#eef0f8]"}`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-xs text-[#6b7280]">
              Manage <Link className="underline" href="/admin/blog/categories">categories</Link>, <Link className="underline" href="/admin/blog/tags">tags</Link> and <Link className="underline" href="/admin/blog/authors">authors</Link>.
            </p>
          </Panel>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e2e8f4] bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {postId && <AdminButton variant="danger" onClick={remove} className="mr-auto">Delete</AdminButton>}
          {postId && (
            <a href={`/blog/preview/${postId}/`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#c5cce8] bg-[#eef0f8] px-4 py-2 text-sm font-medium text-[#283c88] hover:bg-[#dfe3f3]">
              Preview{dirty ? " (saved version)" : ""}
            </a>
          )}
          {postId && draft.status === "published" && !isScheduled && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-2 text-sm font-medium text-[#283c88] hover:underline">View live</a>
          )}
          {draft.status === "published" ? (
            <>
              <AdminButton variant="cancel" icon={false} disabled={saving} onClick={() => save("draft")}>Unpublish</AdminButton>
              <AdminButton variant="primary" loading={saving} onClick={() => save("published")}>{isScheduled ? "Update schedule" : "Update"}</AdminButton>
            </>
          ) : (
            <>
              <AdminButton variant="cancel" icon={false} disabled={saving} onClick={() => save("draft")}>Save draft</AdminButton>
              <AdminButton variant="primary" loading={saving} onClick={() => save("published")}>
                {draft.publishAt && new Date(draft.publishAt) > new Date() ? "Schedule" : "Publish"}
              </AdminButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
