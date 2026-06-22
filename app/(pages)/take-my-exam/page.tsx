import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyExamDataProvider } from "../TakeMyExamDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";

export const revalidate = 0;

async function fetchTakeMyExamData() {
  try {
    const query = { 
      id: "take-my-exam"
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error('Error fetching take-my-exam data:', error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchTakeMyExamData();
  
  return (
    <TakeMyExamDataProvider data={pageData}>
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding />
      </MainLayout>
    </TakeMyExamDataProvider>
  );
};
export default Page;
export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyExamData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = pageData?.meta?.canonicalUrl || `${baseUrl}${MetaData.takeMyExam.url}`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyExam.title,
    description: pageData?.meta?.description || MetaData.takeMyExam.description,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
