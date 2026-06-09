/**
 * Admin page routes use the sidebar and auth from `app/(admin)/layout.tsx`.
 * This layout only passes through page content to avoid a duplicate nav bar.
 */
export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
