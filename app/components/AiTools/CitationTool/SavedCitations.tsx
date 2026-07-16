"use client";

import React, { FC, useCallback, useEffect, useState } from "react";
import {
  FaChevronDown,
  FaRegBookmark,
  FaRegCopy,
  FaRegTrashAlt,
} from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import DOMPurify from "dompurify";

interface SavedCitationDoc {
  _id: string;
  title: string;
  content: string;
  source_tool?: string;
  createdAt?: string;
}

interface SavedCitationsProps {
  apiBase: string | undefined;
  token: string | null;
  open: boolean;
  onToggle: () => void;
  /** Bump to re-fetch (e.g. after a new citation is saved). */
  refreshKey: number;
  /** Invoked when a signed-out user tries to use the library. */
  onRequireSignIn: () => void;
}

// Saved citation documents only ever contain the paragraph/emphasis markup we
// wrote at save time; sanitize to exactly that set on the way back in.
const sanitizeSavedContent = (html: string | null | undefined): string => {
  const input = typeof html === "string" ? html : "";
  if (!input) return "";
  if (typeof window === "undefined") {
    return input.replace(/<(?!\/?(p|strong|i|em|b|br)\b)[^>]*>/gi, "");
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "strong", "i", "em", "b", "br"],
    ALLOWED_ATTR: [],
  });
};

const htmlToPlain = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** The first <p> holds the full citation; footnote/in-text paragraphs follow. */
const firstParagraph = (content: string): string => {
  const match = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(content || "");
  return match ? match[1] : content || "";
};

const writeClipboard = async (html: string, plain: string, successMsg: string) => {
  try {
    if (
      typeof ClipboardItem !== "undefined" &&
      navigator.clipboard &&
      "write" in navigator.clipboard
    ) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    toast.success(successMsg);
  } catch {
    try {
      await navigator.clipboard.writeText(plain);
      toast.success(successMsg);
    } catch {
      toast.error("Failed to copy.");
    }
  }
};

const TITLE_META =
  /^Citation — (APA|MLA|Chicago|Harvard) \((book|website|journal|article)\)/;

const TYPE_LABELS: Record<string, string> = {
  book: "Book",
  website: "Website",
  journal: "Journal Article",
  article: "News / Magazine",
};

const parseMeta = (title: string) => {
  const m = TITLE_META.exec(title || "");
  return m ? { style: m[1], type: TYPE_LABELS[m[2]] || m[2] } : null;
};

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const iconButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#2b7fff] hover:border-[#2b7fff] focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-200 disabled:opacity-50";

const SavedCitations: FC<SavedCitationsProps> = ({
  apiBase,
  token,
  open,
  onToggle,
  refreshKey,
  onRequireSignIn,
}) => {
  const [docs, setDocs] = useState<SavedCitationDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    if (!token || !apiBase) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiBase}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { source_tool: "citation-generator" },
      });
      const rows = res.data?.data;
      setDocs(Array.isArray(rows) ? rows : []);
      setHasLoaded(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Could not load your saved citations.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs, refreshKey]);

  // A pending delete confirmation quietly expires if left alone.
  useEffect(() => {
    if (!confirmDeleteId) return;
    const t = setTimeout(() => setConfirmDeleteId(null), 4000);
    return () => clearTimeout(t);
  }, [confirmDeleteId]);

  const handleDelete = async (id: string) => {
    if (!apiBase || !token) return;
    setDeletingId(id);
    try {
      await axios.delete(`${apiBase}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs((current) => current.filter((d) => d._id !== id));
      toast.success("Citation removed from your library.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to delete the citation.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleCopyOne = (doc: SavedCitationDoc) => {
    const html = firstParagraph(sanitizeSavedContent(doc.content));
    writeClipboard(html, htmlToPlain(html), "Citation copied to clipboard!");
  };

  const handleCopyAll = () => {
    const entries = docs
      .map((d) => firstParagraph(sanitizeSavedContent(d.content)))
      .map((html) => ({ html, plain: htmlToPlain(html) }))
      .filter((e) => e.plain)
      .sort((a, b) =>
        a.plain.toLowerCase().localeCompare(b.plain.toLowerCase()),
      );
    if (!entries.length) return;
    writeClipboard(
      entries.map((e) => `<p>${e.html}</p>`).join(""),
      entries.map((e) => e.plain).join("\n\n"),
      "Bibliography copied — paste it into your document.",
    );
  };

  return (
    <div
      id="saved-citations"
      className="mt-6 bg-white dark:bg-gray-800 border dark:border-gray-700 transition-colors duration-300"
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="saved-citations-body"
        className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2b7fff]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#565add]/10 text-[#565add] dark:text-[#8b8ff5]">
            <FaRegBookmark className="h-4 w-4" />
          </span>
          <span>
            <span className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
              Saved Citations
              {token && hasLoaded && (
                <span className="rounded-full bg-[#565add]/10 px-2 py-0.5 text-xs font-semibold text-[#565add] dark:text-[#8b8ff5]">
                  {docs.length}
                </span>
              )}
            </span>
            <span className="block text-xs text-gray-400 dark:text-gray-500">
              {token
                ? "Your citation library — copy or manage saved citations"
                : "Sign in to build your citation library"}
            </span>
          </span>
        </span>
        <FaChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-300 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="saved-citations-body"
          className="border-t dark:border-gray-700 p-4"
        >
          {/* Signed-out */}
          {!token ? (
            <div className="flex flex-col items-center py-8 text-center">
              <FaRegBookmark className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                Sign in to build your citation library
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                Save every citation you generate and copy them all as a
                bibliography whenever you need.
              </p>
              <button
                type="button"
                onClick={onRequireSignIn}
                className="mt-4 rounded-md bg-[#565add] px-5 py-2 text-sm font-medium text-white hover:bg-[#656aff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          ) : loading && !hasLoaded ? (
            /* Initial load skeleton */
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4"
                >
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-3 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={fetchDocs}
                className="mt-3 rounded-md border border-red-300 dark:border-red-700 px-4 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          ) : docs.length === 0 ? (
            /* Empty */
            <div className="flex flex-col items-center py-8 text-center">
              <FaRegBookmark className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                No saved citations yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-400 dark:text-gray-500">
                Generate a citation above and click{" "}
                <span className="font-medium">Save Citation</span> to add it to
                your library.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Toolbar */}
              {docs.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-200"
                    title="Copy every saved citation, alphabetized, as a ready-to-paste bibliography"
                  >
                    <FaRegCopy className="h-3 w-3" />
                    Copy all as bibliography
                  </button>
                </div>
              )}

              {docs.map((doc) => {
                const meta = parseMeta(doc.title);
                const saved = formatDate(doc.createdAt);
                const isConfirming = confirmDeleteId === doc._id;
                const isDeleting = deletingId === doc._id;
                return (
                  <div
                    key={doc._id}
                    className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                          {meta ? (
                            <>
                              <span className="rounded-full bg-[#565add]/10 px-2 py-0.5 font-semibold text-[#565add] dark:text-[#8b8ff5]">
                                {meta.style}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                {meta.type}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                              Citation
                            </span>
                          )}
                          {saved && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">
                                ·
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">
                                Saved {saved}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          className="break-words text-sm leading-relaxed text-gray-800 dark:text-gray-100 [&_i]:italic [&_p]:mb-1.5 [&_p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeSavedContent(doc.content),
                          }}
                        />
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyOne(doc)}
                          title="Copy citation"
                          className={iconButtonClass}
                        >
                          <FaRegCopy className="h-3.5 w-3.5" />
                        </button>
                        {isConfirming ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(doc._id)}
                            disabled={isDeleting}
                            className="flex h-8 items-center rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200 disabled:opacity-60"
                          >
                            {isDeleting ? "Deleting…" : "Confirm delete"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(doc._id)}
                            title="Delete citation"
                            className={`${iconButtonClass} hover:text-red-500 hover:border-red-400`}
                          >
                            <FaRegTrashAlt className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedCitations;
