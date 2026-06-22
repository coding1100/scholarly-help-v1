"use client";

import React from "react";
import { createPortal } from "react-dom";
import { MdClose, MdRefresh, MdCheck } from "react-icons/md";

export type RewriteKind =
  | "fluency"
  | "paraphrase"
  | "simplify"
  | "strengthen"
  | "counter"
  | "tense-past"
  | "tense-present"
  | "tense-future";

export const REWRITE_LABELS: Record<RewriteKind, string> = {
  fluency: "Improve fluency",
  paraphrase: "Paraphrase",
  simplify: "Simplify",
  strengthen: "Strengthen argument",
  counter: "Add counter-argument",
  "tense-past": "Change tense · Past",
  "tense-present": "Change tense · Present",
  "tense-future": "Change tense · Future",
};

type RewritePreviewProps = {
  open: boolean;
  loading: boolean;
  kind: RewriteKind | null;
  /** "append" => result is added after the selection; "replace" => swaps it. */
  mode: "replace" | "append";
  original: string;
  result: string;
  onAccept: () => void;
  onTryAgain: () => void;
  onClose: () => void;
};

/**
 * Shows the model's rewrite/transform before it touches the document. Nothing
 * is applied until the user clicks Accept; Try again re-runs the same action.
 */
const RewritePreview: React.FC<RewritePreviewProps> = ({
  open,
  loading,
  kind,
  mode,
  original,
  result,
  onAccept,
  onTryAgain,
  onClose,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !kind) return null;

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
          <span className="font-semibold text-gray-800">
            {REWRITE_LABELS[kind]}
          </span>
          <button
            type="button"
            aria-label="Close"
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Selected
            </div>
            <div className="max-h-24 overflow-y-auto rounded-md bg-gray-50 p-2 text-sm text-gray-600">
              {original}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {mode === "append" ? "Will be added after the selection" : "Result"}
            </div>
            <div className="max-h-44 overflow-y-auto rounded-md border border-blue-100 bg-blue-50/40 p-2 text-sm text-gray-800">
              {loading ? (
                <span className="text-gray-400">Generating…</span>
              ) : (
                result || <span className="text-gray-400">No result.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            onClick={onTryAgain}
            disabled={loading}
          >
            <MdRefresh size={16} />
            Try again
          </button>
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            onClick={onClose}
          >
            Discard
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={onAccept}
            disabled={loading || !result}
          >
            <MdCheck size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RewritePreview;
