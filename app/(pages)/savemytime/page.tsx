import MainLayout from "@/app/MainLayout";
import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
import Faq from "@/app/components/Faq/Faq";
import ContactSection from "@/app/components/Form/ContactSection";
import Hero3 from "@/app/components/Hero/Hero3";
import Process from "@/app/components/Process/Process";
import { processContent } from "@/app/components/Process/content";
import Qualities from "@/app/components/Qualities/Qualities";
import Samples from "@/app/components/Samples/Samples";
import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
import Subjects from "@/app/components/Subjects/Subjects";
import dynamic from "next/dynamic";
import { FC } from "react";
import { content } from "./content";
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
    <>
      <MainLayout>
        <Hero3 />
        <Qualities />
        <SiteReviews />
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
        <ContactSection />
        <Subjects
          btnText={content.btnText}
          mainHeading={content.subjects.mainHeading}
          content={content.subjects.subjectsContent}
        />
        <Faq content={content.faqContent} />
      </MainLayout>
    </>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.savemyTime.url}`;
  return {
    title: `${MetaData.savemyTime.title}`,
    description: `${MetaData.savemyTime.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
