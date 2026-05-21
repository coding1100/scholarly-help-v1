"use client";

import Image from "next/image";
import Link from "next/link";
import LogoSmall from "@/app/assets/Images/logoSmall.png";

/** ScholarlyHelp brand colors from site logo */
export const SCHOLARLY_BRAND = {
  text: "#353535",
  primary: "#565ADD",
  accent: "#9F92EC",
} as const;

type Props = {
  href?: string;
  compact?: boolean;
  showAdminLabel?: boolean;
  /** Light text for dark sidebar */
  variant?: "default" | "sidebar";
  className?: string;
};

export default function AdminBrand({
  href = "/admin",
  compact = false,
  showAdminLabel = true,
  variant = "default",
  className = "",
}: Props) {
  const onSidebar = variant === "sidebar";
  const content = (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? "h-8 w-8" : "h-10 w-10"} ${onSidebar ? "" : ""}`}
      >
        <Image
          src={LogoSmall}
          alt="ScholarlyHelp"
          width={compact ? 28 : 36}
          height={compact ? 28 : 36}
          className="shrink-0"
          priority
        />
      </span>
      <div className="min-w-0 leading-tight">
        <span
          className={`block truncate font-semibold tracking-tight ${compact ? "text-base" : "text-lg"}`}
        >
          <span className={onSidebar ? "text-[#9f92ec]" : ""} style={onSidebar ? undefined : { color: SCHOLARLY_BRAND.primary }}>
            Scholarly
          </span>
          <span className={onSidebar ? "text-white" : ""} style={onSidebar ? undefined : { color: SCHOLARLY_BRAND.text }}>
            Help
          </span>
        </span>
        {showAdminLabel ? (
          <span
            className={`block text-xs font-medium ${onSidebar ? "text-[#c5cce8]" : "text-[#727780]"}`}
          >
            Admin Panel
          </span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`rounded-md outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#9f92ec] focus-visible:ring-offset-2 ${onSidebar ? "focus-visible:ring-offset-[#283c88]" : "focus-visible:ring-offset-2"}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
