import type { Metadata } from "next";
import ProductSchema from "@/app/components/ProductSchema";
import FreeToolsLanding from "@/app/components/FreeToolsLanding/FreeToolsLanding";

const PAGE_TITLE = "Guaranteed A or B Online Class Help | ScholarlyHelp";
const PAGE_DESCRIPTION =
  "Get a guaranteed A or B in your online class or you don't pay. US-based experts handle 100% of your coursework anonymously.";

const Page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const pageUrl = `${baseUrl}/take-my-class-3/`;

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
  const canonicalUrl = `${baseUrl}take-my-class-3/`;
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
