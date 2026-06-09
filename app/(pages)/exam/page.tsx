import MainLayout from "@/app/MainLayout";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import Subjects from "@/app/components/LandingPage/Subjects";
import { ExamDataProvider } from "./ExamDataProvider";
import { examsSubjects } from "../exams/content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchExamData() {
  try {
    const query = {
      $or: [{ id: "exam_page" }, { id: "main" }],
    };
    return await getPageData("exam", query);
  } catch (error) {
    console.error("Error fetching exam data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchExamData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.exams.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.exams.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.exams.url}`;

  return (
    <ExamDataProvider data={pageData}>
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
    </ExamDataProvider>
  );
};
export default Page;

export async function generateMetadata() {
  try {
    const pageData = await fetchExamData();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle = pageData.meta?.title || MetaData.exams.title;
      const metaDescription =
        pageData.meta?.description || MetaData.exams.description;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}${MetaData.exams.url}`;

      return {
        title: metaTitle,
        description: metaDescription,
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.exams.url}`;
  return {
    title: `${MetaData.exams.title}`,
    description: `${MetaData.exams.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
