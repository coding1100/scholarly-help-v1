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
import { essaySubjects, getEssayContent, isValidEssaySubject, EssaySubject } from "../subjectContent";
import { MetaData } from "@/app/metadata/metadata";
import { notFound } from "next/navigation";

interface PageProps { params: { subject: string; }; }

const Page: React.FC<PageProps> = ({ params }) => {
  if (!isValidEssaySubject(params.subject)) {
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