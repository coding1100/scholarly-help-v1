// "use client";
// import React, { useEffect } from "react";
// import ThankYou from "./components/ThankYou";
// import dynamic from "next/dynamic";
// import AppNav from "@/app/components/NavBar/AppNav";

// const page = () => {
//   // const url =
//   //   localStorage.getItem("redirectFromThankYouPage") ||
//   //   "/pay-someone-to-do-my-assignment";

//   // let url = "/pay-someone-to-do-my-assignment";

//   // if (typeof window !== "undefined") {

//   // if (process.browser) {
//   //   url = localStorage.getItem("redirectFromThankYouPage") || url;
//   // }

//   let url;
//   // useEffect(() => {
//   // Check if window is defined to ensure code runs in the browser
//   if (typeof window !== "undefined") {
//     url = localStorage.getItem("redirectFromThankYouPage");
//     // Now you can safely use localStorage
//   }
//   // }, []);

//   // console.log(url);
//   return(
//     <>
//       <AppNav />
//       <ThankYou url={url} />
//     </>
//   );;
// };

// export default dynamic(() => Promise.resolve(page), { ssr: false });
// // export function generateMetadata({}) {
// //   return {
// //     title: "ScholarlyHelp",
// //     description: "Scholarly Help’s academic writing services are both affordable and high-quality. We are reliable online tutors. For higher scores on your tests, homework, and assignments, rely on our subject specialists. We can also assist you with writing an essay."
// //   };
// // }

"use client";
import React, { useEffect } from "react";
// import ThankYou from "./components/ThankYou";
import dynamic from "next/dynamic";
import AppNav from "@/app/components/NavBar/AppNav";
import ThankYou from "@/app/components/ThankYou/ThankYou";
import ProductSchema from "@/app/components/ProductSchema";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <>
      <ProductSchema
        productTitle="Thank You - Scholarly Help"
        metaDescription="Thank you for contacting Scholarly Help. Our team has received your request and will get back to you shortly with the academic help you need."
        pageUrl={`${baseUrl}/thank-you-3/`}
      />
      <AppNav />
      <ThankYou />
    </>
  );
};

export default page;
