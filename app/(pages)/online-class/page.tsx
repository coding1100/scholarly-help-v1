import MainLayout from "@/app/MainLayout";
import { MetaData } from "@/app/metadata/metadata";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import Subjects from "@/app/components/LandingPage/Subjects";
import { OnlineClassDataProvider } from "./OnlineClassDataProvider";
import { onlineClassSubjects } from "./content";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchOnlineClassData() {
  try {
    // Query for main online-class page - try multiple variations including with/without 's'
    const query = {
      $or: [
        { id: "online_class_page" },
        { id: "online_classes_page" },
        { id: "main" },
        { id: "online-class" },
        { slug: "online_class_page" },
        { slug: "online_classes_page" },
        { slug: "main" },
      ],
    };
    return await getPageData("online_classes", query);
  } catch (error) {
    console.error("Error fetching online-class data:", error);
    return null;
  }
}

const Page = async () => {
  const pageData = await fetchOnlineClassData();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle = pageData?.meta?.title || MetaData.onlineClass.title;
  const metaDescription =
    pageData?.meta?.description || MetaData.onlineClass.description;
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/${MetaData.onlineClass.url}`;

  return (
    <OnlineClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <BelowFoldLanding>
          <Subjects defaultSubjects={onlineClassSubjects} />
        </BelowFoldLanding>
      </MainLayout>
    </OnlineClassDataProvider>
  );
};
export default Page;

export async function generateMetadata() {
  try {
    const pageData = await fetchOnlineClassData();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle = pageData.meta?.title || MetaData.onlineClass.title;
      const metaDescription =
        pageData.meta?.description || MetaData.onlineClass.description;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}${MetaData.onlineClass.url}`;

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
  const canonicalUrl = `${baseUrl}${MetaData.onlineClass.url}`;
  return {
    title: `${MetaData.onlineClass.title}`,
    description: `${MetaData.onlineClass.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
