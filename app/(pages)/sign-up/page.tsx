import AuthLayout from "@/app/components/Auth/AuthLayout";
// import SignInCard from "@/app/components/Auth/SignInCard";
import SignUpCard from "@/app/components/Auth/SignUpCard";
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
        productTitle="Sign Up - Scholarly Help"
        metaDescription="Create your free Scholarly Help account to access academic tools and get expert help with your assignments, online classes, and exams."
        pageUrl={`${baseUrl}/sign-up/`}
      />
      <AuthLayout>
        {/* <SignInCard /> */}
        <Suspense fallback={null}>
          <SignUpCard />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;
