import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import { MetaData } from "@/app/metadata/metadata";
import { TakeMyTeasExamDataProvider } from "../TakeMyTeasExamDataProvider";
import type { Metadata } from "next";
import Subjects from "@/app/components/LandingPage/Subjects";
import { examsSubjects } from "../exams/content";
import { getPageData } from "@/app/lib/mongodb";

export const revalidate = 0;

async function fetchTakeMyTeasExamData() {
  try {
    const query = {
      id: "take-my-teas-exam",
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-teas-exam data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchTakeMyTeasExamData();

  return (
    <TakeMyTeasExamDataProvider data={pageData}>
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={examsSubjects} />
        </BelowFoldLanding>
      </MainLayout>
    </TakeMyTeasExamDataProvider>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const pageData = await fetchTakeMyTeasExamData();
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl =
    pageData?.meta?.canonicalUrl ||
    `${baseUrl}${MetaData.takeMyTeasExam.url}`;
  return {
    title: pageData?.meta?.title || MetaData.takeMyTeasExam.title,
    description:
      pageData?.meta?.description || MetaData.takeMyTeasExam.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
