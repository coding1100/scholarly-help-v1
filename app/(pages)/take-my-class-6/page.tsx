import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import HeroHeading from "@/app/components/LandingPage/HeroHeading";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";
import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";

// Hardcoded headline/subheadline for this variant — every other section
// (below-fold content, badges, FAQ, etc.) reuses /take-my-class's real data
// so the rest of the page matches it exactly, not generic site-wide defaults.
const heroContent = {
  mainHeading:
    "Never Write Another Discussion Post or Take Another Boring Quiz Again.",
  description:
    "Why waste hours on mindless busywork that has nothing to do with your career? Hand the keys over to our US-based experts, get a guaranteed A or B, and never think about a filler class again.",
  btn1: "",
  btn2: "",
  formBackImg2: undefined as any,
};

// LCP is this H1. Rendering it here (server component) instead of inside the
// "use client" HeroSection removes the ~2.5s element render delay — mirrors
// /take-my-class's pattern.
// "Never Write Another Discussion Post" (the leading, most concrete promise)
// is wrapped in the same orange span /take-my-class uses for its
// highlighted clause (text-[#F56200]), matching the -4 emphasis pattern
// (this headline has no "|" or em dash to split on).
const mainHeading = heroContent.mainHeading.replace(
  "Never Write Another Discussion Post",
  '<span class="text-[#F56200]">Never Write Another Discussion Post</span>',
);

const PAGE_TITLE =
  "Never Write Another Discussion Post Again | ScholarlyHelp";
const PAGE_DESCRIPTION =
  "Hand your discussion posts, quizzes, and finals to US-based experts and get a guaranteed A or B, without the busywork.";

// Prefer a take-my-class-6-specific CMS doc if one is ever created; otherwise
// reuse the real /take-my-class content for every non-hero section.
const fetchTakeMyClass6Data = cache(async () => {
  try {
    const query = {
      $or: [{ id: "take-my-class-6" }, { id: "take-my-class" }],
    };
    const data = await getPageData("pages", query, { readPreference: "primary" });
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (error) {
    console.error("Error fetching take-my-class-6 data:", error);
    return null;
  }
});

const Page = async () => {
  const pageData = await fetchTakeMyClass6Data();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const pageUrl = `${baseUrl}/take-my-class-6/`;

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={PAGE_TITLE}
        metaDescription={PAGE_DESCRIPTION}
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
          heroContent={heroContent}
          headingSlot={
            // max-w-2xl mirrors HeroLead's own wrapper so the heading keeps
            // its previous width constraint on single-column (mobile) layout.
            <div className="max-w-2xl">
              <HeroHeading
                mainHeading={mainHeading}
                spanClassName="md:pt-5 block"
              />
            </div>
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
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}take-my-class-6/`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
