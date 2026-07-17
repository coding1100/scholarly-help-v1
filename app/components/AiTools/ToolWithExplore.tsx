"use client";

import { ReactNode } from "react";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";

interface ToolWithExploreProps {
  children: ReactNode;
}

/**
 * Wraps a tool's UI and appends the "All tools" grid below it, mirroring the
 * Study Workspace. Tool components use a fixed-height (roughly full-viewport)
 * scroll area, so this provides an outer scroll container (`h-[90vh]
 * overflow-y-auto`) that lets the user scroll past the tool to reach the grid.
 *
 * Passed as the single child of ToolsLayout, so the layout's cloneElement /
 * token injection still targets one element. Tool components self-manage their
 * access token via localStorage, so wrapping them here does not affect auth.
 */
export default function ToolWithExplore({ children }: ToolWithExploreProps) {
  return (
    <main className="h-[90vh] overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {children}
      <ToolGrid />
    </main>
  );
}
