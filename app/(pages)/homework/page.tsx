import MainLayout from "@/app/MainLayout";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import Subjects from "@/app/components/LandingPage/Subjects";
import { HomeworkDataProvider } from "./HomeworkDataProvider";
import { homeworkSubject } from "./content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchHomeworkData() {
  try {
    const query = {
      $or: [{ id: "homework_page" }, { id: "main" }],
    };
    return await getPageData("homework", query);
  } catch (error) {
    console.error("Error fetching homework data:", error);
    // Return null instead of throwing to prevent 500 error
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchHomeworkData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.homeWork.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.homeWork.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.homeWork.url}`;

  return (
    <HomeworkDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={homeworkSubject} />
        </BelowFoldLanding>
      </MainLayout>
    </HomeworkDataProvider>
  );
};
export default Page;

export async function generateMetadata() {
  try {
    const pageData = await fetchHomeworkData();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle = pageData.meta?.title || MetaData.homeWork.title;
      const metaDescription =
        pageData.meta?.description || MetaData.homeWork.description;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}${MetaData.homeWork.url}`;

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
    // Fall through to default metadata
  }

  // Default metadata if database fetch fails
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.homeWork.url}`;
  return {
    title: `${MetaData.homeWork.title}`,
    description: `${MetaData.homeWork.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
