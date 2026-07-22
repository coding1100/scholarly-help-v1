"use client";

import React, { useEffect, useRef, useState } from "react";
import { CATEGORY_META, type ClientIssue, type IssueStatus } from "./types";

/**
 * The highlighted document. Renders by slicing the doc text at issue offsets
 * into plain segments and <mark> segments — pure derivation from state, no
 * innerHTML, so duplicate substrings and repeated edits can't corrupt it.
 */

export type ResolveAction = Exclude<IssueStatus, "open">;

interface EditorPaneProps {
  text: string;
  issues: ClientIssue[];
  onResolve: (issueId: string, action: ResolveAction) => void;
  showRecheckNote: boolean;
}

interface PopoverState {
  issueId: string;
  top: number;
  left: number;
}

function markClasses(issue: ClientIssue): string {
  if (issue.status === "accepted") {
    return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded px-0.5";
  }
  if (issue.status === "dismissed") {
    return "border-b-2 border-dotted border-gray-400 dark:border-gray-500";
  }
  if (issue.status === "dictionary") {
    return "";
  }
  const base = "cursor-pointer pb-px";
  if (issue.isNew) {
    return `${base} border-b-2 border-dashed border-amber-500 bg-amber-50 dark:bg-amber-900/20`;
  }
  return `${base} ${CATEGORY_META[issue.category].markClass}`;
}

const EditorPane: React.FC<EditorPaneProps> = ({
  text,
  issues,
  onResolve,
  showRecheckNote,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  // Close the popover when its issue is resolved or the doc changes under it.
  const popoverIssue = popover
    ? issues.find((i) => i.id === popover.issueId && i.status === "open")
    : undefined;

  useEffect(() => {
    if (popover && !popoverIssue) setPopover(null);
  }, [popover, popoverIssue]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-grammar-popover]") && !target.closest("[data-issue-id]")) {
        setPopover(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const openPopover = (e: React.MouseEvent<HTMLElement>, issueId: string) => {
    const container = containerRef.current;
    if (!container) return;
    const markRect = e.currentTarget.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const left = Math.max(
      0,
      Math.min(markRect.left - contRect.left, contRect.width - 272),
    );
    setPopover({ issueId, top: markRect.bottom - contRect.top + 8, left });
  };

  // Slice the doc into segments. Issues are non-overlapping and sorted.
  const sorted = [...issues].sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let cursor = 0;
  for (const issue of sorted) {
    if (issue.start < cursor || issue.end > text.length) continue;
    if (issue.start > cursor) {
      segments.push(
        <React.Fragment key={`t-${cursor}`}>{text.slice(cursor, issue.start)}</React.Fragment>,
      );
    }
    const clickable = issue.status === "open";
    segments.push(
      <mark
        key={issue.id}
        data-issue-id={issue.id}
        className={`bg-transparent text-inherit ${markClasses(issue)}`}
        onClick={clickable ? (e) => openPopover(e, issue.id) : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPopover(e as unknown as React.MouseEvent<HTMLElement>, issue.id);
                }
              }
            : undefined
        }
      >
        {text.slice(issue.start, issue.end)}
      </mark>,
    );
    cursor = issue.end;
  }
  segments.push(<React.Fragment key="tail">{text.slice(cursor)}</React.Fragment>);

  return (
    <div className="min-w-0 flex-1">
      <div ref={containerRef} className="relative">
        <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-5 text-base leading-8 text-gray-800 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 md:p-6">
          {segments}
        </div>

        {popover && popoverIssue && (
          <div
            data-grammar-popover
            className="absolute z-20 w-64 rounded-xl border border-gray-300 bg-white p-3 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800"
            style={{ top: popover.top, left: popover.left }}
          >
            <p className="mb-1 text-gray-800 dark:text-gray-100">
              Did you mean{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {popoverIssue.suggestion || "removing this"}
              </strong>
              ?
            </p>
            <p className="mb-2.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {popoverIssue.explanation}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => onResolve(popoverIssue.id, "accepted")}
                className="rounded-md bg-primary-400 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-300"
              >
                Accept
              </button>
              <button
                onClick={() => onResolve(popoverIssue.id, "dismissed")}
                className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Ignore
              </button>
              <button
                onClick={() => onResolve(popoverIssue.id, "dictionary")}
                title="Add to dictionary"
                className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                + Dictionary
              </button>
            </div>
          </div>
        )}
      </div>

      {showRecheckNote && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-300">
          Re-checked that sentence after your edit — the fix left a new issue
          (dashed underline). Review it before you move on.
        </div>
      )}
    </div>
  );
};

export default EditorPane;
