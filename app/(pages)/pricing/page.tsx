import PricingPage from "@/app/components/PricingPlan/PricingPage";
import ProductSchema from "@/app/components/ProductSchema";
import { FC } from "react";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  return (
    <>
      <ProductSchema
        productTitle="Pricing | Simple, Transparent Plans - Scholarly Help"
        metaDescription="Explore Scholarly Help's simple, transparent pricing plans for academic assistance. Compare plans and choose the option that fits your needs and budget."
        pageUrl={`${baseUrl}/pricing`}
      />
      <PricingPage />
    </>
  );
};
export default Page;
