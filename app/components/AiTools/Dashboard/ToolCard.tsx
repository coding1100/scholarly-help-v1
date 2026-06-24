import Link from "next/link";
import type { IconType } from "react-icons";
import { FiArrowRight } from "react-icons/fi";

export type ToolCategory =
  | "essay-writing"
  | "research"
  | "math-science"
  | "study-tools";

export type ToolBadge = "Popular" | "Free" | "New" | "Focus";

export type ToolCardData = {
  name: string;
  description?: string;
  href: string;
  icon: IconType;
  badge?: ToolBadge;
  /** Category used by the dashboard tab filter. */
  category: ToolCategory;
  /** Per-tool action label, e.g. "Generate essay". Defaults to "Use tool". */
  cta?: string;
};

// Note: this project's Tailwind config REPLACES the default palette — only
// `primary` (#565add brand purple), `secondary` (#ff641a orange), `gray`,
// `white`, `black` exist. `indigo`/`amber`/etc. are NOT generated, so all
// accents below use the available palette.
const BADGE_STYLES: Record<ToolBadge, string> = {
  Popular: "bg-secondary-200 text-secondary-500 ring-secondary-400/30",
  Free: "bg-primary-200 text-primary-400 ring-primary-300",
  New: "bg-primary-100 text-primary-400 ring-primary-300",
  Focus: "bg-primary-200 text-primary-500 ring-primary-300",
};

export default function ToolCard({ tool }: { tool: ToolCardData }) {
  const Icon = tool.icon;

  // Compact card: icon + badge, tool name, and a per-tool action button. The
  // card itself is not clickable — only the button navigates.
  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-gray-200 bg-primary-100 p-4 shadow-[0_4px_16px_rgba(86,90,221,0.08)] transition duration-200 hover:-translate-y-1 hover:border-primary-300 hover:bg-white hover:shadow-[0_12px_28px_rgba(86,90,221,0.20)]">
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-200 text-primary-400 ring-1 ring-primary-300">
          <Icon className="h-5 w-5" />
        </div>
        {tool.badge ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${BADGE_STYLES[tool.badge]}`}
          >
            {tool.badge}
          </span>
        ) : null}
      </div>

      <h3 className="min-w-0 text-base font-semibold text-gray-900 dark:text-gray-100">
        {tool.name}
      </h3>

      <Link
        href={tool.href}
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-primary-300 hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        aria-label={`${tool.cta || "Use"} — ${tool.name}`}
      >
        {tool.cta || "Use tool"} <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
