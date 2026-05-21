"use client";

import Link from "next/link";

const cards = [
  {
    title: "Assignments",
    subtitle: "Manage Content",
    href: "/admin/assignment",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    iconBg: "bg-[#eef0f8]",
    iconColor: "text-[#283c88]",
    cta: "Edit assignments",
  },
  {
    title: "Online Classes",
    subtitle: "Manage Content",
    href: "/admin/online-class",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    ),
    iconBg: "bg-[#edeefb]",
    iconColor: "text-[#565add]",
    cta: "Edit online classes",
  },
  {
    title: "FAQ",
    subtitle: "Manage Questions",
    href: "/admin/faq",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    iconBg: "bg-[#f3f1fc]",
    iconColor: "text-[#565add]",
    cta: "Edit FAQ",
  },
  {
    title: "Analytics",
    subtitle: "View Stats",
    href: null,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
    iconBg: "bg-[#eef0f8]",
    iconColor: "text-[#727780]",
    cta: "Coming soon",
    disabled: true,
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a2456]">Overview</h2>
        <p className="mt-1 text-sm text-[#4b5563]">
          Quick access to content editors and site sections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="admin-stat-card">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <svg
                    className={`h-7 w-7 ${card.iconColor}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    {card.icon}
                  </svg>
                </div>
                <dl className="min-w-0">
                  <dt className="truncate text-sm font-medium text-[#727780]">{card.title}</dt>
                  <dd className="text-lg font-semibold text-[#1a2456]">{card.subtitle}</dd>
                </dl>
              </div>
            </div>
            <div className="admin-stat-card-footer px-5 py-3">
              {card.href ? (
                <Link href={card.href} className="admin-stat-card-link">
                  {card.cta} →
                </Link>
              ) : (
                <span className="text-sm font-medium text-[#727780]">{card.cta}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-[#1a2456]">Recent Activity</h2>
        <div className="overflow-hidden rounded-xl border border-[#e2e8f4] bg-white shadow-sm">
          <ul className="divide-y divide-[#eef0f8]">
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[#283c88]">
                  Updated assignment content
                </p>
                <span className="shrink-0 rounded-full bg-[#eef0f8] px-2.5 py-0.5 text-xs font-semibold text-[#283c88]">
                  Success
                </span>
              </div>
              <p className="mt-1 text-sm text-[#727780]">2 hours ago</p>
            </li>
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[#565add]">
                  Updated online class content
                </p>
                <span className="shrink-0 rounded-full bg-[#edeefb] px-2.5 py-0.5 text-xs font-semibold text-[#565add]">
                  Success
                </span>
              </div>
              <p className="mt-1 text-sm text-[#727780]">4 hours ago</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
