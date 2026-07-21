import MainLayout from "@/app/MainLayout";
import type { NextPage } from "next";
import { Content } from "./content";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Faq from "@/app/components/LandingPage/Faq";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import WhyGuaranteeMatters from "@/app/components/OtherLandingPages/OnTimeDelivery/WhyGuaranteeMatters";
import WhyGuarantee from "@/app/components/OtherLandingPages/GradeGuarantee/WhyGuarantee";
import HowGuaranteeWorks from "@/app/components/OtherLandingPages/OnTimeDelivery/HowGuaranteeWorks";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchPageData() {
  try {
    // Query for on-time-delivery-guarantee page by id
    const query = { 
      id: "on-time-delivery-guarantee"
    };
    return await getPageData("pages", query);
  } catch (error) {
    console.error('Error fetching on-time-delivery-guarantee data:', error);
    return null;
  }
}

const Home: NextPage = async () => {
  const pageData = await fetchPageData();

  // Merge MongoDB data with static images from Content
  const heroContent = pageData?.heroSection 
    ? { ...pageData.heroSection, formBackImg2: Content.heroContent.formBackImg2 }
    : Content.heroContent;

  // Merge whyGuarantee - keep static images from Content
  const whyGuarantee = pageData?.whyGuarantee
    ? {
        ...pageData.whyGuarantee,
        details: pageData.whyGuarantee.details && pageData.whyGuarantee.details.length > 0
          ? pageData.whyGuarantee.details.map((detail: any, index: number) => ({
              ...detail,
              imge: Content.whyGuarantee.details[index]?.imge || detail.imge // Use static image if available
            }))
          : Content.whyGuarantee.details // Use static details if MongoDB doesn't have them
      }
    : Content.whyGuarantee;

  // Merge whyGuaranteeContent - keep static image from Content
  const whyGuaranteeContent = pageData?.whyGuaranteeContent 
    ? { 
        ...pageData.whyGuaranteeContent, 
        details: { 
          ...pageData.whyGuaranteeContent.details,
          imge: Content.whyGuaranteeContent.details.imge // Use static image
        }
      }
    : Content.whyGuaranteeContent;

  // HowGuaranteeWorks doesn't need images, just use MongoDB or static content
  const howGuaranteeWorks = pageData?.HowGuaranteeWorks || Content.HowGuaranteeWorks;

  // Merge whyScholarlySlider - keep static icons from Content (sliderItems not from backend)
  const whyScholarlySlider = pageData?.whyScholalrySlider
    ? {
        ...pageData.whyScholalrySlider,
        sliderItems: Content.whyScholalrySlider.sliderItems // Always use static sliderItems
      }
    : Content.whyScholalrySlider;

  const academicPartners = pageData?.academicPartners || undefined;
  const faq = pageData?.faq || undefined;

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || "On-Time Delivery Guarantee | Fast, Reliable Academic Support";
  const metaDescription =
    pageData?.meta?.description ||
    "Receive your work on schedule with our On-Time Delivery Guarantee. We ensure fast, dependable, and stress-free academic support for every task.";
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/on-time-delivery-guarantee`;

  return (
    <div>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection heroContent={heroContent} />
        <WhyGuaranteeMatters content={whyGuarantee} />
        <WhyGuarantee content={whyGuaranteeContent} />
        <HowGuaranteeWorks content={howGuaranteeWorks} />
        <div className="bg-linear-to-b from-white via-[#ECECFC] to-white">
          <WhySlider whyData={whyScholarlySlider} />
        </div>
        <CustomerReviews />
        <AcademicPartners content={academicPartners} />
        <Faq content={faq} />
      </MainLayout>
    </div>
  );
};

export default Home;

export async function generateMetadata() {
  const pageData = await fetchPageData();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}on-time-delivery-guarantee`;
  
  return {
    title: pageData?.meta?.title || "On-Time Delivery Guarantee | Fast, Reliable Academic Support",
    description: pageData?.meta?.description || "Receive your work on schedule with our On-Time Delivery Guarantee. We ensure fast, dependable, and stress-free academic support for every task.",
    alternates: {
      canonical: pageData?.meta?.canonicalUrl || canonicalUrl,
    },
  };
}
