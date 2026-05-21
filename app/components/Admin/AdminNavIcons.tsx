import type { FC, ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = "h-5 w-5 shrink-0";

function Svg({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={base}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const DashboardNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </Svg>
);

export const HomeNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </Svg>
);

export const AssignmentNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </Svg>
);

export const ExamNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 011.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </Svg>
);

export const HomeworkNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </Svg>
);

export const OnlineClassNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </Svg>
);

export const EssayWritingNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </Svg>
);

export const PagesFolderNavIcon: FC<IconProps> = (props) => (
  <Svg {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </Svg>
);

/** Icons for duplicated pages listed under main menu (each href gets a stable distinct icon) */
const dynamicMainIcons = [
  EssayWritingNavIcon,
  AssignmentNavIcon,
  ExamNavIcon,
  OnlineClassNavIcon,
  HomeworkNavIcon,
  DashboardNavIcon,
] as const;

const MAIN_NAV_ICON_BY_HREF: Record<string, FC<IconProps>> = {
  "/admin": DashboardNavIcon,
  "/admin/home": HomeNavIcon,
  "/admin/assignment": AssignmentNavIcon,
  "/admin/exam": ExamNavIcon,
  "/admin/homework": HomeworkNavIcon,
  "/admin/online-class": OnlineClassNavIcon,
  "/admin/essay-writing": EssayWritingNavIcon,
};

function normalizeAdminHref(href: string): string {
  let p = href.trim().replace(/\/+$/, "") || "/admin";
  if (!p.startsWith("/admin")) p = `/admin/${p.replace(/^\/+/, "")}`;
  return p;
}

export function getMainNavIcon(href: string): FC<IconProps> {
  const key = normalizeAdminHref(href);
  if (MAIN_NAV_ICON_BY_HREF[key]) return MAIN_NAV_ICON_BY_HREF[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * (i + 1)) % 9973;
  return dynamicMainIcons[hash % dynamicMainIcons.length];
}

export type AdminMainNavItem = {
  name: string;
  href: string;
  icon: FC<IconProps>;
};

export function buildMainNavigation(): AdminMainNavItem[] {
  return [
    { name: "Dashboard", href: "/admin", icon: DashboardNavIcon },
    { name: "Home", href: "/admin/home", icon: HomeNavIcon },
    { name: "Assignment", href: "/admin/assignment", icon: AssignmentNavIcon },
    { name: "Exam", href: "/admin/exam", icon: ExamNavIcon },
    { name: "Homework", href: "/admin/homework", icon: HomeworkNavIcon },
    { name: "Online Class", href: "/admin/online-class", icon: OnlineClassNavIcon },
    { name: "Essay Writing", href: "/admin/essay-writing", icon: EssayWritingNavIcon },
  ];
}
