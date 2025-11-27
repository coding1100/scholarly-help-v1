"use client";

import type { NextPage } from "next";
import dynamic from "next/dynamic";
import MainLayout from "./MainLayout";
import AcademicPartner from "./components/AcademicPartner/AcademicPartner";
import CustomerReviews from "./components/CustomerReviews/CustomerReviews";
import ExcellenceProof from "./components/ExcellenceProof/ExcellenceProof";
import Faq from "./components/Faq/Faq";
import Hero from "./components/Hero/Hero";
import Process from "./components/Process/Process";
import { processContent } from "./components/Process/content";
import Qualities from "./components/Qualities/Qualities";
import Samples from "./components/Samples/Samples";
import SiteReviews from "./components/SiteReviews/SiteReviews";
import { content } from "./content";
import { useTextHtmlRatio } from "./hooks/useTextHtmlRatio";
import { useEffect } from "react";

const WhyScholarly = dynamic(
  () => import("./components/WhyScholarly/WhyScholarly"),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  const ratioInfo = useTextHtmlRatio();

  useEffect(() => {
    if (ratioInfo) {
      console.log("Text Length:", ratioInfo.textLength);
      console.log("HTML Length:", ratioInfo.htmlLength);
      console.log("Text-to-HTML Ratio:", ratioInfo.ratio + "%");

      if (ratioInfo.ratio < 15) {
        console.warn("⚠️ Low Text-to-HTML ratio:", ratioInfo.ratio + "%");
      }
    }
  }, [ratioInfo]);
  return (
    <div>
      <MainLayout>
        {/* Include various components */}
        <Hero content={content.heroContent} />
        <Qualities />
        <SiteReviews />
        <AcademicPartner
          btnText={content.btnText}
          mainHeading={content.academic.mainheading}
          content={content.academic.academicContent}
        />
        <WhyScholarly
          header={content.whyScholarly}
          content={content.whyScholarly.whyScholarlyContent}
        />
        <ExcellenceProof
          btnText={content.btnText}
          content={content.excellenceProofContent}
        />
        <Process content={processContent} />
        <Samples btnText={content.btnText} />
        <CustomerReviews btnText={content.btnText} />
        <Faq content={content.faqContent} />
      </MainLayout>
    </div>
  );
};

export default Home;

// export function generateMetadata({}) {
//   const baseUrl =
//     process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
//   const canonicalUrl = `${baseUrl}`;
//   return {
//     title: "Scholarly Help - Academic Writing Services For You",
//     description:
//       "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!",
//     alternates: {
//       canonical: canonicalUrl,
//     },
//   };
// }
