import MainLayout from "@/app/MainLayout";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import Subjects from "@/app/components/LandingPage/Subjects";
import { EssayWritingDataProvider } from "./EssayWritingDataProvider";
import { essayWritingSubjects } from "./content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchEssayWritingData() {
  try {
    // Query for main essay-writing page - try multiple variations including with/without 's'
    const query = {
      $or: [
        { id: "essay_writing_page" },
        { id: "essay_writings_page" },
        { id: "main" },
        { id: "essay-writing" },
        { slug: "essay_writing_page" },
        { slug: "essay_writings_page" },
        { slug: "main" },
      ],
    };
    return await getPageData("essay_writing", query);
  } catch (error) {
    console.error("Error fetching essay-writing data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchEssayWritingData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.essayWriting.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.essayWriting.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.essayWriting.url}`;

  return (
    <EssayWritingDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={essayWritingSubjects} />
        </BelowFoldLanding>
      </MainLayout>
    </EssayWritingDataProvider>
  );
};
export default Page;

export async function generateMetadata() {
  try {
    const pageData = await fetchEssayWritingData();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle = pageData.meta?.title || MetaData.essayWriting.title;
      const metaDescription =
        pageData.meta?.description || MetaData.essayWriting.description;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}${MetaData.essayWriting.url}`;

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
  const canonicalUrl = `${baseUrl}${MetaData.essayWriting.url}`;
  return {
    title: `${MetaData.essayWriting.title}`,
    description: `${MetaData.essayWriting.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
