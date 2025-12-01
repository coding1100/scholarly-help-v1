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
import { subjectContent, defaultContent, subjects, SubjectType } from "../subjectContent";
import { MetaData } from "@/app/metadata/metadata";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    subject: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  // Check if the subject is valid
  if (!subjects.includes(params.subject as SubjectType)) {
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

export default Page;

export function generateStaticParams() {
  return subjects.map((subject) => ({
    subject: subject
  }));
}

export function generateMetadata({ params }: { params: { subject: string } }) {
  if (!subjects.includes(params.subject as SubjectType)) {
    return {
      title: 'Not Found',
      description: 'The page you are looking for does not exist.'
    };
  }

  const subjectTitle = params.subject.charAt(0).toUpperCase() + params.subject.slice(1).replace(/-/g, ' ');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}online-class/${params.subject}`;
  
  // Use MetaData if available for the subject, otherwise use a dynamic title
  const metadata = MetaData[params.subject as keyof typeof MetaData];
  
  return {
    title: metadata ? metadata.title : `${subjectTitle} Online Class Help - Professional Assistance`,
    description: metadata ? metadata.description : `Get expert help with your ${params.subject.replace(/-/g, ' ')} online classes. Our professional tutors provide comprehensive assistance for better grades.`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}