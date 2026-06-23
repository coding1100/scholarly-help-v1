import Link from "next/link";
import type { IconType } from "react-icons";
import { FiArrowRight } from "react-icons/fi";

export type ToolCardData = {
  name: string;
  description?: string;
  href: string;
  icon: IconType;
  badge?: string;
};

export default function ToolCard({ tool }: { tool: ToolCardData }) {
  const Icon = tool.icon;

  // Compact card: icon + title + "Use Tool" only. No description, and the card
  // itself is not clickable — only the button navigates.
  return (
    <div className="group relative flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-850">
      <div className="flex w-full items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:ring-indigo-400/10">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-gray-900 dark:text-gray-100">
          {tool.name}
        </h3>
      </div>

      <Link
        href={tool.href}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus-visible:ring-offset-gray-900"
        aria-label={`Use ${tool.name}`}
      >
        Use Tool <FiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
