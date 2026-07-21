import { FC } from "react";
import { Metadata } from "next";
import { content } from "./content";
import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import ToolsGrid from "@/app/components/ToolsGrid/ToolsGrid";
import ToolsHero from "@/app/components/ToolsHero/ToolsHero";
import BreadCrumbs from "@/app/components/BreadCrumbs/BreadCrumbs";
import ProductSchema from "@/app/components/ProductSchema";
// import Qualities from "@/app/components/Qualities/Qualities";
// import SiteReviews from "@/app/components/SiteReviews/SiteReviews";
// import AcademicPartner from "@/app/components/AcademicPartner/AcademicPartner";
// import WhyScholarly from "@/app/components/WhyScholarly/WhyScholarly";
// import ExcellenceProof from "@/app/components/ExcellenceProof/ExcellenceProof";
// import Process from "@/app/components/Process/Process";
// import { processContent } from "@/app/components/Process/content";
// import Samples from "@/app/components/Samples/Samples";
// import CustomerReviews from "@/app/components/CustomerReviews/CustomerReviews";
// import Faq from "@/app/components/Faq/Faq";
// import Subjects from "@/app/components/Subjects/Subjects";
// import ExamType from "@/app/components/ExamType/ExamType";
// import VariousName from "@/app/components/VariousName/VariousName";

interface PageProps { }
const Page: FC<PageProps> = ({ }) => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

  // return <div>test</div>
  return (
    <MainLayout>
      <ProductSchema
        productTitle="Miles to Millimeters Converter | Free Academic Conversion Tool"
        metaDescription="Convert miles to millimeters accurately with our free academic conversion tool. Quick and easy distance conversions for students and researchers."
        pageUrl={`${baseUrl}/tools/miles-to-millimeters`}
      />
      {/* <BreadCrumbs /> */}
      <BreadCrumbs pageName="Miles to Millimeters" />
      <ToolsHero content={content.heroContent} />
      {/* <Hero content={content.heroContent} /> */}
      {/* <ToolsGrid
        mainHeading={content.conversionTools.mainheading}
        content={content.conversionTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.algebraTools.mainheading}
        content={content.algebraTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.physicsTools.mainheading}
        content={content.physicsTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.chemistryTools.mainheading}
        content={content.chemistryTools.toolsContent}
      />
      <ToolsGrid
        mainHeading={content.writingTools.mainheading}
        content={content.writingTools.toolsContent}
      /> */}
      {/* <Qualities />
      <SiteReviews />
      <WhyScholarly header={content.whyScholarly} content={content.whyScholarly.whyScholarlyContent} />
      <AcademicPartner btnText={content.btnText}  mainHeading={content.academic.mainheading} content={content.academic.academicContent}/>
      <ExcellenceProof btnText={content.btnText}  content={content.excellenceProofContent} />
      <Process content={processContent} />
      <Samples btnText={content.btnText}/>
      <CustomerReviews btnText={content.btnText}/>
      <Subjects btnText={content.btnText} mainHeading={content.subjects.mainHeading} content={content.subjects.subjectsContent}/>
      <Faq content={content.faqContent} /> */}
    </MainLayout>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}/tools/miles-to-millimeters`;

  return {
    title: "Miles to Millimeters Converter | Free Academic Conversion Tool",
    description: "Convert miles to millimeters accurately with our free academic conversion tool. Quick and easy distance conversions for students and researchers.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
