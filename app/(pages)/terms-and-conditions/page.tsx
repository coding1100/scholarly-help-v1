import { FC } from "react";
import { content } from "./content";
import Hero from "@/app/components/Hero/Hero";
import MainLayout from "@/app/MainLayout";
// import TermsConditons from "./termsConditons";
import TermsConditons from "./TermsConditons";
import { MetaData } from "@/app/metadata/metadata";
import ProductSchema from "@/app/components/ProductSchema";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  // return <div>test</div>
  return (
    <MainLayout>
      <ProductSchema
        productTitle={MetaData.termsAndConditions.title}
        metaDescription={MetaData.termsAndConditions.description}
        pageUrl={`${baseUrl}/${MetaData.termsAndConditions.url}`}
      />
      <TermsConditons />
    </MainLayout>
  );
};
export default Page;
export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.termsAndConditions.url}`;
  return {
    title: `${MetaData.termsAndConditions.title}`,
    description: `${MetaData.termsAndConditions.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
