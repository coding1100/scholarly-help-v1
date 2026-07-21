import { FC } from "react";
import { content } from "./content";
import Hero from "@/app/components/Hero/Hero";
import Qualities from "@/app/components/Qualities/Qualities";
import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
import Process from "@/app/components/Process/Process";
import { processContent } from "@/app/components/Process/content";
import Samples from "@/app/components/Samples/Samples";
import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
import Faq from "@/app/components/Faq/Faq";
import MainLayout from "@/app/MainLayout";
import Subjects from "@/app/components/Subjects/Subjects";
import dynamic from "next/dynamic";
import ExamType from "@/app/components/ExamType/ExamType";
import VariousName from "@/app/components/VariousName/VariousName";
import Reasons from "@/app/components/Reasons/Reasons";
import { MetaData } from "@/app/metadata/metadata";
import ProductSchema from "@/app/components/ProductSchema";

const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
  }
);
interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  return (
    <MainLayout>
      <ProductSchema
        productTitle={MetaData.helpMeWithMyExam.title}
        metaDescription={MetaData.helpMeWithMyExam.description}
        pageUrl={`${baseUrl}/${MetaData.helpMeWithMyExam.url}`}
      />
      <Hero content={content.heroContent} />
      <Qualities />
      <SiteReviews />
      <Reasons />
      <WhyScholarly
        header={content.whyScholarly}
        content={content.whyScholarly.whyScholarlyContent}
      />
      <AcademicPartner
        btnText={content.btnText}
        mainHeading={content.academic.mainheading}
        content={content.academic.academicContent}
      />
      <ExcellenceProof
        btnText={content.btnText}
        content={content.excellenceProofContent}
      />
      <Process content={processContent} />
      <Samples btnText={content.btnText} />
      <CustomerReviews btnText={content.btnText} />
      <ExamType content={content.examTypeContent} />
      <VariousName
        mainHeading={content.variousNames.mainHeading}
        content={content.variousNames.variousNamesContent}
      />
      <Subjects
        btnText={content.btnText}
        mainHeading={content.subjects.mainHeading}
        content={content.subjects.subjectsContent}
      />
      <Faq content={content.faqContent} />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.helpMeWithMyExam.url}`;
  return {
    title: `${MetaData.helpMeWithMyExam.title}`,
    description: `${MetaData.helpMeWithMyExam.description}`,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
