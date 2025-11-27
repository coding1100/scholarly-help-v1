import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import { processContent } from "@/app/components/Process/content";
import { FC } from "react";
import { content } from "./content";
import { MetaData } from "@/app/metadata/metadata";
import {
  DynamicAcademicPartner,
  DynamicCustomerReviews,
  DynamicExcellenceProof,
  DynamicFaq,
  DynamicProcess,
  DynamicQualities,
  DynamicSamples,
  DynamicSiteReviews,
  DynamicSubjects,
  DynamicWhyScholarly,
} from "@/app/components/DynamicComponents";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <MainLayout>
      {/* Hero is loaded immediately as it's above the fold */}
      <Hero content={content.heroContent} />

      {/* Other components are loaded dynamically */}
      <DynamicQualities />
      <DynamicSiteReviews />
      <DynamicWhyScholarly
        header={content.whyScholarly}
        content={content.whyScholarly.whyScholarlyContent}
      />
      <DynamicAcademicPartner
        btnText={content.btnText}
        mainHeading={content.academic.mainheading}
        content={content.academic.academicContent}
      />
      <DynamicExcellenceProof
        btnText={content.btnText}
        content={content.excellenceProofContent}
      />
      <DynamicProcess content={processContent} />
      <DynamicSamples btnText={content.btnText} />
      <DynamicCustomerReviews btnText={content.btnText} />
      <DynamicSubjects
        btnText={content.btnText}
        mainHeading={content.subjects.mainHeading}
        content={content.subjects.subjectsContent}
      />
      <DynamicFaq content={content.faqContent} />
    </MainLayout>
  );
};

export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.homeWork.url}`;
  return {
    title: `${MetaData.homeWork.title}`,
    description: `${MetaData.homeWork.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
