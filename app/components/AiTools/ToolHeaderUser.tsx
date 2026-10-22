"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronDown } from "react-icons/fi";
import AccountPopover from "./AccountPopover";
import { isGuest } from "@/app/lib/client/guestStudyLimits";

interface ToolHeaderUserProps {
  setFlag: (value: boolean) => void;
  flag: boolean;
}

/**
 * Signed-in identity chip in the tools header.
 *
 * This block used to sit at the top of the sidebar; the design moves it here
 * and gives the sidebar's top slot to the logo. AccountPopover comes with it
 * unchanged, so sign-out and the usage/pricing panel behave exactly as before.
 */
export default function ToolHeaderUser({ setFlag, flag }: ToolHeaderUserProps) {
  const [name, setName] = useState("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [guest, setGuest] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("user_name");
      const storedImage = localStorage.getItem("profile_image");
      if (storedName) setName(storedName);
      if (storedImage) setProfileImage(storedImage);
    } catch {
      // Blocked storage: fall through to the neutral default.
    }
    setGuest(isGuest());
  }, []);

  // Close on an outside click or Escape — without this the popover survives
  // navigation clicks elsewhere in the header and hangs over the page.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (guest) {
    return (
      <Link
        href="/sign-in"
        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary-300 hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 p-1.5 transition sm:gap-2 sm:pr-3 hover:border-primary-300 hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-200 text-xs font-bold uppercase text-primary-400"
          >
            {name.charAt(0)}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-gray-800 dark:text-gray-100 sm:inline">
          {name}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 shadow-lg">
          <AccountPopover setFlag={setFlag} flag={flag} />
        </div>
      ) : null}
    </div>
  );
}
