"use client";

import Image from "next/image";

export type ToolsApiLoaderProps = {
  show: boolean;
  /** Cover only the nearest positioned ancestor */
  contained?: boolean;
  /** Offset for the desktop tools sidebar (w-60) when using a full-area overlay */
  respectToolsSidebar?: boolean;
  /** Offset below ToolHeader (see tailwind theme: tool-header) on /tools/* layout pages */
  respectToolHeader?: boolean;
  /** Larger GIF for main workspace overlays; use "md" for sidebars/cards */
  size?: "md" | "lg";
  className?: string;
};

const LOADER_SIZE_CLASSES = {
  md: "h-[clamp(4.5rem,18vmin,10rem)] w-[clamp(4.5rem,18vmin,10rem)] sm:h-[clamp(5rem,16vmin,11rem)] sm:w-[clamp(5rem,16vmin,11rem)]",
  lg: "h-[clamp(7rem,26vmin,14rem)] w-[clamp(7rem,26vmin,14rem)] sm:h-[clamp(8rem,24vmin,16rem)] sm:w-[clamp(8rem,24vmin,16rem)] lg:h-[clamp(9rem,22vmin,18rem)] lg:w-[clamp(9rem,22vmin,18rem)]",
} as const;

export function ToolsApiLoader({
  show,
  contained = false,
  respectToolsSidebar = true,
  respectToolHeader = true,
  size,
  className = "",
}: ToolsApiLoaderProps) {
  if (!show) return null;

  const imageSizeClass =
    LOADER_SIZE_CLASSES[size ?? (contained ? "md" : "lg")];

  const positionClasses = contained
    ? "absolute inset-0 z-50"
    : [
        "fixed z-[100] right-0 bottom-0",
        respectToolHeader ? "top-tool-header" : "top-0",
        respectToolsSidebar ? "left-0 lg:left-60" : "left-0",
      ].join(" ");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`${positionClasses} flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-[2px] pointer-events-auto ${className}`}
    >
      <Image
        src="/videos/icon.gif"
        alt=""
        width={320}
        height={320}
        unoptimized
        priority
        className={`${imageSizeClass} object-contain`}
      />
    </div>
  );
}

/**
 * Suspense fallback for /tools/* pages: a quiet page skeleton. The animated
 * logo is reserved for "your request is running", so opening a page never
 * looks like a generation that started on its own.
 */
export function ToolsSuspenseFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-screen bg-white dark:bg-gray-900"
    >
      <div className="hidden w-60 shrink-0 border-r border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 lg:block" />
      <div className="flex-1 animate-pulse">
        <div className="h-tool-header border-b border-gray-200 dark:border-gray-700" />
        <div className="mx-auto max-w-[840px] space-y-4 px-4 pt-8">
          <div className="h-8 w-1/2 rounded-lg bg-gray-100 dark:bg-gray-800" />
          <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-11 w-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default ToolsApiLoader;
