"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowRight, FiLock } from "react-icons/fi";
import Dashboard from "./Dashboard";
import { appendQueryString } from "@/app/utils/url";

type Mode = "inline" | "redirect";

export default function DashboardGate({ mode = "inline" }: { mode?: Mode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentQs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const ok = Boolean(token);
    setHasToken(ok);

    if (!ok && mode === "redirect") {
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      router.replace(
        appendQueryString(
          signInBase,
          `returnUrl=${encodeURIComponent(pathname || "/tools/dashboard")}`,
        ),
      );
    }
  }, [currentQs, mode, pathname, router]);

  // Avoid flicker/hydration mismatch while checking token.
  if (hasToken === null) {
    return (
      <section
        aria-busy="true"
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="h-28 w-full rounded-3xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-850" />
      </section>
    );
  }

  if (!hasToken) {
    if (mode === "redirect") return null;

    return (
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-850 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                <FiLock className="h-4 w-4" />
                <span>Members-only dashboard</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
                Sign in to access your AI tools dashboard
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                Your dashboard keeps all academic tools in one place—fast
                access, consistent UI, and a focused workflow.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={appendQueryString(
                  currentQs ? `/sign-in?${currentQs}` : "/sign-in",
                  `returnUrl=${encodeURIComponent(pathname || "/tools/dashboard")}`,
                )}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                Sign in <FiArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("tools");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
              >
                Explore page
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <Dashboard />;
}
