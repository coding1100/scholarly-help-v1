import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import CoursePlannerHero from "@/app/components/AiLandingPage/CoursePlanner/CoursePlannerHero";
import BeforeAfter from "@/app/components/AiLandingPage/CoursePlanner/BeforeAfter";
import UseCases from "@/app/components/AiLandingPage/CoursePlanner/UseCases";
import HowItWorks from "@/app/components/AiLandingPage/CoursePlanner/HowItWorks";
import WhyItWorks from "@/app/components/AiLandingPage/CoursePlanner/WhyItWorks";
import TwoWays from "@/app/components/AiLandingPage/CoursePlanner/TwoWays";
import StudentReviews from "@/app/components/AiLandingPage/CoursePlanner/StudentReviews";
import CoursePlannerFaq from "@/app/components/AiLandingPage/CoursePlanner/CoursePlannerFaq";
import FooterCta from "@/app/components/AiLandingPage/CoursePlanner/FooterCta";
import ProductSchema from "@/app/components/ProductSchema";
import { metaContent } from "@/app/components/AiLandingPage/CoursePlanner/content";

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  return (
    <MainLayout>
      <ProductSchema
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${normalizedBaseUrl}/tools/ai-course-planner`}
      />
      <div className="font-poppins">
        <CoursePlannerHero />
        <BeforeAfter />
        <UseCases />
        <HowItWorks />
        <WhyItWorks />
        <TwoWays />
        <StudentReviews />
        <CoursePlannerFaq />
        <FooterCta />
      </div>
    </MainLayout>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/tools/ai-course-planner`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
