import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PostView from "@/app/components/Blog/PostView";
import { getPostById } from "@/app/lib/blog/queries";
import { loadPostView } from "@/app/lib/blog/postView";
import { getAdminSessionRoleFromCookieValue } from "@/app/lib/server/adminSession";

// Admin-only preview of drafts and scheduled posts. Never cached or indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post preview", robots: { index: false, follow: false } };

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const role = getAdminSessionRoleFromCookieValue((await cookies()).get("sh_admin_session")?.value);
  if (role !== "admin") redirect("/admin/login");
  const post = await getPostById((await params).id);
  if (!post) notFound();
  return <PostView {...await loadPostView(post, true)} />;
}
