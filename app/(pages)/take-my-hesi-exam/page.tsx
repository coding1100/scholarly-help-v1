import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyHesiExamDataProvider } from "../TakeMyHesiExamDataProvider";
import type { Metadata } from "next";
import Subjects from "@/app/components/LandingPage/Subjects";
import { examsSubjects } from "../exams/content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

export const revalidate = 0;

async function fetchTakeMyHesiExamData() {
  try {
    const query = {
      id: "take-my-hesi-exam",
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-hesi-exam data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchTakeMyHesiExamData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.takeMyHesiExam.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.takeMyHesiExam.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}/${MetaData.takeMyHesiExam.url}`;

  return (
    <TakeMyHesiExamDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={examsSubjects} />
        </BelowFoldLanding>
      </MainLayout>
    </TakeMyHesiExamDataProvider>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyHesiExamData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}${MetaData.takeMyHesiExam.url}`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyHesiExam.title,
    description:
      pageData?.meta?.description || MetaData.takeMyHesiExam.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
