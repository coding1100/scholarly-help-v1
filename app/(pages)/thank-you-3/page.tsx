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

const page = () => {
  return (
    <>
      <AppNav />
      <ThankYou />
    </>
  );
};

export default page;
