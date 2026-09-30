"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import { HistoryRow } from "@/app/components/AiTools/Dashboard/RecentWorkPanel";
import {
  listToolRuns,
  type ToolHistoryEntryDto,
} from "@/app/utils/toolHistoryClient";

const PAGE_SIZE = 25;

export default function RecentWorkPageContent() {
  const [flag, setFlag] = useState(false);
  const [entries, setEntries] = useState<ToolHistoryEntryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await listToolRuns(PAGE_SIZE, 0);
      setEntries(page.items);
      setTotal(page.total);
    } catch {
      setError("Could not load your recent work.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listToolRuns(PAGE_SIZE, entries.length);
      // De-duplicate by id: a run recorded between two page fetches shifts the
      // offset window and would otherwise repeat a row already on screen.
      setEntries((prev) => {
        const seen = new Set(prev.map((entry) => entry._id));
        return [...prev, ...page.items.filter((entry) => !seen.has(entry._id))];
      });
      setTotal(page.total);
    } catch {
      setError("Could not load more.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      <main className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/tools/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-gray-300"
          >
            <FiArrowLeft className="h-4 w-4" /> Study Hub
          </Link>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            Recent work
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {loading
              ? "Loading your activity..."
              : total === 0
                ? "Nothing here yet."
                : `${total} ${total === 1 ? "item" : "items"}`}
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {loading ? (
              <div aria-busy="true" className="space-y-3 p-4">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-100 dark:bg-gray-700" />
                    <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : entries.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {entries.map((entry) => (
                  <HistoryRow key={entry._id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Once you run a tool, it shows up here so you can pick it back
                  up.
                </p>
                <Link
                  href="/tools/dashboard"
                  className="mt-3 inline-block text-sm font-semibold text-primary-400 underline-offset-4 hover:underline"
                >
                  Browse tools
                </Link>
              </div>
            )}
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              {error}{" "}
              <button
                type="button"
                onClick={() => void loadFirstPage()}
                className="font-semibold text-primary-400 underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </p>
          ) : null}

          {!loading && entries.length < total ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="mt-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
      </main>
    </ToolsLayout>
  );
}
