import AuthLayout from "@/app/components/Auth/AuthLayout";
import ForgotPassword from "@/app/components/Auth/ForgotPassword";
import ProductSchema from "@/app/components/ProductSchema";
import React, { Suspense } from "react";

const page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <div>
      <ProductSchema
        productTitle="Forgot Password - Scholarly Help"
        metaDescription="Forgot your Scholarly Help password? Enter your email address and we will send you a link to reset your password and regain access to your account."
        pageUrl={`${baseUrl}/forgot-password/`}
      />
      <AuthLayout>
        <Suspense fallback={null}>
          <ForgotPassword />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;
