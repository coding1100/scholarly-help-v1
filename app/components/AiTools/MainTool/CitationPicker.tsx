"use client";

import React from "react";
import { createPortal } from "react-dom";
import { MdClose, MdSearch, MdSchool } from "react-icons/md";

export type CitationCandidate = {
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  url: string;
  full_citation: string;
  in_text_citation: string;
};

type CitationPickerProps = {
  open: boolean;
  loading: boolean;
  /** The selected text the search was seeded from (shown for context). */
  query: string;
  style: string;
  results: CitationCandidate[];
  /** Re-run the search with a (possibly edited) query string. */
  onSearch: (query: string) => void;
  onSelect: (candidate: CitationCandidate) => void;
  onClose: () => void;
};

/**
 * Modal that surfaces citation-search candidates and lets the user pick the
 * correct one before it is inserted — instead of silently inserting the first
 * hit. Mirrors the standalone Citation Generator's search behaviour.
 */
const CitationPicker: React.FC<CitationPickerProps> = ({
  open,
  loading,
  query,
  style,
  results,
  onSearch,
  onSelect,
  onClose,
}) => {
  const [draft, setDraft] = React.useState(query);

  React.useEffect(() => {
    if (open) setDraft(query);
  }, [open, query]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    const q = draft.trim();
    if (q.length >= 3) onSearch(q);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/30 p-4 pt-24"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 text-gray-800">
            <MdSchool className="text-blue-600" size={20} />
            <span className="font-semibold">Find a citation</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
              {style}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 focus-within:border-blue-400">
            <MdSearch className="text-gray-400" size={18} />
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Search by title, DOI, or PubMed ID…"
              className="flex-1 bg-transparent py-2 text-sm outline-none"
            />
            <button
              type="button"
              className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={submit}
              disabled={loading || draft.trim().length < 3}
            >
              Search
            </button>
          </div>
        </div>

        <div className="max-h-[46vh] overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Searching for sources…
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No sources found. Try the paper title, a DOI, or a PubMed ID.
            </div>
          ) : (
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={`${r.doi || r.url || r.title}-${i}`}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-gray-200 p-3 text-left transition hover:border-blue-400 hover:bg-blue-50/40"
                    onClick={() => onSelect(r)}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {r.title || "Untitled source"}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {[
                        r.authors?.length
                          ? r.authors.slice(0, 3).join(", ") +
                            (r.authors.length > 3 ? " et al." : "")
                          : null,
                        r.year || null,
                        r.journal || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {r.full_citation ? (
                      <div className="mt-1.5 text-xs italic text-gray-600 line-clamp-2">
                        {r.full_citation}
                      </div>
                    ) : null}
                    {r.doi ? (
                      <div className="mt-1 text-[11px] text-gray-400">
                        doi:{r.doi}
                      </div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CitationPicker;
