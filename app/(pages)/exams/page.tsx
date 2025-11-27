import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import { processContent } from "@/app/components/Process/content";
import dynamic from "next/dynamic";
import { FC, Suspense } from "react";
import { content } from "./content";
import { MetaData } from "@/app/metadata/metadata";

// Dynamic imports for heavy components
const AcademicPartner = dynamic(
  () => import("@/app/components/AcademicPartner/AcademicPartner"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

const CustomerReviews = dynamic(
  () => import("@/app/components/CustomerReviews/CustomerReviews"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

const ExamType = dynamic(() => import("@/app/components/ExamType/ExamType"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
});

const ExcellenceProof = dynamic(
  () => import("@/app/components/ExcellenceProof/ExcellenceProof"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

const Faq = dynamic(() => import("@/app/components/Faq/Faq"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-72" />,
});

const Process = dynamic(() => import("@/app/components/Process/Process"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
});

const Qualities = dynamic(
  () => import("@/app/components/Qualities/Qualities"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-72" />,
  }
);

const Samples = dynamic(() => import("@/app/components/Samples/Samples"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
});

const SiteReviews = dynamic(
  () => import("@/app/components/SiteReviews/SiteReviews"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-72" />,
  }
);

const Subjects = dynamic(() => import("@/app/components/Subjects/Subjects"), {
  loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
});

const VariousName = dynamic(
  () => import("@/app/components/VariousName/VariousName"),
  {
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <MainLayout>
      {/* Hero is loaded immediately as it's above the fold */}
      <Hero content={content.heroContent} />

      {/* Other components are loaded dynamically as user scrolls */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <Qualities />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <SiteReviews />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <WhyScholarly
          header={content.whyScholarly}
          content={content.whyScholarly.whyScholarlyContent}
        />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <AcademicPartner
          btnText={content.btnTextAP}
          mainHeading={content.academic.mainheading}
          content={content.academic.academicContent}
        />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <ExcellenceProof
          btnText={content.btnText}
          content={content.excellenceProofContent}
        />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Process content={processContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Samples btnText={content.btnText} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <CustomerReviews btnText={content.btnText} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <ExamType content={content.examTypeContent} />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <VariousName
          mainHeading={content.variousNames.mainHeading}
          content={content.variousNames.variousNamesContent}
        />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <Subjects
          btnText={content.btnText}
          mainHeading={content.subjects.mainHeading}
          content={content.subjects.subjectsContent}
        />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-72" />}>
        <Faq content={content.faqContent} />
      </Suspense>
    </MainLayout>
  );
};

export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.exams.url}`;
  return {
    title: `${MetaData.exams.title}`,
    description: `${MetaData.exams.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
