import MainLayout from "@/app/MainLayout";
import HeroSection from "@/app/components/LandingPage/HeroSection";
import Ratings from "@/app/components/LandingPage/Ratings";
import WhySlider from "@/app/components/LandingPage/WhySlider";
import CardCarousel from "@/app/components/LandingPage/CardCarousel";
import Description from "@/app/components/LandingPage/Description";
import GuaranteedBlock from "@/app/components/LandingPage/GuaranteedBlock";
import ProcessSection from "@/app/components/LandingPage/ProcessSection";
import Success from "@/app/components/LandingPage/Success";
import AcademicPartners from "@/app/components/LandingPage/AcademicPartners";
import GetQoute from "@/app/components/LandingPage/GetQoute";
import Faq from "@/app/components/LandingPage/Faq";
import CustomerReviews from "@/app/components/LandingPage/CustomerReviews";
import Subjects from "@/app/components/LandingPage/Subjects";
import {
  assignmentSubjects,
  isValidAssignmentSubject,
} from "../subjectContent";
import { notFound } from "next/navigation";
import { AssignmentDataProvider } from "../AssignmentDataProvider";
import { assignmentSubject } from "../content";
import { Metadata } from "next";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { subject: string };
}

import { getMongoDb } from "@/app/lib/mongodb";
import { findAssignmentSubjectDocument } from "@/app/lib/assignmentDuplicate";
import { migratePagesDuplicateToAssignments } from "@/app/lib/assignmentDuplicate";
import DeliveredOn from "../../take-my-class/DeliveredOn";
import SubSubjectsSection from "@/app/components/LandingPage/SubSubjects";
import OnlinePlatform from "@/app/components/OnlinePlatform/OnlinePlatform";
import PriceSection from "@/app/components/PriceSection/PriceSection";
import FinalCTA from "@/app/components/FinalCTA/FinalCTA";
import ProductSchema from "@/app/components/ProductSchema";

async function fetchPageData(slug: string) {
  try {
    const db = await getMongoDb();
    if (!db) return null;
    await migratePagesDuplicateToAssignments(db, slug);
    return (await findAssignmentSubjectDocument(db, slug)) as Record<
      string,
      unknown
    > | null;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { subject } = params;

  const pageData = await fetchPageData(subject);

  const isDuplicate = !!pageData?.isDynamicLandingDuplicate;
  if (!isValidAssignmentSubject(subject) && !isDuplicate) {
    notFound();
  }

  if (isDuplicate && !pageData?.published) {
    notFound();
  }

  // If no pageData found, still render the page with default structure
  // This allows the page to work even if data doesn't exist in MongoDB yet
  if (!pageData) {
    // Return a default page structure instead of 404
    const defaultPageData: any = {
      id: `assignment_${subject}`,
      slug: subject,
      pageType: `assignment_${subject}`,
      status: "published",
      meta: { title: "", description: "" },
      heroSection: { mainHeading: "", subHeading: "", description: "" },
      whySlider: { mainHeading: "", description: "", ctaButton: { text: "" } },
      cardCarousel: {
        mainHeading: "",
        description: "",
        ctaButton: { text: "" },
      },
      description: {
        mainHeading: "",
        description: "",
        services: [],
        badges: [],
        ctaButton: { text: "" },
      },
      guaranteedBlock: {
        mainHeading: "",
        description: "",
        ctaButton: { text: "" },
      },
      processSection: { mainHeading: "", description: "", steps: [] },
      success: { mainHeading: "", description: "", ctaButton: { text: "" } },
      academicPartners: {
        mainHeading: "",
        description: "",
        cards: undefined,
        ctaButton: { text: "" },
      },
      getQuote: { mainHeading: "", description: "", ctaButton: { text: "" } },
      faq: { mainHeading: "", faqs: [] },
    };
    const subjectTitle =
      subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, " ");
    const rawBaseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
    const baseUrl = rawBaseUrl.endsWith("/")
      ? rawBaseUrl.slice(0, -1)
      : rawBaseUrl;

    return (
      <AssignmentDataProvider data={defaultPageData}>
        <ProductSchema
          productTitle={`${subjectTitle} Assignment Help - Professional Assistance`}
          metaDescription={`Get expert help with your ${subject.replace(
            /-/g,
            " ",
          )} assignment.`}
          pageUrl={`${baseUrl}/assignment/${subject}`}
        />
        <MainLayout>
          <HeroSection />
          <DeliveredOn />
          <Success />
          <CardCarousel />
          <Description />
          <CustomerReviews />
          <ProcessSection />
          <Subjects defaultSubjects={assignmentSubject} />
          <SubSubjectsSection defaultSubSubjects={assignmentSubject} />
          <OnlinePlatform />

          <AcademicPartners />
          <PriceSection />

          <Faq />
          <FinalCTA />
        </MainLayout>
      </AssignmentDataProvider>
    );
  }

  // Only return 404 if status is explicitly set to something other than published
  if (
    pageData.status &&
    pageData.status !== "published" &&
    pageData.status !== "draft"
  ) {
    notFound();
  }
  const subjectTitle =
    subject.charAt(0).toUpperCase() + subject.slice(1).replace(/-/g, " ");
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const meta = pageData.meta as
    | { title?: string; description?: string; canonicalUrl?: string }
    | undefined;
  const productTitle = meta?.title || `${subjectTitle} Assignment Help`;
  const metaDescription =
    meta?.description ||
    `Get expert help with your ${subject.replace(/-/g, " ")} assignment.`;
  const pageUrl = meta?.canonicalUrl || `${baseUrl}/assignment/${subject}`;

  return (
    <AssignmentDataProvider data={pageData}>
      <ProductSchema
        productTitle={productTitle}
        metaDescription={metaDescription}
        pageUrl={pageUrl}
      />
      <MainLayout>
        <HeroSection />
        <DeliveredOn />
        <Success />
        <CardCarousel />
        <Description />
        <CustomerReviews />
        <ProcessSection />
        <Subjects defaultSubjects={assignmentSubject} />
        <SubSubjectsSection defaultSubSubjects={assignmentSubject} />
        <OnlinePlatform />

        <AcademicPartners />
        <PriceSection />
        <Faq />
        <FinalCTA />
      </MainLayout>
    </AssignmentDataProvider>
  );
};

export default Page;

export function generateStaticParams() {
  return assignmentSubjects.map((subject) => ({ subject }));
}

export async function generateMetadata({
  params,
}: {
  params: { subject: string };
}): Promise<Metadata> {
  if (!isValidAssignmentSubject(params.subject)) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  try {
    const db = await getMongoDb();
    if (db) {
      await migratePagesDuplicateToAssignments(db, params.subject);
      const pageData = (await findAssignmentSubjectDocument(
        db,
        params.subject,
      )) as {
        meta?: { title?: string; description?: string; canonicalUrl?: string };
        status?: string;
      } | null;

    if (pageData && pageData.status !== "draft") {
      const rawBaseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
      const baseUrl = rawBaseUrl.endsWith("/")
        ? rawBaseUrl.slice(0, -1)
        : rawBaseUrl;

      const metaTitle =
        pageData.meta?.title ||
        `${
          params.subject.charAt(0).toUpperCase() +
          params.subject.slice(1).replace(/-/g, " ")
        } Assignment Help`;
      const metaDescription =
        pageData.meta?.description ||
        `Get expert help with your ${params.subject.replace(
          /-/g,
          " ",
        )} assignment.`;
      const canonicalUrl =
        pageData.meta?.canonicalUrl ||
        `${baseUrl}/assignment/${params.subject}`;

      return {
        title: metaTitle,
        description: metaDescription,
        alternates: { canonical: canonicalUrl },
      };
    }
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  // Fallback metadata
  const subjectTitle =
    params.subject.charAt(0).toUpperCase() +
    params.subject.slice(1).replace(/-/g, " ");

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  const canonicalUrl = `${baseUrl}/assignment/${params.subject}`;

  return {
    title: `${subjectTitle} Assignment Help - Professional Assistance`,
    description: `Get expert help with your ${params.subject.replace(
      /-/g,
      " ",
    )} assignment.`,
    alternates: { canonical: canonicalUrl },
  };
}
