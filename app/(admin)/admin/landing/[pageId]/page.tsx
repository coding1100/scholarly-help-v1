import { redirect } from "next/navigation";

/** Legacy URLs /admin/landing/landing-dup-{slug} → /admin/{slug} */
export default function LegacyLandingAdminRedirect({
  params,
}: {
  params: { pageId: string };
}) {
  const raw = decodeURIComponent(params.pageId || "");
  const slug = raw.startsWith("landing-dup-") ? raw.replace(/^landing-dup-/, "") : raw;
  redirect(`/admin/${encodeURIComponent(slug)}`);
}
