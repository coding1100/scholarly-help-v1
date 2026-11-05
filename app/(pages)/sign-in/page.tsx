import AuthLayout from "@/app/components/Auth/AuthLayout";
import SignInCard from "@/app/components/Auth/SignInCard";
import ProductSchema from "@/app/components/ProductSchema";
import React, { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Scholarly Help",
  // Auth pages are reached with many returnUrl variants. Keep them out of
  // the index but let crawlers follow links, and do not block them in
  // robots.txt or Google can never see this noindex.
  robots: { index: false, follow: true },
};

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <div>
      <ProductSchema
        productTitle="Sign In - Scholarly Help"
        metaDescription="Sign in to your Scholarly Help account to access academic tools, manage your orders, and get help with your assignments, classes, and exams."
        pageUrl={`${baseUrl}/sign-in/`}
      />
      <AuthLayout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
          <SignInCard />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;
