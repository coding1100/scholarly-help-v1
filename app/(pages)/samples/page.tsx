import MainLayout from "@/app/MainLayout";
import Hero from "@/app/components/Hero/Hero";
import { FC, Suspense } from "react";
import { content } from "./content";
import { MetaData } from "@/app/metadata/metadata";
import { DynamicSamplesAssignments } from "@/app/components/DynamicComponents";

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  return (
    <MainLayout>
      {/* Hero is loaded immediately as it's above the fold */}
      <Hero content={content.heroContent} />

      {/* Samples content loaded dynamically */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96" />}>
        <DynamicSamplesAssignments
          content={content.samplesContent.SamplesButton}
        />
      </Suspense>
    </MainLayout>
  );
};

export default Page;

export function generateMetadata({}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}${MetaData.samples.url}`;
  return {
    title: `${MetaData.samples.title}`,
    description: `${MetaData.samples.description}`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
