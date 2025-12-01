import { notFound } from "next/navigation";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import Ratings from "@/app/components/LandingPage/Ratings";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CardCarousel from "@/app/components/LandingPage/CardCarousel";
import Description from "@/app/components/LandingPage/Description";
import GuaranteedBlock from "@/app/components/LandingPage/GuaranteedBlock";
import ProcessSection from "@/app/components/LandingPage/ProcessSection";
import Success from "@/app/components/LandingPage/Success";
import Subjects from "@/app/components/LandingPage/Subjects";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import GetQoute from "@/app/components/LandingPage/GetQoute";
import Faq from "@/app/components/LandingPage/Faq";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import { MetaData } from "@/app/metadata/metadata";
import { examSubjects, getExamSubjectContent, isValidExamSubject } from "../examSubjectContent";

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

const Page: React.FC<PageProps> = ({ params }) => {
  if (!isValidExamSubject(params.subject)) {
    notFound();
  }

  return (
    <MainLayout>
      <HeroSection />
      <Ratings />
      <WhySlider />
      <CardCarousel />
      <Description />
      <GuaranteedBlock />
      <CustomerReviews />
      <ProcessSection />
      <Success />
      <Subjects />
      <AcademicPartners />
      <GetQoute />
      <Faq />
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