"use client";

import { ReactNode } from "react";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";

interface ToolWithExploreProps {
  children: ReactNode;
}

/**
 * Wraps a tool's UI and appends the "All tools" grid below it, mirroring the
 * Study Workspace. Uses a full-height scroll container that sizes to its
 * content, so the grid follows immediately after the tool instead of leaving a
 * tall empty gap. `-mt-*` pulls the grid up to offset the trailing space many
 * tools reserve at the bottom of their own fixed-height layout.
 *
 * Passed as the single child of ToolsLayout, so the layout's cloneElement /
 * token injection still targets one element. Tool components self-manage their
 * access token via localStorage, so wrapping them here does not affect auth.
 */
export default function ToolWithExplore({ children }: ToolWithExploreProps) {
  return (
    <main className="h-full overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {children}
      {/* Pull the grid up to cancel its own top padding (py-12) so it sits
          closer to the tool. Scoped here so the Study Workspace's ToolGrid
          spacing is unaffected. */}
      <div className="-mt-8 sm:-mt-10">
        <ToolGrid />
      </div>
    </main>
  );
}
