"use client";
import React, { useEffect, useState } from "react";
import { LuZap } from "react-icons/lu";
import PricingPopup from "./PricingPopup";
import { usePathname } from "next/navigation";
import { isGuest } from "@/app/lib/client/guestStudyLimits";
import ToolHeaderUser from "./ToolHeaderUser";
import { normalizeToolPath, resolveToolTitle } from "./toolHeaderTitles";

interface ToolHeaderProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

/**
 * Routes where the upgrade CTA is suppressed. Account & billing is the page
 * for managing the plan, so a second, less specific "Upgrade" button competes
 * with the real controls sitting a few hundred pixels below it.
 */
const HIDE_UPGRADE_ON = new Set(["/tools/account"]);

const ToolHeader: React.FC<ToolHeaderProps> = ({ setFlag, flag }) => {
  const [showPricing, setShowPricing] = useState(false);
  // Guests have no usage/account, so the pricing CTA is hidden for them.
  // Defaults to false during SSR for stable markup until storage is read.
  const [guest, setGuest] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    setGuest(isGuest());
  }, []);

  const normalizedPath = normalizeToolPath(currentPath);
  const title = resolveToolTitle(currentPath);
  const showUpgrade = !guest && !HIDE_UPGRADE_ON.has(normalizedPath);

  return (
    <header className="relative flex h-tool-header flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      {/* Title is left-aligned and owns the free space, so a long tool name
          truncates instead of pushing the account controls off-screen. On
          mobile it starts clear of the floating sidebar toggle. */}
      <h1 className="min-w-0 flex-1 truncate pl-8 text-lg font-bold text-gray-900 transition-colors duration-300 dark:text-gray-100 sm:text-xl lg:pl-0">
        {title}
      </h1>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {showUpgrade ? (
          <button
            type="button"
            onClick={() => setShowPricing(true)}
            aria-label="Upgrade"
            className="flex font-sans items-center justify-center gap-2 rounded-lg bg-secondary-500 px-2.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-secondary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500 sm:pl-3 sm:pr-4"
          >
            <LuZap className="h-4 w-4 shrink-0 text-white" />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
        ) : null}

        <ToolHeaderUser setFlag={setFlag} flag={flag} />
      </div>

      {showPricing && <PricingPopup onClose={() => setShowPricing(false)} />}
    </header>
  );
};

export default ToolHeader;
