"use client";

import { useEffect, useState } from "react";
import HumanizerTool from "../HumanizerTool/HumanizerTool";
import RecentWorkPanel from "./RecentWorkPanel";
import ExpertHelpCard from "./ExpertHelpCard";
import TopToolsStrip from "./TopToolsStrip";

/**
 * Read the signed-in user's first name for the greeting. Stored by the auth
 * flow alongside the token; resolved after mount so the server and client
 * markup agree on first paint.
 */
function useFirstName(): string | null {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_name")?.trim();
      if (stored) setFirstName(stored.split(/\s+/)[0]);
    } catch {
      // Private mode / blocked storage: the greeting just stays generic.
    }
  }, []);

  return firstName;
}

export default function Dashboard() {
  const firstName = useFirstName();

  return (
    <main className="h-full overflow-y-auto bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {firstName ? `Hi ${firstName}, ` : "Hi, "}what are you working on
            today?
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            Paste a discussion post or paper and get it back in your natural
            voice.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <HumanizerTool embedded />
          </div>

          {/* Right rail. Ordered after the tools in the DOM so keyboard and
              screen-reader users reach the primary task first; on mobile it
              stacks underneath for the same reason. */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <ExpertHelpCard />
            <RecentWorkPanel />
          </aside>
        </div>

        <TopToolsStrip />
      </div>
    </main>
  );
}
