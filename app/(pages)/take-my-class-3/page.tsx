import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import StepFormHero from "@/app/components/LandingPage/StepFormHero";
import HeroHeading from "@/app/components/LandingPage/HeroHeading";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// /take-my-class with a centred hero and the two-step quote form. Content
// comes from its own CMS doc, edited at /admin/take-my-class-3.
const PAGE_ID = "take-my-class-3";

// ISR as on /take-my-class; admin saves revalidate this path.
export const revalidate = 300;

// cache() dedupes the Mongo round-trip between the page render and
// generateMetadata within a single request.
const fetchTakeMyClass3Data = cache(async () => {
  try {
    const query = {
      $or: [{ id: PAGE_ID }, { pageType: PAGE_ID }],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error(`Error fetching ${PAGE_ID} data:`, error);
    return null;
  }
});

const Page = async () => {
  const pageData = await fetchTakeMyClass3Data();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.takeMyClass.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.takeMyClass.description;
  const pageUrl = pageData?.meta?.canonicalUrl || `${baseUrl}/${PAGE_ID}/`;
  const mainHeading = pageData?.heroSection?.mainHeading ?? "";

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <StepFormHero
          headingSlot={
            <HeroHeading
              mainHeading={mainHeading}
              className="font-bold text-[30px] md:text-[52px] leading-[1.1] text-black"
            />
          }
          description={pageData?.heroSection?.description}
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
  const pageData = await fetchTakeMyClass3Data();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}${PAGE_ID}/`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyClass.title,
    description:
      pageData?.meta?.description || MetaData.takeMyClass.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
