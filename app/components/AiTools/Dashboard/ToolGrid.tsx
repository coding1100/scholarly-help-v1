"use client";

import { useMemo, useState } from "react";
import ToolCard from "./ToolCard";
import { TOOLS as tools, type ToolCategory } from "./toolsData";

type TabKey = "all" | ToolCategory;

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All tools" },
  { key: "essay-writing", label: "Essay writing" },
  { key: "research", label: "Research" },
  { key: "math-science", label: "Math & Science" },
  { key: "study-tools", label: "Study tools" },
];

export default function ToolGrid() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const visibleTools = useMemo(
    () =>
      activeTab === "all"
        ? tools
        : tools.filter((tool) => tool.category === activeTab),
    [activeTab],
  );

  const toolCount = visibleTools.length;

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Category tabs — horizontally scrollable on mobile, wrap on desktop. */}
      <div
        role="tablist"
        aria-label="Tool categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
                active
                  ? "border-primary-400 bg-primary-400 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {toolCount} {toolCount === 1 ? "tool" : "tools"}
      </p>

      {visibleTools.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTools.map((tool) => (
            <ToolCard key={`${tool.category}-${tool.href}`} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          No tools in this category yet.
        </p>
      )}
    </section>
  );
}
