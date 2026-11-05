"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  formatHistoryTimestamp,
  listToolRuns,
  type ToolHistoryEntryDto,
} from "@/app/utils/toolHistoryClient";

/** "Humanizer · 91% → 11% · Yesterday" */
export function HistoryMeta({ entry }: { entry: ToolHistoryEntryDto }) {
  const hasBefore = typeof entry.metric_before === "number";
  const hasAfter = typeof entry.metric_after === "number";
  const when = formatHistoryTimestamp(entry.createdAt);

  return (
    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
      {entry.tool_name}
      {hasAfter ? (
        <>
          {" · "}
          {hasBefore ? (
            <>
              {entry.metric_before}% <span aria-hidden="true">→</span>
              <span className="sr-only">to</span> {entry.metric_after}%
            </>
          ) : (
            <>{entry.metric_after}%</>
          )}
        </>
      ) : null}
      {when ? ` · ${when}` : null}
    </p>
  );
}

export function HistoryRow({ entry }: { entry: ToolHistoryEntryDto }) {
  return (
    <Link
      href={entry.href}
      className="block rounded-lg px-2 py-2 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:hover:bg-gray-700/50"
    >
      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
        {entry.title}
      </p>
      <HistoryMeta entry={entry} />
    </Link>
  );
}

export default function RecentWorkPanel({ limit = 5 }: { limit?: number }) {
  const [entries, setEntries] = useState<ToolHistoryEntryDto[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const page = await listToolRuns(limit);
      setEntries(page.items);
      setFailed(false);
    } catch {
      // A history outage must not take the dashboard down with it — the panel
      // degrades to a retry and every tool stays reachable.
      setEntries([]);
      setFailed(true);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      aria-label="Recent work"
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Recent work
        </h2>
        {entries && entries.length > 0 ? (
          <Link
            href="/tools/recent-work"
            className="shrink-0 text-sm font-semibold text-primary-400 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            See all
          </Link>
        ) : null}
      </div>

      {entries === null ? (
        <div aria-busy="true" className="mt-4 space-y-3">
          {[0, 1].map((row) => (
            <div key={row} className="space-y-2 px-2">
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="mt-3 -mx-2 divide-y divide-gray-100 dark:divide-gray-700">
          {entries.map((entry) => (
            <HistoryRow key={entry._id} entry={entry} />
          ))}
        </div>
      ) : failed ? (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Could not load your recent work.
          </p>
          <button
            type="button"
            onClick={() => {
              setEntries(null);
              void load();
            }}
            className="mt-2 text-sm font-semibold text-primary-400 underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Nothing yet. Once you run a tool, it shows up here so you can pick it
          back up.
        </p>
      )}
    </section>
  );
}
