import { cache } from "react";
import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import HeroHeading from "@/app/components/LandingPage/HeroHeading";
import BelowFoldLanding from "@/app/components/LandingPage/BelowFoldLanding";
import DelayedBelowFold from "@/app/components/LandingPage/DelayedBelowFold";
import { TakeMyClassDataProvider } from "../TakeMyClassDataProvider";
import type { Metadata } from "next";
import { getPageData } from "@/app/lib/mongodb";

// Same caching as /take-my-class, whose admin save also revalidates this page.
export const revalidate = 300;

const MAIN_HEADING = "But Free Tools Aren’t Enough to Secure Your Grade.";
const DESCRIPTION =
  "They won't do the heavy lifting or guarantee you pass when the pressure is on. With our Done-For-You Exam Assistance, an expert in your exact subject steps in to handle everything from start to finish | backed by absolute privacy and a guaranteed Grade A or B, or your money back.";

const fetchTakeMyClassData = cache(async () => {
  try {
    return await getPageData(
      "pages",
      { id: "take-my-class" },
      { readPreference: "primary" },
    );
  } catch (error) {
    console.error("Error fetching take-my-class data:", error);
    return null;
  }
});

/**
 * Where the free-tools lead form (/take-my-class-2, -3, -4) lands: the
 * /take-my-class page with its own hero copy and every CTA opening a
 * pre-filled text message (see isTextCtaLandingPage).
 */
const Page = async () => {
  const pageData = await fetchTakeMyClassData();

  return (
    <TakeMyClassDataProvider data={pageData}>
      {/* Critical CSS for the LCP heading, kept in sync with /take-my-class. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #hero-section{background:#F5F6FA}
            .tmc-hero-heading{font-weight:600;font-size:30px;line-height:1.1;color:#000}
            @media (min-width:768px){.tmc-hero-heading{font-size:48px}}
          `,
        }}
      />
      <MainLayout>
        <HeroSection
          useHeroForm2
          heroContent={{ ...pageData?.heroSection, description: DESCRIPTION }}
          headingSlot={
            <div className="max-w-2xl">
              <HeroHeading
                mainHeading={MAIN_HEADING}
                spanClassName="md:pt-5 block"
              />
            </div>
          }
        />
        <DelayedBelowFold>
          <BelowFoldLanding />
        </DelayedBelowFold>
      </MainLayout>
    </TakeMyClassDataProvider>
  );
};
export default Page;

export const metadata: Metadata = {
  title: "Your Free Tools Guide Is On Its Way | ScholarlyHelp",
  description:
    "Your free tools guide has been sent to your inbox. Get done-for-you exam assistance with a guaranteed A or B.",
  // Post-form page reached only after the free-tools lead form.
  robots: { index: false, follow: false },
};
