"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { parseDuplicateAdminSlug } from "@/app/lib/adminDuplicatePageRegistry";
import {
  normalizeDuplicatedFromAdminPath,
  resolveDuplicateEditorComponent,
} from "@/app/lib/adminDuplicateEditorRegistry";
import { AdminDuplicateEditorProvider } from "@/app/components/Admin/AdminDuplicateEditorContext";

/** Dynamic duplicate admin editor at /admin/{slug} (e.g. /admin/usa-based-phd-experts) */
export default function AdminDuplicateSlugPage() {
  const pathname = usePathname();
  const slug = parseDuplicateAdminSlug(pathname);
  const [duplicatedFromAdminPath, setDuplicatedFromAdminPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/duplicate-page/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (!cancelled) {
          setDuplicatedFromAdminPath(
            normalizeDuplicatedFromAdminPath(data.duplicatedFromAdminPath),
          );
        }
      } catch {
        if (!cancelled) {
          setDuplicatedFromAdminPath("/admin/take-my-class");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
        Invalid duplicate page URL.
      </div>
    );
  }

  if (loading || !duplicatedFromAdminPath) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-gray-500">
        Loading editor…
      </div>
    );
  }

  const Editor = resolveDuplicateEditorComponent(duplicatedFromAdminPath);

  return (
    <AdminDuplicateEditorProvider
      duplicateSlug={slug}
      duplicatedFromAdminPath={duplicatedFromAdminPath}
    >
      <Editor />
    </AdminDuplicateEditorProvider>
  );
}
