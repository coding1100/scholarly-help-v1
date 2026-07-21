import MainLayout from "@/app/MainLayout";
import { FC } from "react";
import AboutUs from "./Aboutus";
import { MetaData } from "@/app/metadata/metadata";
import ProductSchema from "@/app/components/ProductSchema";
// import type { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'About us | Online Help with Money Back Guarantee - Scholarly Help',

// }

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  // return <div>test</div>
  return (
    <>
      <ProductSchema
        productTitle={MetaData.aboutUs.title}
        metaDescription={MetaData.aboutUs.description}
        pageUrl={`${baseUrl}/${MetaData.aboutUs.url}`}
      />
      <MainLayout>
        <AboutUs />
      </MainLayout>
      
    </>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.aboutUs.url}`;
  return {
    title: `${MetaData.aboutUs.title}`,
    description: `${MetaData.aboutUs.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
