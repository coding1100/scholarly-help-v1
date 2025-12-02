"use client";

import type { NextPage } from "next";
import MainLayout from "./MainLayout";
import HeroSection from "./components/LandingPage/HeroSection";
import WhySlider from "./components/LandingPage/WhySlider";
import ProcessSection from "./components/LandingPage/ProcessSection";
import Success from "./components/LandingPage/Success";
import Subjects from "./components/LandingPage/Subjects";
import AcademicPartners from "./components/LandingPage/AcademicPartners";
import GetQoute from "./components/LandingPage/GetQoute";
import Faq from "./components/LandingPage/Faq";
import CustomerReviews from "./components/LandingPage/CustomerReviews";
import CardCarousel from "./components/LandingPage/CardCarousel";
import GuaranteedBlock from "./components/LandingPage/GuaranteedBlock";
import Description from "./components/LandingPage/Description";
import Ratings from "./components/LandingPage/Ratings";

const Home: NextPage = () => {
  return (
    <div>
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
        {/* <Subjects /> */}
        <AcademicPartners />
        <GetQoute />
        <Faq />
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
