import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import MainToolHero from "@/app/components/MainToolLanding/MainToolHero";
import MainToolHelp from "@/app/components/MainToolLanding/MainToolHelp";
import MainToolPick from "@/app/components/MainToolLanding/MainToolPick";
import MainToolDashboardsection from "@/app/components/MainToolLanding/MainToolDashboardsection";
import MainToolWhyTool from "@/app/components/MainToolLanding/MainToolWhyTool";
import MainToolCards from "@/app/components/MainToolLanding/MainToolcards";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Faq from "@/app/components/LandingPage/Faq";
import { getPageData } from "@/app/lib/mongodb";
import { AcademicResearchDataProvider } from "./AcademicResearchDataProvider";
import { mergeAcademicResearchContent } from "@/app/components/MainToolLanding/mergeAcademicResearchContent";
import { defaultAcademicResearchContent } from "@/app/components/MainToolLanding/MainToolContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchAcademicResearchData() {
  try {
    return await getPageData("pages", { id: "academic-research" });
  } catch (error) {
    console.error("Error fetching academic-research data:", error);
    return null;
  }
}

interface PageProps {}

const Page = async ({}: PageProps) => {
  const pageData = await fetchAcademicResearchData();
  const content = mergeAcademicResearchContent(pageData);

  return (
    <AcademicResearchDataProvider data={content}>
      <MainLayout>
        <MainToolHero />
        <div className="bg-[#f3f4f9]">
          <MainToolHelp />
          <MainToolPick />
        </div>
        <MainToolDashboardsection />
        <MainToolWhyTool />
        <MainToolCards />
        <CustomerReviews />
        <Faq
          content={
            content.faq.length > 0
              ? content.faq.map((item, index) => ({
                  id: item.id ?? index + 1,
                  question: item.question,
                  answer: item.answer,
                }))
              : undefined
          }
        />
      </MainLayout>
    </AcademicResearchDataProvider>
  );
};

export default Page;

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await fetchAcademicResearchData();
  const content = mergeAcademicResearchContent(pageData);
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl =
    content.meta.canonicalUrl || `${normalizedBaseUrl}/academic-research`;

  return {
    title: content.meta.title || defaultAcademicResearchContent.meta.title,
    description:
      content.meta.description || defaultAcademicResearchContent.meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
