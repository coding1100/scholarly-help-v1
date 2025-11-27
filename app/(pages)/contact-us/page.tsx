import MainLayout from "@/app/MainLayout";
import { FC } from "react";
import ContactUs from "./ContactUs";
import { MetaData } from "@/app/metadata/metadata";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <MainLayout>
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
