import { FC, ReactNode } from "react";
import Link from "next/link";
import type { LinkButton } from "./types";

/** Anchor of the Done-for-you panel in the hero. */
export const DONE_FOR_YOU_ID = "done-for-you";

/** Shared width and side padding of the content sections. */
export const SECTION_WIDTH = "mx-auto max-w-[1000px] px-4 md:px-6";

/** Orange call-to-action fill used across the template. */
export const ORANGE_BUTTON =
  "bg-[#F26A1B] font-bold text-white no-underline transition-colors hover:bg-[#D85A10]";

/**
 * Section title and subtitle: left-aligned on mobile with the subtitle
 * hidden, centred on desktop.
 */
export const SectionHeading: FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <>
    <h2 className="text-[22px] font-bold leading-[1.3] md:text-center md:text-[28px] md:leading-[1.25]">
      {title}
    </h2>
    {subtitle ? (
      <p className="hidden text-xs text-[#3B3486] md:block md:text-center">
        {subtitle}
      </p>
    ) : null}
  </>
);

/**
 * A content-driven link: in-page anchors render as plain <a> so the browser
 * scrolls, page paths go through next/link.
 */
export const ContentLink: FC<{
  link: LinkButton;
  className: string;
  children?: ReactNode;
}> = ({ link, className, children }) =>
  link.href.startsWith("#") ? (
    <a href={link.href} className={className}>
      {children ?? link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {children ?? link.label}
    </Link>
  );
