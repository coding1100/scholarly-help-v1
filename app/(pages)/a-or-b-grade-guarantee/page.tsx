import MainLayout from "@/app/MainLayout";
import type { NextPage } from "next";
import { Content } from "./content";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Faq from "@/app/components/LandingPage/Faq";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import ChooseExpert from "@/app/components/OtherLandingPages/UsExpert/ChooseExpert";
import WhyGuarantee from "@/app/components/OtherLandingPages/GradeGuarantee/WhyGuarantee";
import GuaranteeCovers from "@/app/components/OtherLandingPages/GradeGuarantee/GuaranteeCovers";
import HowWorks from "@/app/components/OtherLandingPages/GradeGuarantee/HowWorks";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchPageData() {
  try {
    // Query for a-or-b-grade-guarantee page by id
    const query = { 
      id: "a-or-b-grade-guarantee"
    };
    return await getPageData("pages", query);
  } catch (error) {
    console.error('Error fetching a-or-b-grade-guarantee data:', error);
    return null;
  }
}

const Page: NextPage = async () => {
  const pageData = await fetchPageData();

  // Merge MongoDB data with static images from Content
  const heroContent = pageData?.heroSection 
    ? { ...pageData.heroSection, formBackImg2: Content.heroContent.formBackImg2 }
    : Content.heroContent;

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

  // Merge guarantee - keep static icons from Content
  const guarantee = pageData?.guarantee 
    ? {
        ...pageData.guarantee,
        steps: pageData.guarantee.steps?.map((step: any, index: number) => ({
          ...step,
          icon: Content.guarantee.steps[index]?.icon || step.icon // Use static icon if available
        })) || Content.guarantee.steps
      }
    : Content.guarantee;

  // Merge guaranteeCoversContent - keep static icons from Content
  const guaranteeCoversContent = pageData?.guaranteeCoversContent
    ? {
        ...pageData.guaranteeCoversContent,
        items: pageData.guaranteeCoversContent.items?.map((item: any, index: number) => ({
          ...item,
          icon: Content.guaranteeCoversContent.items[index]?.icon || item.icon // Use static icon if available
        })) || Content.guaranteeCoversContent.items
      }
    : Content.guaranteeCoversContent;

  // Merge howWorksContent - keep static images from Content
  const howWorksContent = pageData?.howWorksContent
    ? {
        ...pageData.howWorksContent,
        steps: pageData.howWorksContent.steps?.map((step: any, index: number) => ({
          ...step,
          img: Content.howWorksContent.steps[index]?.img || step.img // Use static image if available
        })) || Content.howWorksContent.steps
      }
    : Content.howWorksContent;

  // Merge whyScholarlySlider - keep static icons from Content (sliderItems not from admin)
  const whyScholarlySlider = pageData?.whyScholalrySlider
    ? {
        ...pageData.whyScholalrySlider,
        sliderItems: Content.whyScholalrySlider.sliderItems // Always use static sliderItems
      }
    : Content.whyScholalrySlider;

  const academicPartners = pageData?.academicPartners || Content.academicPartners;
  const faq = pageData?.faq || Content.faq;

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || "A/B Grade Guarantee | Reliable Academic Support";
  const metaDescription =
    pageData?.meta?.description ||
    "Get dependable academic help backed by our A/B Grade Guarantee. Expert tutors, simple process, and trusted support built for strong, consistent results.";
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/a-or-b-grade-guarantee`;

  return (
    <div>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection heroContent={heroContent} />
        <WhyGuarantee content={whyGuaranteeContent} />
        <GuaranteeCovers content={guaranteeCoversContent} />
        <HowWorks content={howWorksContent} />
        <ChooseExpert content={guarantee} />
        <WhySlider whyData={whyScholarlySlider} />
        <CustomerReviews />
        <AcademicPartners content={academicPartners} />
        <Faq content={faq} />
      </MainLayout>
    </div>
  );
};

export default Page;

export async function generateMetadata() {
  const pageData = await fetchPageData();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}/a-or-b-grade-guarantee`;
  
  return {
    title: pageData?.meta?.title || "A/B Grade Guarantee | Reliable Academic Support",
    description: pageData?.meta?.description || "Get dependable academic help backed by our A/B Grade Guarantee. Expert tutors, simple process, and trusted support built for strong, consistent results.",
    alternates: {
      canonical: pageData?.meta?.canonicalUrl || canonicalUrl,
    },
  };
}
