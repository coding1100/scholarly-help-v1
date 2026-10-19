import AuthLayout from "@/app/components/Auth/AuthLayout";
import ChangePassword from "@/app/components/Auth/ChangePassword";
import ProductSchema from "@/app/components/ProductSchema";
import React, { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Scholarly Help",
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
        productTitle="Reset Password - Scholarly Help"
        metaDescription="Set a new password for your Scholarly Help account. Choose a strong password to keep your account secure and get back to your studies."
        pageUrl={`${baseUrl}/reset-password/`}
      />
      <AuthLayout>
        <Suspense fallback={null}>
          <ChangePassword />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;
