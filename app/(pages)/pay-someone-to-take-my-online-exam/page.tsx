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

const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
  }
);
interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  return (
    <MainLayout>
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
      <CustomerReviews btnText={content.btnText} />
      <Faq content={content.faqContent} />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.paySomeoneDoOnlineExam.url}`;
  return {
    title: `${MetaData.paySomeoneDoOnlineExam.title}`,
    description: `${MetaData.paySomeoneDoOnlineExam.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
