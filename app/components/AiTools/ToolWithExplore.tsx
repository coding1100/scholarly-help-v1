"use client";

import { ReactNode } from "react";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";

interface ToolWithExploreProps {
  children: ReactNode;
  /**
   * Optional right rail (e.g. the Done-for-you card). Sits beside the tool on
   * wide screens and drops below it on smaller ones, so the tool's own input
   * and button stay first on mobile.
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
          <aside className="mx-auto w-full max-w-[840px] px-4 pt-6 md:px-8 xl:mx-0 xl:w-[320px] xl:max-w-none xl:shrink-0 xl:pl-0 xl:pr-6 xl:pt-8">
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
