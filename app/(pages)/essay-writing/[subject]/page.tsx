import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import { processContent } from "@/app/components/Process/content";
import dynamic from "next/dynamic";
import { FC, Suspense } from "react";
import { essaySubjects, getEssayContent, isValidEssaySubject, EssaySubject } from "../subjectContent";
import { MetaData } from "@/app/metadata/metadata";
import { notFound } from "next/navigation";

const AcademicPartner = dynamic(() => import("@/app/components/AcademicPartner/AcademicPartner"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const CustomerReviews = dynamic(() => import("@/app/components/CustomerReviews/CustomerReviews"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const ExcellenceProof = dynamic(() => import("@/app/components/ExcellenceProof/ExcellenceProof"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const Faq = dynamic(() => import("@/app/components/Faq/Faq"), { loading: () => <div className="animate-pulse bg-gray-200 h-72" /> });
const Process = dynamic(() => import("@/app/components/Process/Process"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const Qualities = dynamic(() => import("@/app/components/Qualities/Qualities"), { loading: () => <div className="animate-pulse bg-gray-200 h-72" /> });
const Samples = dynamic(() => import("@/app/components/Samples/Samples"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const SiteReviews = dynamic(() => import("@/app/components/SiteReviews/SiteReviews"), { loading: () => <div className="animate-pulse bg-gray-200 h-72" /> });
const Subjects = dynamic(() => import("@/app/components/Subjects/Subjects"), { loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });
const WhyScholarly = dynamic(() => import("@/app/components/WhyScholarly/WhyScholarly"), { ssr: false, loading: () => <div className="animate-pulse bg-gray-200 h-96" /> });

interface PageProps { params: { subject: string; }; }

const Page: FC<PageProps> = ({ params }) => {
  if (!isValidEssaySubject(params.subject)) {
    notFound();
  }

  const pageContent = getEssayContent(params.subject as EssaySubject);

  return (
    <MainLayout>
      <Hero content={pageContent.heroContent} />

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <Qualities />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <SiteReviews />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <WhyScholarly header={pageContent.whyScholarly} content={pageContent.whyScholarly.whyScholarlyContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <AcademicPartner btnText={pageContent.btnText} mainHeading={pageContent.academic.mainheading} mainDescription={pageContent.academic.mainDescription} content={pageContent.academic.academicContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <ExcellenceProof btnText={pageContent.btnText} content={pageContent.excellenceProofContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Process content={processContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Samples btnText={pageContent.btnText} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <CustomerReviews btnText={pageContent.btnText} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Subjects btnText={pageContent.btnText} mainHeading={pageContent.subjects.mainHeading} content={pageContent.subjects.subjectsContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <Faq content={pageContent.faqContent} />
      </Suspense>
    </MainLayout>
  );
};

export default Page;

export function generateStaticParams() { return essaySubjects.map((subject) => ({ subject })); }

export function generateMetadata({ params }: { params: { subject: string } }) {
  if (!isValidEssaySubject(params.subject)) { return { title: "Not Found", description: "The page you are looking for does not exist." }; }

  const subjectTitle = params.subject.charAt(0).toUpperCase() + params.subject.slice(1).replace(/-/g, " ");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}essay-writing/${params.subject}`;
  const metadata = MetaData[params.subject as keyof typeof MetaData];

  return {
    title: metadata ? metadata.title : `${subjectTitle} Essay Writing Help`,
    description: metadata ? metadata.description : `Professional essay writing help for ${params.subject.replace(/-/g, " ")}.`,
    alternates: { canonical: canonicalUrl },
  };
}