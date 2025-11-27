import MainLayout from "@/app/MainLayout";
import { FC } from "react";
// import TermsConditons from "./termsConditons";
import Privacy from "./Privacy";
import { MetaData } from "@/app/metadata/metadata";

interface PageProps {}
const Page: FC<PageProps> = ({}) => {
  // return <div>test</div>
  return (
    <MainLayout>
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
