import MainLayout from "@/app/MainLayout";
import { FC } from "react";
// import TermsConditons from "./termsConditons";
import Privacy from "./Privacy";
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
        productTitle={MetaData.privacy.title}
        metaDescription={MetaData.privacy.description}
        pageUrl={`${baseUrl}/${MetaData.privacy.url}`}
      />
      <Privacy />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.privacy.url}`;
  return {
    title: `${MetaData.privacy.title}`,
    description: `${MetaData.privacy.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
