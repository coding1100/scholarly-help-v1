import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyProctoredExamDataProvider } from "../TakeMyProctoredExamDataProvider";
import type { Metadata } from "next";
import Subjects from "@/app/components/LandingPage/Subjects";
import { examsSubjects } from "../exams/content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

export const revalidate = 0;

async function fetchTakeMyProctoredExamData() {
  try {
    const query = {
      id: "take-my-proctored-exam-for-me",
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-proctored-exam-for-me data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchTakeMyProctoredExamData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || MetaData.takeMyProctoredExam.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.takeMyProctoredExam.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}/${MetaData.takeMyProctoredExam.url}`;

  return (
    <TakeMyProctoredExamDataProvider data={pageData}>
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
    </TakeMyProctoredExamDataProvider>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyProctoredExamData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}${MetaData.takeMyProctoredExam.url}`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyProctoredExam.title,
    description:
      pageData?.meta?.description || MetaData.takeMyProctoredExam.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
