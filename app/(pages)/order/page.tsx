import { FC } from "react";
import Hero from "@/app/components/Hero/Hero";
import MainLayout from "@/app/MainLayout";
import Order from "./Order";
import { MetaData } from "@/app/metadata/metadata";
import ProductSchema from "@/app/components/ProductSchema";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <MainLayout>
      <ProductSchema
        productTitle={MetaData.order.title}
        metaDescription={MetaData.order.description}
        pageUrl={`${baseUrl}/${MetaData.order.url}`}
      />
      <Order />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.order.url}`;
  return {
    title: `${MetaData.order.title}`,
    description: `${MetaData.order.description}`,
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
