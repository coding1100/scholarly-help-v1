"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AppNav from "@/app/components/NavBar/AppNav";
import ThankYou from "@/app/components/ThankYou/ThankYou";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <MainLayout>
      <ProductSchema
        productTitle="Thank You - Scholarly Help"
        metaDescription="Thank you for contacting Scholarly Help. Our team has received your request and will get back to you shortly with the academic help you need."
        pageUrl={`${baseUrl}/thank-you/`}
      />
      <ThankYou />
    </MainLayout>
  );
};

export default page;
