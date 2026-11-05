import { cache } from "react";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";
import FreeToolsLanding from "@/app/components/FreeToolsLanding/FreeToolsLanding";
import type { Metadata } from "next";

// Force dynamic rendering to ensure fresh content
export const dynamic = "force-dynamic";
export const revalidate = 0;

const fetchTakeMyClass2Data = cache(async () => {
  try {
    const query = {
      $or: [{ id: "take-my-class-2" }, { id: "take-my-class" }],
    };
    const data = await getPageData("pages", query, { readPreference: "primary" });
    return data ? JSON.parse(JSON.stringify(data)) : null;
  } catch (error) {
    console.error("Error fetching take-my-class-2 data:", error);
    return null;
  }
});

const TakeMyClass2 = async () => {
  const pageData = await fetchTakeMyClass2Data();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || "Take My Class 2 - Academic Writing Services For You";
  const metaDescription =
    pageData?.meta?.description ||
    "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!";
  const pageUrl = pageData?.meta?.canonicalUrl || `${baseUrl}/take-my-class-2`;

  return (
    <>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <FreeToolsLanding />
    </>
  );
};

export default TakeMyClass2;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const pageData = await fetchTakeMyClass2Data();
    if (pageData) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const metaTitle =
        pageData.meta?.title || "Take My Class 2 - Academic Writing Services For You";
      const metaDescription =
        pageData.meta?.description ||
        "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!";
      const canonicalUrl = pageData.meta?.canonicalUrl || `${baseUrl}/take-my-class-2`;

      return {
        title: metaTitle,
        description: metaDescription,
        robots: {
          index: true,
          follow: true,
        },
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
  const canonicalUrl = `${baseUrl}take-my-class-2`;
  return {
    title: "Take My Class 2 - Academic Writing Services For You",
    description:
      "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
