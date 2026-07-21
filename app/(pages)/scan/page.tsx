"use client";
// "use client";

// import { useState } from "react";
// import Header from "./components/header";
// import HeroSection from "./components/HeroSection";
// import Section from "./components/section1";
// import Section2 from "./components/section2";
// import Section3 from "./components/section3";
// import Section4 from "./components/section4";
// import Section5 from "./components/section5";
// import Footer from "./components/footer";
// import Scan from "@/app/layouts/Scan";

// function index() {
//   return (
//     <>
//       <Scan>
//         <HeroSection />
//         <Section />
//         <div className="container">
//           <div>
//             <h1 className="text-6xl leading-tight font-extrabold  text-[#716A6A] text-center mx-auto container    w-[92%]">
//               How Does It <span className="text-[#FF3449]">works?</span>
//             </h1>
//           </div>
//         </div>
//         <Section2 />
//         <Section3 />
//         <Section4 />
//         <Section5 />
//       </Scan>
//     </>
//   );
// }

// export default index;

// import Excercise from "./components/Excercise";
// import Excercise from "./excercise/components/Excercise";
import AppNav from "@/app/components/NavBar/AppNav";
import Scan from "@/app/layouts/Scan";
import NewLayoutExcercise from "./excercise/components/NewLayoutExcercise";
import ProductSchema from "@/app/components/ProductSchema";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Scan hideFooter hideHeader>
      <ProductSchema
        productTitle="Scan to Solve | Snap Your Homework & Get Solutions - Scholarly Help"
        metaDescription="Scan any exercise or homework question and get instant step-by-step solutions with Scholarly Help's Scan to Solve tool."
        pageUrl={`${baseUrl}/scan`}
      />
      <AppNav />
      {/* <Excercise /> */}
      <NewLayoutExcercise />
    </Scan>
  );
};

export default page;
