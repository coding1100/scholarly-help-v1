import MainLayout from "@/app/MainLayout";
import type { NextPage } from "next";
import { Content } from "./content";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Faq from "@/app/components/LandingPage/Faq";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import Success from "@/app/components/LandingPage/Success";
import FeaturedStories from "@/app/components/OtherLandingPages/SuccessStories/FeaturedStories";
import TrustSection from "@/app/components/OtherLandingPages/UsExpert/TrustedSection";
import { getPageData } from "@/app/lib/mongodb";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchPageData() {
  try {
    // Query for success-stories-and-reviews page by id
    const query = { 
      id: "success-stories-and-reviews"
    };
    return await getPageData("pages", query);
  } catch (error) {
    console.error('Error fetching success-stories-and-reviews data:', error);
    return null;
  }
}

const Home: NextPage = async () => {
  const pageData = await fetchPageData();

  // Merge MongoDB data with static images from Content
  const heroContent = pageData?.heroSection 
    ? { ...pageData.heroSection, formBackImg2: Content.heroContent.formBackImg2 }
    : Content.heroContent;

  // Merge featuredStories - keep static images from Content
  const featuredStories = pageData?.featuredStories
    ? {
        ...pageData.featuredStories,
        stories: pageData.featuredStories.stories?.map((story: any, index: number) => ({
          ...story,
          image: Content.featuredStories.stories[index]?.image || story.image // Use static image if available
        })) || Content.featuredStories.stories
      }
    : Content.featuredStories;

  // Merge supportContent - keep static steps/images from Content
  const supportContent = pageData?.supportContent
    ? {
        ...pageData.supportContent,
        steps: Content.supportContent.steps // Use static steps with images
      }
    : Content.supportContent;

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

  const successLookLike = pageData?.successLookLike || Content.successLookLike;
  const academicPartners = pageData?.academicPartners || undefined;
  const faq = pageData?.faq || undefined;

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData?.meta?.title || "Success Stories & Reviews | Student Results & Experiences";
  const metaDescription =
    pageData?.meta?.description ||
    "Explore real success stories from students who achieved better grades and confidence with our support. Honest reviews that reflect trust, quality, and results.";
  const pageUrl =
    pageData?.meta?.canonicalUrl || `${baseUrl}/success-stories-and-reviews`;

  return (
    <div>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection heroContent={heroContent} />
        <div className="bg-white py-20">
          <div className="max-w-[835px] mx-auto text-center">
            <h2 className="text-black lg:text-[50px] [992px]:text-[42px] md:text-[30px] sm:text-[28px] text-[24px] lg:leading-[60px] [992px]:leading-[52px] leading-[42px] font-bold mb-5">
              What Students Say
              <br />
              About Scholarly Help
            </h2>
            <p className="text-[19px] text-black font-semibold mb-5">
              Honest feedback from students who trust our academic support.
            </p>
            <p className="text-[17px] text-[#263238] font-normal">
              These stories reflect the impact of our work, from improved grades
              to stress-free submissions and reliable academic support. Every
              review highlights our dedication to quality, confidentiality, and
              timely assistance, showing how students succeed with a partner
              they can trust.
            </p>
          </div>
        </div>
        <Success content={successLookLike} />
        <FeaturedStories content={featuredStories} />
        <TrustSection content={supportContent} />
        <WhySlider whyData={whyScholarlySlider} />
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
  const canonicalUrl = `${baseUrl}success-stories-and-reviews`;
  
  return {
    title: pageData?.meta?.title || "Success Stories & Reviews | Student Results & Experiences",
    description: pageData?.meta?.description || "Explore real success stories from students who achieved better grades and confidence with our support. Honest reviews that reflect trust, quality, and results.",
    alternates: {
      canonical: pageData?.meta?.canonicalUrl || canonicalUrl,
    },
  };
}
