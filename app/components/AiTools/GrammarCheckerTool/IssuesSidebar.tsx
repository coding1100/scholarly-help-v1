"use client";

import React, { useState } from "react";
import {
  FiArrowLeft,
  FiBook,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import type { ResolveAction } from "./EditorPane";
import {
  CATEGORY_META,
  GRAMMAR_CATEGORIES,
  type ClientIssue,
  type GrammarCategory,
} from "./types";

/**
 * Left panel: category tabs with live counts → per-category card stack with
 * accept/dismiss/dictionary actions → corrected-text view. All views derive
 * from the same issues array the editor uses; both surfaces call the same
 * onResolve, so they can never disagree.
 */

type TabKey = "all" | GrammarCategory;
type View = { kind: "tabs" } | { kind: "cards"; tab: TabKey } | { kind: "corrected" };

interface IssuesSidebarProps {
  issues: ClientIssue[];
  onResolve: (issueId: string, action: ResolveAction) => void;
  correctedText: string;
  onCopyCorrected: () => void;
  copied: boolean;
}

const IssuesSidebar: React.FC<IssuesSidebarProps> = ({
  issues,
  onResolve,
  correctedText,
  onCopyCorrected,
  copied,
}) => {
  const [view, setView] = useState<View>({ kind: "tabs" });
  const [cursor, setCursor] = useState(0);

  const openIssues = issues.filter((i) => i.status === "open");
  const openIn = (tab: TabKey) =>
    tab === "all" ? openIssues : openIssues.filter((i) => i.category === tab);

  const backToTabs = () => {
    setView({ kind: "tabs" });
    setCursor(0);
  };

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors";

  return (
    <div className="w-full flex-shrink-0 md:w-56">
      {view.kind === "tabs" && (
        <div>
          {([
            { key: "all" as TabKey, label: "All" },
            ...GRAMMAR_CATEGORIES.map((c) => ({
              key: c as TabKey,
              label: CATEGORY_META[c].label,
            })),
          ]).map(({ key, label }) => {
            const count = openIn(key).length;
            return (
              <button
                key={key}
                onClick={() => {
                  setView({ kind: "cards", tab: key });
                  setCursor(0);
                }}
                className="mb-2 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:border-primary-400 hover:text-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400"
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    count === 0
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setView({ kind: "corrected" })}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:border-primary-400 hover:text-primary-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-primary-400"
          >
            Corrected text
          </button>
        </div>
      )}

      {view.kind === "cards" && (
        <div>
          <button
            onClick={backToTabs}
            className="mb-2.5 flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-primary-400 dark:text-gray-400"
          >
            <FiArrowLeft /> Categories
          </button>
          {(() => {
            const list = openIn(view.tab);
            if (list.length === 0) {
              return (
                <p className="flex items-center gap-1.5 px-1 py-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                  <FiCheck /> No issues here. Nice work.
                </p>
              );
            }
            const issue = list[Math.min(cursor, list.length - 1)];
            const meta = CATEGORY_META[issue.category];
            return (
              <>
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className={`mb-1.5 text-xs font-bold ${meta.labelColor}`}>
                    {issue.isNew ? "New issue from your edit" : meta.label}
                  </p>
                  <p className="text-sm leading-6 text-gray-800 dark:text-gray-100">
                    <s className="text-gray-400 dark:text-gray-500">{issue.original}</s>{" "}
                    <b className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {issue.suggestion || "(remove)"}
                    </b>
                  </p>
                  <div className="my-2 rounded-lg bg-gray-50 px-2.5 py-2 text-xs leading-5 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {issue.explanation}
                  </div>
                  {issue.sentence && (
                    <p className="mb-2.5 border-l-2 border-gray-300 pl-2 text-xs italic leading-5 text-gray-400 dark:border-gray-600 dark:text-gray-500">
                      &ldquo;{issue.sentence}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onResolve(issue.id, "accepted")}
                      aria-label="Accept"
                      title="Accept"
                      className={`${iconBtn} border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30`}
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={() => onResolve(issue.id, "dismissed")}
                      aria-label="Dismiss"
                      title="Dismiss"
                      className={`${iconBtn} border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-800`}
                    >
                      <FiX />
                    </button>
                    <button
                      onClick={() => onResolve(issue.id, "dictionary")}
                      aria-label="Add to dictionary"
                      title="Add to dictionary"
                      className={`${iconBtn} border-gray-200 text-primary-400 hover:bg-primary-100 dark:border-gray-700 dark:hover:bg-gray-800`}
                    >
                      <FiBook />
                    </button>
                  </div>
                </div>
                {list.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() =>
                        setCursor((cursor - 1 + list.length) % list.length)
                      }
                      aria-label="Previous issue"
                      title="Previous issue"
                      className={`${iconBtn} border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800`}
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="min-w-[44px] text-center text-xs text-gray-500 dark:text-gray-400">
                      {Math.min(cursor, list.length - 1) + 1} / {list.length}
                    </span>
                    <button
                      onClick={() => setCursor((cursor + 1) % list.length)}
                      aria-label="Next issue"
                      title="Next issue"
                      className={`${iconBtn} border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800`}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {view.kind === "corrected" && (
        <div>
          <button
            onClick={backToTabs}
            className="mb-2.5 flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-primary-400 dark:text-gray-400"
          >
            <FiArrowLeft /> Categories
          </button>
          <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            {correctedText}
          </div>
          <button
            onClick={onCopyCorrected}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {copied ? "Copied!" : "Copy clean text"}
          </button>
        </div>
      )}
    </div>
  );
};

export default IssuesSidebar;
