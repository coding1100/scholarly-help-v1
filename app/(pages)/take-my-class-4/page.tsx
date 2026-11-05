import type { Metadata } from "next";
import ProductSchema from "@/app/components/ProductSchema";
import FreeToolsLanding from "@/app/components/FreeToolsLanding/FreeToolsLanding";

const PAGE_TITLE = "Save 20+ Hours a Week Online Class Help | ScholarlyHelp";
const PAGE_DESCRIPTION =
  "Stop sacrificing your nights and weekends. US-based experts take 100% of the discussions, quizzes, and finals off your plate.";

const Page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const pageUrl = `${baseUrl}/take-my-class-4/`;

  return (
    <>
      <ProductSchema
        productTitle={PAGE_TITLE}
        metaDescription={PAGE_DESCRIPTION}
        pageUrl={pageUrl}
      />
      <FreeToolsLanding />
    </>
  );
};
export default Page;

export async function generateMetadata({}): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com/";
  const canonicalUrl = `${baseUrl}take-my-class-4/`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
