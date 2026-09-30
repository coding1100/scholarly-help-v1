"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import { groupedTools, matchesQuery } from "./toolGroups";
import type { ToolCardData } from "./ToolCard";

/**
 * The Study Hub's main column: every tool, grouped and searchable.
 *
 * Whole card is the link (not a nested button) so the entire target is
 * clickable and it stays a single tab stop per tool.
 */
function LauncherCard({ tool }: { tool: ToolCardData }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-[0_10px_24px_rgba(86,90,221,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-200 text-primary-400 ring-1 ring-primary-300 dark:bg-primary-500/20">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {tool.name}
        </span>
        {tool.description ? (
          <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
            {tool.description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export default function ToolLauncher() {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => groupedTools(), []);

  const filtered = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          tools: group.tools.filter((tool) => matchesQuery(tool, query)),
        }))
        .filter((group) => group.tools.length > 0),
    [groups, query],
  );

  const resultCount = filtered.reduce(
    (total, group) => total + group.tools.length,
    0,
  );
  const searching = query.trim().length > 0;

  return (
    <section aria-label="Tools" className="min-w-0">
      <div className="relative">
        <FiSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools..."
          aria-label="Search tools"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {searching ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:hover:bg-gray-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Result count is announced politely so a screen reader hears the list
          change as the user types, without interrupting them mid-word. */}
      <p aria-live="polite" className="sr-only">
        {searching ? `${resultCount} tools match ${query}` : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 space-y-7">
          {filtered.map((group) => (
            <div key={group.key}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {group.label}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.tools.map((tool) => (
                  <LauncherCard key={tool.href} tool={tool} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            No tools match &ldquo;{query.trim()}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-3 text-sm font-semibold text-primary-400 underline-offset-4 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
