import { FC } from "react";
import { content } from "./content";
import Hero from "@/app/components/Hero/Hero";
import Qualities from "@/app/components/Qualities/Qualities";
import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
import WhyScholarly from "@/app/components/WhyScholarly/WhyScholarly";
import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
import Process from "@/app/components/Process/Process";
import { processContent } from "@/app/components/Process/content";
import Samples from "@/app/components/Samples/Samples";
import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
import Faq from "@/app/components/Faq/Faq";
import MainLayout from "@/app/MainLayout";
import Subjects from "@/app/components/Subjects/Subjects";
import ExamType from "@/app/components/ExamType/ExamType";
import VariousName from "@/app/components/VariousName/VariousName";
import GetFreeQuote from "./components/GetFreeQuote";
import { MetaData } from "@/app/metadata/metadata";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <MainLayout>
      <GetFreeQuote />
      {/* <Hero content={content.heroContent} /> */}
      {/* <Qualities /> */}
      <SiteReviews />
      <WhyScholarly
        header={content.whyScholarly}
        content={content.whyScholarly.whyScholarlyContent}
      />
      <AcademicPartner
        mainHeading={content.academic.mainheading}
        content={content.academic.academicContent}
      />
      <ExcellenceProof content={content.excellenceProofContent} />
      <Process content={processContent} />
      <Samples />
      <CustomerReviews />
      <Subjects
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
  const canonicalUrl = `${baseUrl}${MetaData.paySomeoneDoAssignment.url}`;
  return {
    title: `${MetaData.paySomeoneDoAssignment.title}`,
    description: `${MetaData.paySomeoneDoAssignment.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
