import MainLayout from "@/app/MainLayout";
import { FC } from "react";
import ContactUs from "./ContactUs";
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
        productTitle={MetaData.contactUs.title}
        metaDescription={MetaData.contactUs.description}
        pageUrl={`${baseUrl}/${MetaData.contactUs.url}`}
      />
      <ContactUs />
    </MainLayout>
  );
};
export default Page;
export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.contactUs.url}`;
  return {
    title: `${MetaData.contactUs.title}`,
    description: `${MetaData.contactUs.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
