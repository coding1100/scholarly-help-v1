"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminButton from "@/app/components/Admin/AdminButton";
import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import type { TermKind } from "@/app/lib/blog/types";
import { slugify } from "@/app/lib/blog/utils";
import { Field, ImageField, inputClass, Panel } from "./fields";

type Term = { _id: string; name: string; slug: string; description?: string; bio?: string; avatarUrl?: string; count: number };
type FormState = { name: string; slug: string; description: string; bio: string; avatarUrl: string };

const EMPTY: FormState = { name: "", slug: "", description: "", bio: "", avatarUrl: "" };
const LABELS: Record<TermKind, { one: string; many: string; path: string }> = {
  categories: { one: "Category", many: "Categories", path: "category" },
  tags: { one: "Tag", many: "Tags", path: "tag" },
  authors: { one: "Author", many: "Authors", path: "author" },
};

export default function TermManager({ kind }: { kind: TermKind }) {
  const label = LABELS[kind];
  const isAuthor = kind === "authors";
  const { confirmDelete } = useAdminConfirm();
  const pageTitle = useAdminPageTitleOptional();
  const [terms, setTerms] = useState<Term[] | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => pageTitle?.setPageTitle(`Blog ${label.many}`), [pageTitle, label.many]);

  const load = useCallback(() => {
    fetch(`/api/admin/blog/terms/${kind}`).then((r) => r.json()).then((d) => setTerms(d.terms ?? []));
  }, [kind]);
  useEffect(load, [load]);

  function edit(term: Term) {
    setEditingId(term._id);
    setForm({ name: term.name, slug: term.slug, description: term.description ?? "", bio: term.bio ?? "", avatarUrl: term.avatarUrl ?? "" });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/blog/terms/${kind}${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");
      reset();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(term: Term) {
    const ok = await confirmDelete({
      title: `Delete ${label.one.toLowerCase()}`,
      message: `Delete "${term.name}"?${term.count ? ` It is used by ${term.count} post(s); they will keep working without it.` : ""}`,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/blog/terms/${kind}/${term._id}`, { method: "DELETE" });
    if (res.ok) {
      if (editingId === term._id) reset();
      load();
    } else setError("Delete failed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <Panel title={editingId ? `Edit ${label.one.toLowerCase()}` : `Add ${label.one.toLowerCase()}`}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name">
            <input
              className={inputClass}
              value={form.name}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
            />
          </Field>
          <Field label="Slug" hint={`URL: /blog/${label.path}/${form.slug || "…"}/`}>
            <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </Field>
          {isAuthor ? (
            <>
              <Field label="Bio (optional)">
                <textarea className={`${inputClass} min-h-[80px]`} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
              </Field>
              <ImageField label="Photo (optional)" value={form.avatarUrl} onChange={(avatarUrl) => setForm((f) => ({ ...f, avatarUrl }))} />
            </>
          ) : (
            <Field label="Description (optional)">
              <textarea className={`${inputClass} min-h-[70px]`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>
          )}
          {error && <p role="alert" className="text-sm text-[#da0e0e]">{error}</p>}
          <div className="flex gap-2">
            <AdminButton variant="primary" type="submit" loading={saving}>{editingId ? "Save" : `Add ${label.one.toLowerCase()}`}</AdminButton>
            {editingId && <AdminButton variant="cancel" onClick={reset}>Cancel</AdminButton>}
          </div>
        </form>
      </Panel>

      <div className="overflow-x-auto rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f9fc] text-left text-xs uppercase tracking-wide text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Posts</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f8]">
            {terms === null && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6b7280]">Loading…</td></tr>}
            {terms?.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#6b7280]">No {label.many.toLowerCase()} yet.</td></tr>}
            {terms?.map((t) => (
              <tr key={t._id} className={editingId === t._id ? "bg-[#eef0f8]" : "hover:bg-[#fafbff]"}>
                <td className="px-4 py-3 font-semibold text-[#1a2456]">{t.name}</td>
                <td className="px-4 py-3 text-[#6b7280]">{t.slug}</td>
                <td className="px-4 py-3 text-right text-[#374151]">{t.count}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-[#283c88] hover:underline" onClick={() => edit(t)}>Edit</button>
                  <a className="mr-3 text-[#283c88] hover:underline" href={`/blog/${label.path}/${t.slug}/`} target="_blank" rel="noopener noreferrer">View</a>
                  <button type="button" className="text-[#da0e0e] hover:underline" onClick={() => remove(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
