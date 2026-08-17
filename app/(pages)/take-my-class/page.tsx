import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import HeroHeading from "@/app/components/LandingPage/HeroHeading";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// ISR: serve cached HTML (fast TTFB) and re-render at most every 5 minutes.
// Admin saves trigger revalidatePath() for instant freshness, so this TTL is
// only a fallback for out-of-band DB edits.
export const revalidate = 300;

// cache() dedupes the Mongo round-trip between the page render and
// generateMetadata within a single request.
const fetchTakeMyClassData = cache(async () => {
  try {
    const query = {
      id: "take-my-class",
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-class data:", error);
    return null;
  }
});

import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";

const Page = async () => {
  const pageData = await fetchTakeMyClassData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.takeMyClass.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.takeMyClass.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.takeMyClass.url}`;
  // LCP is this H1. Rendering it here (server component) instead of inside the
  // "use client" HeroSection removes the ~2.5s element render delay.
  const mainHeading = pageData?.heroSection?.mainHeading ?? "";

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      {/* Hand-inlined critical CSS for the LCP element (hero H1) so it paints
          styled before the external stylesheet finishes loading. Values must
          stay in sync with the Tailwind classes on that H1 in HeroLead.tsx. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #hero-section{background:#F5F6FA}
            .tmc-hero-heading{font-weight:600;font-size:30px;line-height:1.1;color:#000}
            @media (min-width:768px){.tmc-hero-heading{font-size:48px}}
          `,
        }}
      />
      <MainLayout>
        <HeroSection
          useHeroForm2
          headingSlot={
            mainHeading ? (
              // max-w-2xl mirrors HeroLead's own wrapper so the heading keeps
              // its previous width constraint on single-column (mobile) layout.
              <div className="max-w-2xl">
                <HeroHeading
                  mainHeading={mainHeading}
                  spanClassName="md:pt-5 block"
                />
              </div>
            ) : undefined
          }
        />
        <DelayedBelowFold>
          <BelowFoldLanding />
        </DelayedBelowFold>
      </MainLayout>
    </TakeMyClassDataProvider>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyClassData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}${MetaData.takeMyClass.url}`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyClass.title,
    description:
      pageData?.meta?.description || MetaData.takeMyClass.description,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
