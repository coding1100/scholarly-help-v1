"use client";

import { ReactNode } from "react";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";

interface ToolWithExploreProps {
  children: ReactNode;
  /**
   * Optional right rail (e.g. the Done-for-you card). Sits beside the tool on
   * xl screens. Below that the rail takes no space: the Done-for-you card
   * hides itself there and shows as a sticky bottom bar instead.
   */
  rail?: ReactNode;
}

/**
 * Wraps a tool's UI and appends the "All tools" grid below it, mirroring the
 * Study Workspace. Tool components size to their content (no reserved
 * viewport-height layouts), so the grid follows right after the tool with the
 * same spacing as the Study Workspace and this outer container is the single
 * scroll area for the page.
 *
 * Passed as the single child of ToolsLayout, so the layout's cloneElement /
 * token injection still targets one element. Tool components self-manage their
 * access token via localStorage, so wrapping them here does not affect auth.
 */
export default function ToolWithExplore({
  children,
  rail,
}: ToolWithExploreProps) {
  return (
    <main className="h-full overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {rail ? (
        <div className="flex flex-col xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">{children}</div>
          <aside className="xl:w-[344px] xl:shrink-0 xl:pr-6 xl:pt-8">
            {rail}
          </aside>
        </div>
      ) : (
        children
      )}
      <ToolGrid />
    </main>
  );
}
