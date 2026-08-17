import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import HeroHeading from "@/app/components/LandingPage/HeroHeading";
import CardCarousel from "@/app/components/LandingPage/CardCarousel";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Success from "@/app/components/LandingPage/Success";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";
import DeliveredOn from "../take-my-class/DeliveredOn";
import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";
import type { Metadata } from "next";

// Force dynamic rendering to ensure fresh content
export const dynamic = "force-dynamic";
export const revalidate = 0;

const fetchTakeMyClass2Data = cache(async () => {
  try {
    const query = {
      $or: [{ id: "take-my-class-2" }, { id: "take-my-class" }],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
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
  const mainHeading = pageData?.heroSection?.mainHeading ?? "";

  return (
    <TakeMyClassDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #hero-section{background:#F5F6FA}
            .tmc-hero-heading{font-weight:600;font-size:30px;line-height:1.1;color:#000}
            @media (min-width:768px){.tmc-hero-heading{font-size:48px}}
          `,
        }}
      />
      <MainLayout>
        <HeroSection
          useHeroForm2
          headingSlot={
            mainHeading ? (
              <div className="max-w-2xl">
                <HeroHeading
                  mainHeading={mainHeading}
                  spanClassName="md:pt-5 block"
                />
              </div>
            ) : undefined
          }
        />
        {/* 10,000+ A-Grades Delivered On banner & platform logos */}
        <DeliveredOn noNegativeMargin headingOutside />
        <DelayedBelowFold>
          <CardCarousel />
          <Success />
          {/* "How Students Rate Us!" (CustomerReviews) placed at the bottom */}
          <CustomerReviews />
        </DelayedBelowFold>
      </MainLayout>
    </TakeMyClassDataProvider>
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
          index: false,
          follow: false,
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
      index: false,
      follow: false,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
