'use client';

import './admin.css';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<'admin' | 'report_admin'>('admin');
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

    let active = true;
    void fetch('/api/admin/session', { cache: 'no-store' }).then(async (response) => {
      if (!active) return;
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setAdminRole(data?.role === 'report_admin' ? 'report_admin' : 'admin');
        setIsAuthenticated(true);
      } else router.push('/admin/login');
    }).catch(() => {
      if (active) router.push('/admin/login');
    });

    const pagesChildActive = (href: string) => isAdminNavLinkActive(pathname, href);
    if (
      pagesNavigation.some((item) => pagesChildActive(item.href)) ||
      duplicateNavPages.some((item) => pagesChildActive(item.href))
    ) {
      setPagesOpen(true);
    }
    return () => { active = false; };
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
    role: adminRole,
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
                      void fetch('/api/admin/logout', { method: 'POST' });
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
