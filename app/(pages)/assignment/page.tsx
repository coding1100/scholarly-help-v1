import MainLayout from "@/app/MainLayout";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import Subjects from "@/app/components/LandingPage/Subjects";
import { AssignmentDataProvider } from "./AssignmentDataProvider";
import { assignmentSubject } from "./content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchAssignmentData() {
  try {
    const query = {
      $or: [{ id: "assignment_page" }, { id: "main" }],
    };
    return await getPageData("assignments", query);
  } catch (error) {
    console.error("Error fetching assignment data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchAssignmentData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.assignment.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.assignment.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.assignment.url}`;

  return (
    <AssignmentDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={assignmentSubject} />
        </BelowFoldLanding>
      </MainLayout>
    </AssignmentDataProvider>
  );
};
export default Page;

export async function generateMetadata() {
  try {
    const pageData = await fetchAssignmentData();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle = pageData.meta?.title || MetaData.assignment.title;
      const metaDescription =
        pageData.meta?.description || MetaData.assignment.description;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}${MetaData.assignment.url}`;

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
  const canonicalUrl = `${baseUrl}${MetaData.assignment.url}`;
  return {
    title: `${MetaData.assignment.title}`,
    description: `${MetaData.assignment.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
