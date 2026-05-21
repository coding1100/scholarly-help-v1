"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  adminPathKey,
  isAdminDynamicLandingEditorPath,
} from "@/app/lib/adminDuplicatePageRegistry";
import {
  canDuplicateAdminPage,
  coreLabelFromAdminRoute,
  getAdminPageNavId,
  getAdminPageRouteConfig,
  isAdminDuplicateRoute,
  isPagesMenuEditor,
  resolveSourcePageId,
} from "@/app/lib/adminPageRoutes";
import { useAdminDuplicateSourcePageId } from "@/app/components/Admin/AdminDuplicateContext";
import { useAdminPageTitleOptional } from "@/app/components/Admin/AdminPageTitleContext";
import AdminDuplicateModal from "@/app/components/Admin/AdminDuplicateModal";
import {
  defaultDuplicateAdminNavLabel,
  resolveAdminDisplayTitle,
  shortNameFromAdminTitle,
} from "@/app/lib/adminPageDisplay";
import AdminButton from "@/app/components/Admin/AdminButton";

type Props = {
  /** Fallback core name when no custom adminNavLabel (e.g. "Take My Class 3") */
  coreLabel?: string;
  /** Stored admin menu / header title */
  adminNavLabel?: string | null;
  /** Called when user saves an inline title edit */
  onAdminNavLabelChange?: (label: string) => void | Promise<void>;
  /** Duplicated landing pages keep a custom menu label as-is */
  isDuplicate?: boolean;
  /** Legacy: fixed title when editable props are not used */
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AdminPageHeader({
  coreLabel,
  adminNavLabel,
  onAdminNavLabelChange,
  isDuplicate = false,
  title: legacyTitle,
  subtitle,
  className = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const contextSourceId = useAdminDuplicateSourcePageId();
  const pageTitleCtx = useAdminPageTitleOptional();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [loadedNavLabel, setLoadedNavLabel] = useState<string | null>(null);

  const pathKey = adminPathKey(pathname);
  const route = getAdminPageRouteConfig(pathname);
  const onLandingEditor = isAdminDynamicLandingEditorPath(pathname);
  const pagesEditor = isPagesMenuEditor(route);
  const navPageId = getAdminPageNavId(route);
  const isDupPage = isDuplicate || isAdminDuplicateRoute(route);

  const effectiveCoreLabel =
    coreLabel?.trim() ||
    (route && pagesEditor ? coreLabelFromAdminRoute(route) : "") ||
    (!pagesEditor && legacyTitle ? shortNameFromAdminTitle(legacyTitle) : "");

  const effectiveNavLabel = adminNavLabel ?? loadedNavLabel;

  const saveNavLabelDefault = async (label: string) => {
    if (!navPageId) throw new Error("Page id not found");
    const trimmed = label.trim();
    if (!trimmed) throw new Error("Title is required");
    const res = await fetch("/api/admin/page-nav-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: navPageId,
        adminNavLabel: trimmed,
        isDuplicate: isDupPage,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save title");
    setLoadedNavLabel(trimmed);
  };

  const onSaveNavLabel = onAdminNavLabelChange ?? (pagesEditor ? saveNavLabelDefault : undefined);

  const editable = Boolean(effectiveCoreLabel && onSaveNavLabel && pagesEditor);
  const displayTitle = pagesEditor && effectiveCoreLabel
    ? resolveAdminDisplayTitle(effectiveNavLabel, effectiveCoreLabel, { isDuplicate: isDupPage })
    : legacyTitle ||
      resolveAdminDisplayTitle(effectiveNavLabel, effectiveCoreLabel, { isDuplicate: isDupPage });

  useEffect(() => {
    if (!pagesEditor || !navPageId || adminNavLabel != null) return;
    const defaultTitle = resolveAdminDisplayTitle(null, effectiveCoreLabel, {
      isDuplicate: isDupPage,
    });
    let cancelled = false;
    (async () => {
      try {
        const q = new URLSearchParams({
          pageId: navPageId,
          isDuplicate: String(isDupPage),
        });
        const res = await fetch(`/api/admin/page-nav-label?${q}`);
        const data = await res.json();
        if (cancelled || !data.adminNavLabel) return;
        const resolved = resolveAdminDisplayTitle(data.adminNavLabel, effectiveCoreLabel, {
          isDuplicate: isDupPage,
        });
        if (resolved !== defaultTitle) {
          setLoadedNavLabel(data.adminNavLabel);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pagesEditor, navPageId, isDupPage, adminNavLabel, effectiveCoreLabel]);

  useEffect(() => {
    if (!pageTitleCtx || !displayTitle) return;
    pageTitleCtx.setPageTitle(displayTitle);
    return () => pageTitleCtx.setPageTitle(null);
  }, [displayTitle, pageTitleCtx]);

  useEffect(() => {
    if (editingTitle) setDraftTitle(displayTitle);
  }, [editingTitle, displayTitle]);

  const showDuplicate =
    pagesEditor &&
    canDuplicateAdminPage(route) &&
    pathKey !== "/admin" &&
    pathKey !== "/admin/login" &&
    !onLandingEditor;

  const handleDuplicate = async (payload: {
    title: string;
    publicSlug: string;
  }) => {
    if (!route) return;
    const sourcePageId = resolveSourcePageId(route, contextSourceId);
    if (!sourcePageId) {
      throw new Error("Select a page to duplicate first.");
    }
    const res = await fetch("/api/admin/page-duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminPath: route.adminPath,
        sourcePageId,
        adminNavLabel: payload.title,
        publicSlug: payload.publicSlug,
        parentNav: "pages",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Duplicate failed");
    window.dispatchEvent(new CustomEvent("admin-dynamic-landing-updated"));
    if (data.adminPath) {
      router.push(data.adminPath);
      router.refresh();
    }
  };

  const saveTitleEdit = async () => {
    const next = draftTitle.trim();
    if (!next || !onSaveNavLabel) {
      setEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    try {
      await onSaveNavLabel(next);
      setEditingTitle(false);
      window.dispatchEvent(new CustomEvent("admin-dynamic-landing-updated"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save title");
    } finally {
      setSavingTitle(false);
    }
  };

  return (
    <div className={`admin-page-header mb-8 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {editingTitle ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="min-w-[12rem] flex-1 rounded-md border border-gray-300 px-3 py-2 text-xl font-bold text-gray-900"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveTitleEdit();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                />
                <AdminButton
                  type="button"
                  variant="primary"
                  disabled={savingTitle}
                  loading={savingTitle}
                  onClick={() => void saveTitleEdit()}
                >
                  {savingTitle ? "Saving…" : "Save"}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="cancel"
                  disabled={savingTitle}
                  onClick={() => setEditingTitle(false)}
                >
                  Cancel
                </AdminButton>
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{displayTitle}</h1>
            )}
            {!editingTitle && editable ? (
              <AdminButton
                type="button"
                variant="headerEdit"
                onClick={() => setEditingTitle(true)}
                title="Edit page title"
                aria-label="Edit page title"
              >
                Edit
              </AdminButton>
            ) : null}
            {!editingTitle && showDuplicate ? (
              <AdminButton
                type="button"
                variant="headerDuplicate"
                onClick={() => setModalOpen(true)}
                title="Duplicate page"
                aria-label="Duplicate page"
              >
                Duplicate
              </AdminButton>
            ) : null}
          </div>
          {subtitle ? <p className="mt-2 text-sm text-[#4b5563]">{subtitle}</p> : null}
        </div>
      </div>

      {showDuplicate ? (
        <AdminDuplicateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultTitle={defaultDuplicateAdminNavLabel(displayTitle)}
          onSubmit={handleDuplicate}
        />
      ) : null}
    </div>
  );
}
