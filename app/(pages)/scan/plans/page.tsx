"use client";
import React, { useEffect, useState } from "react";
import Scan from "@/app/layouts/Scan";
import Plans from "./components/Plans";
import PaymentErrDialog from "./components/PaymentErrDialog";
import { useUrl } from "nextjs-current-url";
import ProductSchema from "@/app/components/ProductSchema";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Scan>
      <ProductSchema
        productTitle="Pricing Plans | Scan to Solve - Scholarly Help"
        metaDescription="Choose a Scan to Solve plan that fits your needs and get instant step-by-step homework solutions from Scholarly Help."
        pageUrl={`${baseUrl}/scan/plans`}
      />
      <Plans />
    </Scan>
  );
};

export default page;
