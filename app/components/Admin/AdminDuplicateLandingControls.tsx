"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminDuplicateEditorOptional } from "@/app/components/Admin/AdminDuplicateEditorContext";
import AdminButton from "@/app/components/Admin/AdminButton";

type PageData = Record<string, unknown> & {
  isDynamicLandingDuplicate?: boolean;
  adminNavLabel?: string;
  dynamicLandingSlug?: string;
  id?: string;
  published?: boolean;
};

export function isDuplicateLandingEditor(
  pageData: PageData | null | undefined,
): boolean {
  const dup = useAdminDuplicateEditorOptional();
  return !!dup?.duplicateSlug || !!pageData?.isDynamicLandingDuplicate;
}

export function AdminDuplicateMetaPanel({
  pageData,
  updatePageData,
}: {
  pageData: PageData;
  updatePageData: (path: string, value: unknown) => void;
}) {
  if (!isDuplicateLandingEditor(pageData)) return null;

  const slug = String(
    pageData.dynamicLandingSlug || pageData.id || "",
  ).replace(/^\/+/, "");

  return (
    <div className="w-full space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">Duplicate landing (admin + public)</p>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Admin / menu label</label>
        <input
          type="text"
          value={String(pageData.adminNavLabel || "")}
          onChange={(e) => updatePageData("adminNavLabel", e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#283c88] focus:outline-none focus:ring-2 focus:ring-[#283c88]"
        />
      </div>
      <p className="text-xs text-gray-600">
        Public URL:{" "}
        <code className="rounded bg-white px-1">/{slug || "…"}/</code>
        {!pageData.published ? (
          <span className="mt-1 block text-amber-800">
            Enable Published and save for this URL to work on the site.
          </span>
        ) : null}
      </p>
      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={!!pageData.published}
          onChange={(e) => updatePageData("published", e.target.checked)}
        />
        Published (visible on the website)
      </label>
    </div>
  );
}

export function AdminDuplicateDeleteButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const dup = useAdminDuplicateEditorOptional();
  const router = useRouter();
  const { confirmDelete } = useAdminConfirm();
  const [deleting, setDeleting] = useState(false);

  if (!dup?.duplicateSlug) return null;

  const handleDelete = async () => {
    if (
      !(await confirmDelete({
        variant: "delete",
        message:
          "Delete this duplicate landing page from the database? The public URL will stop working.",
      }))
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/duplicate-page/${encodeURIComponent(dup.duplicateSlug)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Delete failed");
        return;
      }
      window.dispatchEvent(new CustomEvent("admin-dynamic-landing-updated"));
      router.push("/admin");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminButton
      type="button"
      variant="dangerLg"
      onClick={() => void handleDelete()}
      disabled={disabled || deleting}
      loading={deleting}
    >
      {deleting ? "Deleting…" : "Delete landing page"}
    </AdminButton>
  );
}
