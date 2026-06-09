import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";

export const revalidate = 0;

async function fetchTakeMyClass3Data() {
  try {
    const query = {
      $or: [{ id: "take-my-class-3" }, { pageType: "take-my-class-3" }],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-class-3 data:", error);
    return null;
  }
}

import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";

const Page = async () => {
  const pageData = await fetchTakeMyClass3Data();

  return (
    <TakeMyClassDataProvider data={pageData}>
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
  const pageData = await fetchTakeMyClass3Data();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}take-my-class-3/`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyClass.title,
    description:
      pageData?.meta?.description || MetaData.takeMyClass.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
