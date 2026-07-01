"use client";

import Link from "next/link";
import {
  adminNavLinkClass,
  isAdminNavLinkActive,
} from "@/app/lib/adminPathUtils";
import {
  buildMainNavigation,
  getMainNavIcon,
  PagesFolderNavIcon,
} from "@/app/components/Admin/AdminNavIcons";

const mainNavigation = buildMainNavigation();

const pagesNavigation = [
  { name: "A/B Grade Guarantee", href: "/admin/a-or-b-grade-guarantee" },
  { name: "Academic Tools", href: "/admin/tools" },
  { name: "Academic Research", href: "/admin/academic-research" },
  { name: "Guarantee Anonymity", href: "/admin/guarantee-anonymity" },
  { name: "US-Based PhD Experts", href: "/admin/us-based-phd-experts" },
  { name: "Success Stories", href: "/admin/success-stories-and-reviews" },
  { name: "Plagiarism-Free Process", href: "/admin/plagiarism-free-process" },
  { name: "On-Time Delivery", href: "/admin/on-time-delivery-guarantee" },
  { name: "Take My Class", href: "/admin/take-my-class" },
  { name: "Take My Class 2", href: "/admin/take-my-class-2" },
  { name: "Take My Class 3", href: "/admin/take-my-class-3" },
  { name: "Take My Class (Professor)", href: "/admin/take-my-class-professor-does-not-care" },
  { name: "Take My Class (Still Doing)", href: "/admin/take-my-class-still-doing" },
  { name: "Take My Class (Protect GPA)", href: "/admin/take-my-class-protect-gpa" },
  { name: "Take My Class (Always Working Harder)", href: "/admin/take-my-class-always-working-harder" },
  { name: "Take My Class (Saving Your Future)", href: "/admin/take-my-class-saving-your-future" },
  { name: "Take My Exam", href: "/admin/take-my-exam" },
  { name: "Take My Proctored Exam", href: "/admin/take-my-proctored-exam-for-me" },
  { name: "Take My TEAS Exam", href: "/admin/take-my-teas-exam" },
  { name: "Take My HESI Exam", href: "/admin/take-my-hesi-exam" },
];

function PagesNavDot({ active }: { active?: boolean }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-[#9f92ec]" : "bg-[#6b7aa8]"}`}
      />
    </span>
  );
}

type Props = {
  pathname: string;
  pagesOpen: boolean;
  setPagesOpen: (open: boolean) => void;
  duplicateNavMain: { name: string; href: string }[];
  duplicateNavPages: { name: string; href: string }[];
  onNavigate?: () => void;
};

export default function AdminSidebarNav({
  pathname,
  pagesOpen,
  setPagesOpen,
  duplicateNavMain,
  duplicateNavPages,
  onNavigate,
}: Props) {
  const pagesGroupActive =
    pagesNavigation.some((item) => isAdminNavLinkActive(pathname, item.href)) ||
    duplicateNavPages.some((item) => isAdminNavLinkActive(pathname, item.href));

  return (
    <nav className="admin-sidebar-scroll flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-5 min-h-0">
      <p className="admin-nav-section">Main menu</p>
      {mainNavigation.map((item) => {
        const isActive = isAdminNavLinkActive(pathname, item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={adminNavLinkClass(isActive)}
            onClick={onNavigate}
          >
            <item.icon />
            <span>{item.name}</span>
          </Link>
        );
      })}
      {duplicateNavMain.map((item) => {
        const isActive = isAdminNavLinkActive(pathname, item.href);
        const Icon = getMainNavIcon(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={adminNavLinkClass(isActive)}
            onClick={onNavigate}
          >
            <Icon />
            <span>{item.name}</span>
          </Link>
        );
      })}

      <p className="admin-nav-section mt-4">Pages</p>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setPagesOpen(!pagesOpen)}
          className={`w-full ${adminNavLinkClass(pagesGroupActive)}`}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <PagesFolderNavIcon />
            <span>Pages</span>
          </span>
          <svg
            className={`h-4 w-4 shrink-0 opacity-80 transition-transform ${pagesOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {pagesOpen ? (
          <div className="ml-2 space-y-0.5 border-l border-white/10 pl-2">
            {pagesNavigation.map((item) => {
              const isActive = isAdminNavLinkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={adminNavLinkClass(isActive)}
                  onClick={onNavigate}
                >
                  <PagesNavDot active={isActive} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {duplicateNavPages.map((item) => {
              const isActive = isAdminNavLinkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={adminNavLinkClass(isActive)}
                  onClick={onNavigate}
                >
                  <PagesNavDot active={isActive} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export { mainNavigation, pagesNavigation };
