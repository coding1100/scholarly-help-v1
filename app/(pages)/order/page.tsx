import { FC } from "react";
import Hero from "@/app/components/Hero/Hero";
import MainLayout from "@/app/MainLayout";
import Order from "./Order";
import { MetaData } from "@/app/metadata/metadata";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <MainLayout>
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
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
