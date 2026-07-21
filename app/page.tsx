import MainLayout from "./MainLayout";
import HeroSection from "./components/LandingPage/HeroSection";
import HeroHeading from "./components/LandingPage/HeroHeading";
import { HomeDataProvider } from "./(pages)/HomeDataProvider";
import { getHomeData } from "./lib/mongodb";
import BelowFoldLanding from "./components/LandingPage/BelowFoldLanding";

// Enable ISR with 60 second revalidation for fast TTFB
export const revalidate = 60;

const Home = async () => {
  // Use pooled connection - much faster TTFB
  const pageData = await getHomeData();
  const mainHeading = pageData?.heroSection?.mainHeading ?? "";

  return (
    <HomeDataProvider data={pageData}>
      <MainLayout>
        <HeroSection
          headingSlot={
            mainHeading ? <HeroHeading mainHeading={mainHeading} /> : undefined
          }
        />
        {/* All below-the-fold sections mount only after the page is interactive */}
        <BelowFoldLanding />
      </MainLayout>
    </HomeDataProvider>
  );
};

export default Home;

export async function generateMetadata() {
  // Reuse the same cached data - no duplicate DB call
  const pageData = await getHomeData();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";

  if (pageData) {
    const metaTitle =
      pageData.meta?.title ||
      "Scholarly Help - Academic Writing Services For You";
    const metaDescription =
      pageData.meta?.description ||
      "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!";
    const canonicalUrl = pageData.meta?.canonicalUrl || baseUrl;

    return {
      title: metaTitle,
      description: metaDescription,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  return {
    title: "Scholarly Help - Academic Writing Services For You",
    description:
      "Struggling with online classes, exams, assignments or essays? Scholarly Help provides professional academic writing services tailored to your needs. Get timely, plagiarism-free solutions crafted by experts. Your success starts here!",
    alternates: {
      canonical: baseUrl,
    },
  };
}
