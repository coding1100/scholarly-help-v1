import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import { processContent } from "@/app/components/Process/content";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import fs from "fs";
import path from "path";
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

const WhyScholarly = dynamic(
  () => import("@/app/components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96" />,
  }
);

const Page = async () => {
  const filePath = path.join(process.cwd(), 'data', 'online-class.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const content = JSON.parse(jsonData);
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
          btnText={content.btnText}
          mainHeading={content.academic.mainheading}
          mainDescription={content.academic.mainDescription}
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
  const canonicalUrl = `${baseUrl}${MetaData.onlineClass.url}`;
  return {
    title: `${MetaData.onlineClass.title}`,
    description: `${MetaData.onlineClass.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
