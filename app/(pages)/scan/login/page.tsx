"use client";

import React from "react";
import Login from "./components/Login";
import Scan from "@/app/layouts/Scan";
import ProductSchema from "@/app/components/ProductSchema";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Scan hideFooter>
      <ProductSchema
        productTitle="Login | Scan to Solve - Scholarly Help"
        metaDescription="Log in to your Scan to Solve account to scan homework exercises and get instant step-by-step solutions from Scholarly Help."
        pageUrl={`${baseUrl}/scan/login`}
      />
      <Login />
    </Scan>
  );
};

export default page;
