import { redirect } from "next/navigation";

/** Legacy URLs /admin/landing/landing-dup-{slug} → /admin/{slug} */
export default async function LegacyLandingAdminRedirect({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const raw = decodeURIComponent(pageId || "");
  const slug = raw.startsWith("landing-dup-") ? raw.replace(/^landing-dup-/, "") : raw;
  redirect(`/admin/${encodeURIComponent(slug)}`);
}
