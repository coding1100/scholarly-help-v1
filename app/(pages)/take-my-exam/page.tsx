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
const Page = () => {
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
export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.takeMyExam.url}`;
  return {
    title: `${MetaData.takeMyExam.title}`,
    description: `${MetaData.takeMyExam.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
