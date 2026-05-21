import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

export const revalidate = 0;

const PAGE_ID = "take-my-class-saving-your-future";

async function fetchTakeMyClassSavingYourFutureData() {
  try {
    const query = {
      $or: [{ id: PAGE_ID }, { pageType: PAGE_ID }],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error(`Error fetching ${PAGE_ID} data:`, error);
    return null;
  }
}

import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";

const Page = async () => {
  const pageData = await fetchTakeMyClassSavingYourFutureData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || MetaData.takeMyClassSavingYourFuture.title;
  const metaDescription =
    pageData?.meta?.description ||
    MetaData.takeMyClassSavingYourFuture.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}/${MetaData.takeMyClassSavingYourFuture.url}`;

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection useHeroForm2 />
        <DelayedBelowFold>
          <BelowFoldLanding />
        </DelayedBelowFold>
      </MainLayout>
    </TakeMyClassDataProvider>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyClassSavingYourFutureData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}${MetaData.takeMyClassSavingYourFuture.url}`;
  return {
    title:
      pageData?.meta?.title || MetaData.takeMyClassSavingYourFuture.title,
    description:
      pageData?.meta?.description ||
      MetaData.takeMyClassSavingYourFuture.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
