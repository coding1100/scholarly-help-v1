import MainLayout from "@/app/MainLayout";
import type { NextPage } from "next";
import { Content } from "./content";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Faq from "@/app/components/LandingPage/Faq";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import TrustSection from "@/app/components/OtherLandingPages/UsExpert/TrustedSection";
import ExpertSection from "@/app/components/OtherLandingPages/UsExpert/ExpertSection";
import ChooseExpert from "@/app/components/OtherLandingPages/UsExpert/ChooseExpert";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchPageData() {
  try {
    // Query for us-based-phd-experts page by id
    const query = { 
      id: "us-based-phd-experts"
    };
    return await getPageData("pages", query);
  } catch (error) {
    console.error('Error fetching us-based-phd-experts data:', error);
    return null;
  }
}

const Home: NextPage = async () => {
  const pageData = await fetchPageData();

  // Merge MongoDB data with static images from Content
  const heroContent = pageData?.heroSection 
    ? { ...pageData.heroSection, formBackImg2: Content.heroContent.formBackImg2 }
    : Content.heroContent;

  // Merge supportContent - keep static steps/images from Content
  const supportContent = pageData?.supportContent
    ? {
        ...pageData.supportContent,
        steps: Content.supportContent.steps // Use static steps with images
      }
    : Content.supportContent;

  // Merge expertContent - keep static slider from Content
  const expertContent = pageData?.expertContent
    ? {
        ...pageData.expertContent,
        slider: Content.expertContent.slider // Use static slider with images
      }
    : Content.expertContent;

  // Merge chooseExpertSection - keep static icons from Content
  const chooseExpertSection = pageData?.chooseExpertSection
    ? {
        ...pageData.chooseExpertSection,
        steps: pageData.chooseExpertSection.steps?.map((step: any, index: number) => ({
          ...step,
          icon: Content.chooseExpertSection.steps[index]?.icon || step.icon // Use static icon if available
        })) || Content.chooseExpertSection.steps
      }
    : Content.chooseExpertSection;

  // Merge whyScholarlySlider - keep static icons from Content
  const whyScholarlySlider = pageData?.whyScholalrySlider
    ? {
        ...pageData.whyScholalrySlider,
        sliderItems: pageData.whyScholalrySlider.sliderItems?.map((item: any, index: number) => ({
          ...item,
          icon: Content.whyScholalrySlider.sliderItems[index]?.icon || item.icon // Use static icon if available
        })) || Content.whyScholalrySlider.sliderItems
      }
    : Content.whyScholalrySlider;

  const academicPartners = pageData?.academicPartners || undefined;
  const faq = pageData?.faq || undefined; // FAQ is an array, pass directly

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || "US-Based PhD Experts | Trusted Academic Support Online";
  const metaDescription =
    pageData?.meta?.description ||
    "Connect with verified US-based PhD scholars for reliable academic support. Expert guidance you can trust across multiple subjects and tasks.";
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/us-based-phd-experts`;

  return (
    <div>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection heroContent={heroContent} />
        <TrustSection content={supportContent} />
        <ExpertSection content={expertContent} />
        <ChooseExpert content={chooseExpertSection} />
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
  const canonicalUrl = `${baseUrl}us-based-phd-experts`;
  
  return {
    title: pageData?.meta?.title || "US-Based PhD Experts | Trusted Academic Support Online",
    description: pageData?.meta?.description || "Connect with verified US-based PhD scholars for reliable academic support. Expert guidance you can trust across multiple subjects and tasks.",
    alternates: {
      canonical: pageData?.meta?.canonicalUrl || canonicalUrl,
    },
  };
}
