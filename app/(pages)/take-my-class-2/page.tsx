import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import ProcessSection from "@/app/components/LandingPage/ProcessSection";
import Success from "@/app/components/LandingPage/Success";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import Faq from "@/app/components/LandingPage/Faq";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import CardCarousel from "@/app/components/LandingPage/CardCarousel";
import Description from "@/app/components/LandingPage/Description";
import { HomeDataProvider } from "../HomeDataProvider";
import dynamicImport from "next/dynamic";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

const GetQouteDynamic = dynamicImport(
  () => import("@/app/components/LandingPage/GetQoute"),
  { ssr: false },
);

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchTakeMyClass2Data() {
  try {
    // Query for take-my-class-2 page using id or pageType
    const query = {
      $or: [{ id: "take-my-class-2" }, { pageType: "take-my-class-2" }],
    };
    return await getPageData("pages", query, { readPreference: "primary" });
  } catch (error) {
    console.error("Error fetching take-my-class-2 data:", error);
    return null;
  }
}

import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";

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
    <HomeDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <DelayedBelowFold>
          {/* <Ratings /> */}
          <DeliveredOn />
          <CardCarousel />
          <Description />
          <CustomerReviews />
          <ProcessSection />
          <Success />

          {/* <GuaranteedBlock /> */}
          {/* <WhySlider /> */}
          {/* <Subjects defaultSubjects={onlineClassSubjects} /> */}
          {/* <OnlinePlatform /> */}

          <AcademicPartners />

          {/* <Subjects /> */}
          {/* <GetQouteDynamic /> */}

          {/* <PriceSection /> */}
          <Faq />
        </DelayedBelowFold>
      </MainLayout>
    </HomeDataProvider>
  );
};

export default TakeMyClass2;

import type { Metadata } from "next";
import DeliveredOn from "../take-my-class/DeliveredOn";

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
