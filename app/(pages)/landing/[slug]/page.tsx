import MainLayout from "@/app/MainLayout";
import DynamicDuplicateLandingView from "@/app/components/LandingPage/DynamicDuplicateLandingView";
import {
  dynamicLandingCanonicalUrl,
  fetchPublishedDynamicLanding,
  dynamicLandingPublicPath,
  normalizePublicSlug,
} from "@/app/lib/dynamicLandingPage";
import type { Metadata } from "next";

export const revalidate = 0;

type Props = { params: { slug: string } };

export default async function DynamicLandingPage({ params }: Props) {
  const slug = normalizePublicSlug(params.slug);
  const pageData = await fetchPublishedDynamicLanding(slug);

  if (!pageData) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
          <p className="mt-2 text-gray-600">
            This landing is unpublished or does not exist. Publish it from the admin
            editor (
            <code className="rounded bg-gray-100 px-1">Published (visible on the website)</code>
            ), then open{" "}
            <code className="rounded bg-gray-100 px-1">{dynamicLandingPublicPath(slug)}</code>
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <DynamicDuplicateLandingView
      pageData={pageData as Record<string, unknown>}
      slug={slug}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = normalizePublicSlug(params.slug);
  const pageData = await fetchPublishedDynamicLanding(slug);
  if (!pageData) {
    return { title: "Not found" };
  }
  const doc = pageData as {
    meta?: { title?: string; description?: string; canonicalUrl?: string };
    adminNavLabel?: string;
    isDynamicLandingDuplicate?: boolean;
  };
  const canonical = doc?.isDynamicLandingDuplicate
    ? dynamicLandingCanonicalUrl(slug, null)
    : doc?.meta?.canonicalUrl || dynamicLandingPublicPath(slug).replace(/\/$/, "");

  return {
    title: doc?.meta?.title || doc?.adminNavLabel || "Scholarly Help",
    description: doc?.meta?.description,
    alternates: {
      canonical: canonical.replace(/\/$/, ""),
    },
  };
}
