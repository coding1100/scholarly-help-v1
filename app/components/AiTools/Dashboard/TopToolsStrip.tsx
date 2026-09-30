import Link from "next/link";
import { TOP_TOOLS } from "./toolGroups";

/**
 * The four shortcut cards along the bottom of the Study Hub. Resolved from the
 * tool registry (see toolGroups.ts), so nothing here can outlive the tool it
 * points at.
 */
export default function TopToolsStrip() {
  if (TOP_TOOLS.length === 0) return null;

  return (
    <section aria-label="Top tools" className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Top tools
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TOP_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-[0_10px_24px_rgba(86,90,221,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-200 text-primary-400 ring-1 ring-primary-300 dark:bg-primary-500/20">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                  {tool.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                  {tool.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
