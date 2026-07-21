"use client";

import Scan from "@/app/layouts/Scan";
import Excercise from "./components/Excercise";
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
        productTitle="Scan an Exercise | Scan to Solve - Scholarly Help"
        metaDescription="Upload a clear image of your homework exercise and get instant step-by-step solutions with Scholarly Help's Scan to Solve tool."
        pageUrl={`${baseUrl}/scan/excercise`}
      />
      <Excercise />
    </Scan>
  );
};

export default page;
