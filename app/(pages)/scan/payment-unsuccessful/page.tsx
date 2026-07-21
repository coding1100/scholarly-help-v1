"use client";
import ThankYou from "./ThankYou";
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
        productTitle="Payment Unsuccessful | Scan to Solve - Scholarly Help"
        metaDescription="Your payment could not be processed. Please try again to subscribe to Scan to Solve by Scholarly Help."
        pageUrl={`${baseUrl}/scan/payment-unsuccessful`}
      />
      <ThankYou />
    </>
  );
};

export default page;
