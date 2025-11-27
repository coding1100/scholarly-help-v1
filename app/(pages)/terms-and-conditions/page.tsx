import { FC } from "react";
import { content } from "./content";
import Hero from "@/app/components/Hero/Hero";
import MainLayout from "@/app/MainLayout";
// import TermsConditons from "./termsConditons";
import TermsConditons from "./TermsConditons";
import { MetaData } from "@/app/metadata/metadata";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <MainLayout>
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
