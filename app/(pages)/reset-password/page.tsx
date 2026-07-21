import ChangePassword from "@/app/components/Auth/ChangePassword";
import ProductSchema from "@/app/components/ProductSchema";
import React from "react";

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
      <ChangePassword />
    </div>
  );
};

export default page;
