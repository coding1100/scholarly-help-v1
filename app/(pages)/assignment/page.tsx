import MainLayout from "@/app/MainLayout";
import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
import Faq from "@/app/components/Faq/Faq";
import Hero from "@/app/components/Hero/Hero";
import Process from "@/app/components/Process/Process";
import { processContent } from "@/app/components/Process/content";
import Qualities from "@/app/components/Qualities/Qualities";
import Samples from "@/app/components/Samples/Samples";
import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
import Subjects from "@/app/components/Subjects/Subjects";

import dynamic from "next/dynamic";
import { MetaData } from "@/app/metadata/metadata";
import { getAssignmentContent } from "./content";
const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
  }
);
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Help Me Do My Assignment | Online Assignment Help | Scholarly Help",
// };
const Page = async () => {
  const [content, faq] = await Promise.all([
    getAssignmentContent(),
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/faq`).then(res => res.json())
  ]);
  content.faqContent = faq.faqContent || [];
  // return <div>test</div>
  return (
    <MainLayout>
      <Hero content={content.heroContent} />
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
  const canonicalUrl = `${baseUrl}${MetaData.assignment.url}`;
  return {
    title: `${MetaData.assignment.title}`,
    description: `${MetaData.assignment.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
