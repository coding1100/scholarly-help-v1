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
import { examSubjects, isValidExamSubject } from "../subjectContent";
import { notFound } from "next/navigation";
import clientPromise from "@/app/lib/mongodb";
import { Metadata } from "next";
import { ExamDataProvider } from "../ExamDataProvider";
import { examsSubjects } from "../../exams/content";
import DeliveredOn from "../../take-my-class/DeliveredOn";
import SubSubjectsSection from "@/app/components/LandingPage/SubSubjects";
import OnlinePlatform from "@/app/components/OnlinePlatform/OnlinePlatform";
import ProductSchema from "@/app/components/ProductSchema";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { subject: string };
}

async function fetchPageData(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db("scholarly_help");

    // Handle different slug formats
    let slugVariations = [slug];

    // If slug is like "exam_english", also try "english"
    if (slug.startsWith("exam_")) {
      slugVariations.push(slug.replace("exam_", ""));
    } else {
      // If slug is like "english", also try "exam_english"
      slugVariations.push(`exam_${slug}`);
    }

    // Build query to match any variation
    const orConditions = [];
    for (const variation of slugVariations) {
      orConditions.push({ slug: variation });
      orConditions.push({ id: variation });
    }
    const query = { $or: orConditions };

    const content = await db.collection("exam").findOne(query);
    // Do not close shared client

    return content as any;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { subject } = params;

  if (!isValidExamSubject(subject)) {
    notFound();
  }

  const pageData = await fetchPageData(subject);

  // If no pageData found, still render the page with default structure
  // This allows the page to work even if data doesn't exist in MongoDB yet
  if (!pageData) {
    // Return a default page structure instead of 404
    const defaultPageData: any = {
      id: `exam_${subject}`,
      slug: subject,
      pageType: `exam_${subject}`,
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
      <ExamDataProvider data={defaultPageData}>
        <ProductSchema
          productTitle={`${subjectTitle} Exam Help - Professional Assistance`}
          metaDescription={`Get expert help with your ${subject.replace(
            /-/g,
            " ",
          )} exam.`}
          pageUrl={`${baseUrl}/exam/${subject}`}
        />
        <MainLayout>
          <HeroSection />
          <DeliveredOn />
          <Success />
          <CardCarousel />
          <Description />

          <CustomerReviews />
          <ProcessSection />
          <Subjects defaultSubjects={examsSubjects} />
          <SubSubjectsSection defaultSubSubjects={examsSubjects} />
          <OnlinePlatform />
          <AcademicPartners />
          <Faq />
        </MainLayout>
      </ExamDataProvider>
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
  const productTitle = pageData.meta?.title || `${subjectTitle} Exam Help`;
  const metaDescription =
    pageData.meta?.description ||
    `Get expert help with your ${subject.replace(/-/g, " ")} exam.`;
  const pageUrl = pageData.meta?.canonicalUrl || `${baseUrl}/exam/${subject}`;

  return (
    <ExamDataProvider data={pageData}>
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
        <Subjects defaultSubjects={examsSubjects} />
        <SubSubjectsSection defaultSubSubjects={examsSubjects} />
        <OnlinePlatform />
        <AcademicPartners />
        <Faq />
      </MainLayout>
    </ExamDataProvider>
  );
};

export default Page;

export function generateStaticParams() {
  return examSubjects.map((subject) => ({ subject }));
}

export async function generateMetadata({
  params,
}: {
  params: { subject: string };
}): Promise<Metadata> {
  if (!isValidExamSubject(params.subject)) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db("scholarly_help");

    let slugVariations: string[] = [params.subject];
    if (params.subject.startsWith("exam_")) {
      slugVariations.push(params.subject.replace("exam_", ""));
    } else {
      slugVariations.push(`exam_${params.subject}`);
    }

    const orConditions = [];
    for (const variation of slugVariations) {
      orConditions.push({ slug: variation });
      orConditions.push({ id: variation });
    }
    const query = { $or: orConditions, status: { $ne: "draft" } };

    const pageData: any = await db.collection("exam").findOne(query);
    // Do not close shared client

    if (pageData) {
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
        } Exam Help`;
      const metaDescription =
        pageData.meta?.description ||
        `Get expert help with your ${params.subject.replace(/-/g, " ")} exam.`;
      const canonicalUrl =
        pageData.meta?.canonicalUrl || `${baseUrl}/exam/${params.subject}`;

      return {
        title: metaTitle,
        description: metaDescription,
        alternates: { canonical: canonicalUrl },
      };
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

  const canonicalUrl = `${baseUrl}/exam/${params.subject}`;

  return {
    title: `${subjectTitle} Exam Help - Professional Assistance`,
    description: `Get expert help with your ${params.subject.replace(
      /-/g,
      " ",
    )} exam.`,
    alternates: { canonical: canonicalUrl },
  };
}
