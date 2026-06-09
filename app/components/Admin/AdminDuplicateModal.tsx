"use client";

import { useEffect, useState } from "react";
import AdminButton from "@/app/components/Admin/AdminButton";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultTitle: string;
  onSubmit: (payload: { title: string; publicSlug: string }) => Promise<void>;
};

function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AdminDuplicateModal({
  open,
  onClose,
  defaultTitle,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(defaultTitle);
    setSlug("");
    setError(null);
  }, [open, defaultTitle]);

  if (!open) return null;

  const handleCreate = async () => {
    const publicSlug = slug.trim() ? slugify(slug) : slugify(title);
    if (!publicSlug || publicSlug.length < 2) {
      setError("Enter a title or URL slug (letters, numbers, hyphens).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ title: title.trim() || publicSlug, publicSlug });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duplicate failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dup-title"
      >
        <h2 id="admin-dup-title" className="text-lg font-semibold text-gray-900">
          Duplicate page
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Creates an admin editor at{" "}
          <code className="rounded bg-gray-100 px-1">/admin/your-slug</code> and a public page at{" "}
          <code className="rounded bg-gray-100 px-1">/your-slug/</code> (same style as Take My Class
          pages). Unpublished until you enable <strong>Published</strong> in the editor and save.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Page title (admin menu)</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Public URL slug <span className="text-gray-400">(optional)</span>
            </label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Defaults from title"
            />
            <p className="mt-1 text-xs text-gray-500">
              Admin: /admin/{slug.trim() ? slugify(slug) || "…" : slugify(title) || "your-slug"}
              {" · "}
              Public: /{slug.trim() ? slugify(slug) || "…" : slugify(title) || "your-slug"}/
            </p>
          </div>
          <p className="text-xs text-gray-500">
            The copy appears under the <strong>Pages</strong> menu in the admin sidebar.
          </p>
        </div>

        {error ? <p className="mt-3 text-sm text-[#da0e0e]">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <AdminButton type="button" variant="cancel" onClick={onClose} disabled={busy}>
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            variant="primary"
            onClick={() => void handleCreate()}
            disabled={busy}
            loading={busy}
          >
            {busy ? "Saving copy…" : "Save duplicate"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
