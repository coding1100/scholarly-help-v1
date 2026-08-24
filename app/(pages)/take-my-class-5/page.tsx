import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
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
    "Get a Guaranteed A or B in Any Online Class—Even If You're Failing Right Now.",
  description:
    "Stop drowning in subjects you hate or stressing over failed midterms. Our elite, US-based professionals take over your coursework, quizzes, and finals so you secure the grade you need to graduate.",
  btn1: "",
  btn2: "",
  formBackImg2: undefined as any,
};

const PAGE_TITLE = "Guaranteed A or B — Even If You're Failing | ScholarlyHelp";
const PAGE_DESCRIPTION =
  "Failing right now? Our elite US-based professionals take over your coursework, quizzes, and finals so you secure the grade you need to graduate.";

// Prefer a take-my-class-5-specific CMS doc if one is ever created; otherwise
// reuse the real /take-my-class content for every non-hero section.
const fetchTakeMyClass5Data = cache(async () => {
  try {
    const query = {
      $or: [{ id: "take-my-class-5" }, { id: "take-my-class" }],
    };
    const data = await getPageData("pages", query, { readPreference: "primary" });
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (error) {
    console.error("Error fetching take-my-class-5 data:", error);
    return null;
  }
});

const Page = async () => {
  const pageData = await fetchTakeMyClass5Data();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const pageUrl = `${baseUrl}/take-my-class-5/`;

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={PAGE_TITLE}
        metaDescription={PAGE_DESCRIPTION}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection useHeroForm2 heroContent={heroContent} />
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
  const canonicalUrl = `${baseUrl}take-my-class-5/`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
