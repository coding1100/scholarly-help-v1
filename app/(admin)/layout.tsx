'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { AdminConfirmProvider } from '@/app/components/Admin/AdminConfirmProvider';
import { AdminSuccessProvider } from '@/app/components/Admin/AdminSuccessProvider';
import {
  AdminPageTitleProvider,
  useAdminPageTitleOptional,
} from '@/app/components/Admin/AdminPageTitleContext';
import { adminPathKey, isAdminNavLinkActive } from '@/app/lib/adminPathUtils';
import {
  coreLabelFromAdminRoute,
  getAdminPageRouteConfig,
  isPagesMenuEditor,
} from '@/app/lib/adminPageRoutes';
import { stripEditNavPrefix } from '@/app/lib/adminPageDisplay';
import AdminBrand from '@/app/components/Admin/AdminBrand';
import AdminButton from '@/app/components/Admin/AdminButton';
import AdminSidebarNav, {
  mainNavigation,
  pagesNavigation,
} from '@/app/components/Admin/AdminSidebarNav';

<<<<<<< HEAD
function AdminLayoutShell({
=======
function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function ExamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function EssayWritingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function HomeworkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GradeGuaranteeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ExpertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function PlagiarismIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TakeMyClassIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function TakeMyExamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

const mainNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Edit Home', href: '/admin/home', icon: HomeIcon },
  { name: 'Edit Assignment', href: '/admin/assignment', icon: DocumentIcon },
  { name: 'Edit Exam', href: '/admin/exam', icon: ExamIcon },
  { name: 'Edit Homework', href: '/admin/homework', icon: HomeworkIcon },
  { name: 'Edit Online Class', href: '/admin/online-class', icon: AcademicIcon },
  { name: 'Edit Essay Writing', href: '/admin/essay-writing', icon: EssayWritingIcon },
];

const pagesNavigation = [
  { name: 'Edit A/B Grade Guarantee', href: '/admin/a-or-b-grade-guarantee', icon: GradeGuaranteeIcon },
  { name: 'Edit Academic Tools', href: '/admin/tools', icon: ToolsIcon },
  { name: 'Edit Guarantee Anonymity', href: '/admin/guarantee-anonymity', icon: PrivacyIcon },
  { name: 'Edit US-Based PhD Experts', href: '/admin/us-based-phd-experts', icon: ExpertIcon },
  { name: 'Edit Success Stories', href: '/admin/success-stories-and-reviews', icon: SuccessIcon },
  { name: 'Edit Plagiarism-Free Process', href: '/admin/plagiarism-free-process', icon: PlagiarismIcon },
  { name: 'Edit On-Time Delivery', href: '/admin/on-time-delivery-guarantee', icon: DeliveryIcon },
  { name: 'Edit Take My Class', href: '/admin/take-my-class', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class 2', href: '/admin/take-my-class-2', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class 3', href: '/admin/take-my-class-3', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class (Professor)', href: '/admin/take-my-class-professor-does-not-care', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class (Still Doing)', href: '/admin/take-my-class-still-doing', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class (Protect GPA)', href: '/admin/take-my-class-protect-gpa', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class (Always Working Harder)', href: '/admin/take-my-class-always-working-harder', icon: TakeMyClassIcon },
  { name: 'Edit Take My Class (Saving Your Future)', href: '/admin/take-my-class-saving-your-future', icon: TakeMyClassIcon },
  { name: 'Edit Take My Exam', href: '/admin/take-my-exam', icon: TakeMyExamIcon },
  { name: 'Edit Take My Proctored Exam', href: '/admin/take-my-proctored-exam-for-me', icon: TakeMyExamIcon },
];

export default function AdminLayout({
>>>>>>> eeca5a5a4f9a6f2571819dbc68ddd008c40aae70
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [duplicateNavMain, setDuplicateNavMain] = useState<{ name: string; href: string }[]>([]);
  const [duplicateNavPages, setDuplicateNavPages] = useState<{ name: string; href: string }[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const pageTitleCtx = useAdminPageTitleOptional();

  const loadDuplicateNav = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/page-duplicate-index');
      const j = await r.json();
      const mapEntry = (p: { name?: string; href?: string }) => ({
        name: stripEditNavPrefix(typeof p.name === 'string' ? p.name : 'Duplicate'),
        href: typeof p.href === 'string' ? p.href : '/admin',
      });
      setDuplicateNavMain(Array.isArray(j.main) ? j.main.map(mapEntry) : []);
      setDuplicateNavPages(Array.isArray(j.pages) ? j.pages.map(mapEntry) : []);
    } catch {
      setDuplicateNavMain([]);
      setDuplicateNavPages([]);
    }
  }, []);

  useEffect(() => {
    void loadDuplicateNav();
  }, [loadDuplicateNav, pathname]);

  useEffect(() => {
    const onUpdate = () => void loadDuplicateNav();
    window.addEventListener('admin-dynamic-landing-updated', onUpdate);
    return () => window.removeEventListener('admin-dynamic-landing-updated', onUpdate);
  }, [loadDuplicateNav]);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      } catch {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }

    const pagesChildActive = (href: string) => isAdminNavLinkActive(pathname, href);
    if (
      pagesNavigation.some((item) => pagesChildActive(item.href)) ||
      duplicateNavPages.some((item) => pagesChildActive(item.href))
    ) {
      setPagesOpen(true);
    }
  }, [router, pathname, duplicateNavPages]);

  useEffect(() => {
    pageTitleCtx?.setPageTitle(null);
  }, [pathname]);

  const mainNavItem =
    mainNavigation.find((item) => isAdminNavLinkActive(pathname, item.href)) ||
    duplicateNavMain.find((item) => isAdminNavLinkActive(pathname, item.href));
  const pagesNavItem =
    pagesNavigation.find((item) => isAdminNavLinkActive(pathname, item.href)) ||
    duplicateNavPages.find((item) => isAdminNavLinkActive(pathname, item.href));
  const pagesRoute = getAdminPageRouteConfig(pathname);
  const isOnPagesMenu =
    adminPathKey(pathname) === '/admin/pages' ||
    !!pagesNavItem ||
    isPagesMenuEditor(pagesRoute);

  /** Small top-bar label: always "Pages" under Pages menu */
  const topBarEyebrow = isOnPagesMenu
    ? 'Pages'
    : (mainNavItem?.name ?? 'Admin');

  const pagesPageName =
    pagesNavItem?.name ??
    (pagesRoute && isPagesMenuEditor(pagesRoute)
      ? coreLabelFromAdminRoute(pagesRoute)
      : null);

  const topBarTitle =
    pageTitleCtx?.pageTitle ?? mainNavItem?.name ?? pagesPageName ?? topBarEyebrow;

  if (!isAuthenticated) {
    return null;
  }

  if (pathname === '/admin/login') {
    return (
      <AdminConfirmProvider>
        <AdminSuccessProvider>{children}</AdminSuccessProvider>
      </AdminConfirmProvider>
    );
  }

  const sidebarProps = {
    pathname,
    pagesOpen,
    setPagesOpen,
    duplicateNavMain,
    duplicateNavPages,
  };

  return (
    <AdminConfirmProvider>
      <AdminSuccessProvider>
      <div className="admin-shell" data-admin-panel>
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div
            className="fixed inset-0 bg-[#1a2456]/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="admin-sidebar fixed left-0 top-0 bottom-0 flex w-72 max-w-[85vw] flex-col">
            <div className="admin-sidebar-brand flex items-center justify-between gap-2 px-4 py-4">
              <AdminBrand href="/admin" compact variant="sidebar" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-[#c5cce8] hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AdminSidebarNav {...sidebarProps} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 flex-col lg:flex">
          <div className="admin-sidebar-brand flex shrink-0 items-center px-4 py-5">
            <AdminBrand href="/admin" variant="sidebar" />
          </div>
          <AdminSidebarNav {...sidebarProps} />
        </aside>

        {/* Main column */}
        <div className="lg:pl-64">
          <header className="admin-topbar sticky top-0 z-30">
            <div className="admin-topbar-accent" aria-hidden />
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg border border-[#e2e8f4] p-2 text-[#283c88] hover:bg-[#eef0f8] lg:hidden"
                    aria-label="Open menu"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#565add]">
                      {topBarEyebrow}
                    </p>
                    <h1 className="truncate text-xl font-bold text-[#1a2456] sm:text-2xl">
                      {topBarTitle}
                    </h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <span className="admin-welcome-pill hidden sm:inline">Welcome back</span>
                  <AdminButton
                    variant="logout"
                    className="inline-flex items-center gap-1.5 bg-[#da0e0e] text-white hover:bg-[#b80c0c]"
                    onClick={() => {
                      localStorage.removeItem('adminToken');
                      router.push('/admin/login');
                    }}
                  >
                    Logout
                  </AdminButton>
                </div>
              </div>
            </div>
          </header>

          <main className="admin-main">
            <div className="admin-content-wrap">{children}</div>
          </main>
        </div>
      </div>
      </AdminSuccessProvider>
    </AdminConfirmProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageTitleProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminPageTitleProvider>
  );
}
