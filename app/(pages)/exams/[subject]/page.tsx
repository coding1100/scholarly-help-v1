import { notFound } from "next/navigation";
import { FC } from "react";
import MainLayout from "@/app/MainLayout";
import dynamic from "next/dynamic";
import Hero from "@/app/components/Hero/Hero";
import Qualities from "@/app/components/Qualities/Qualities";
import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
import Process from "@/app/components/Process/Process";
import { processContent } from "@/app/components/Process/content";
import Samples from "@/app/components/Samples/Samples";
import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
import ExamType from "@/app/components/ExamType/ExamType";
import VariousName from "@/app/components/VariousName/VariousName";
import Subjects from "@/app/components/Subjects/Subjects";
import Faq from "@/app/components/Faq/Faq";
import { MetaData } from "@/app/metadata/metadata";
import { examSubjects, getExamSubjectContent, isValidExamSubject } from "../examSubjectContent";

const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  { ssr: false }
);

interface PageProps {
  params: {
    subject: string;
  };
}

export async function generateStaticParams() {
  return examSubjects.map((subject) => ({
    subject,
  }));
}

const Page: FC<PageProps> = ({ params }) => {
  if (!isValidExamSubject(params.subject)) {
    notFound();
  }

  const content = getExamSubjectContent(params.subject);

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

export function generateMetadata({ params }: PageProps) {
  if (!isValidExamSubject(params.subject)) {
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}exams/${params.subject}`;
  const metadataKey = `exam${params.subject.charAt(0).toUpperCase() + params.subject.slice(1)}` as keyof typeof MetaData;
  
  return {
    title: MetaData[metadataKey]?.title || `Take My ${params.subject} Exam | Professional ${params.subject} Exam Help`,
    description: MetaData[metadataKey]?.description || `Get expert help with your ${params.subject} exams. Professional ${params.subject} exam assistance for better grades.`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default Page;