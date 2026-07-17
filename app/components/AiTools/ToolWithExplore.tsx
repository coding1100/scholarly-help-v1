"use client";

import { ReactNode } from "react";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";

interface ToolWithExploreProps {
  children: ReactNode;
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
export default function ToolWithExplore({ children }: ToolWithExploreProps) {
  return (
    <main className="h-full overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {children}
      <ToolGrid />
    </main>
  );
}
