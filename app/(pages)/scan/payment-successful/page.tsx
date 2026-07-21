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
        productTitle="Payment Successful | Scan to Solve - Scholarly Help"
        metaDescription="Your payment was successful. Thank you for subscribing to Scan to Solve by Scholarly Help."
        pageUrl={`${baseUrl}/scan/payment-successful`}
      />
      <ThankYou />
    </>
  );
};

export default page;
