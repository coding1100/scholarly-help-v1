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
  essaySubjects,
  isValidEssaySubject,
  EssaySubject,
} from "../subjectContent";
import { notFound } from "next/navigation";
import clientPromise from "@/app/lib/mongodb";
import { Metadata } from "next";
import { EssayWritingDataProvider } from "../EssayWritingDataProvider";
import dynamicImport from "next/dynamic";
import { essayWritingSubjects } from "../content";
import DeliveredOn from "../../take-my-class/DeliveredOn";
import SubSubjectsSection from "@/app/components/LandingPage/SubSubjects";
import OnlinePlatform from "@/app/components/OnlinePlatform/OnlinePlatform";
import PriceSection from "@/app/components/PriceSection/PriceSection";
import FinalCTA from "@/app/components/FinalCTA/FinalCTA";
import ProductSchema from "@/app/components/ProductSchema";

const GetQouteDynamic = dynamicImport(
  () => import("@/app/components/LandingPage/GetQoute"),
  { ssr: false },
);

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    subject: string;
  };
}

async function fetchPageData(slug: string) {
  try {
    const client = await clientPromise;
    const db = client.db("scholarly_help");

    // Handle different slug formats
    let slugVariations = [slug];

    // If slug is like "essay_writing_english", also try "english"
    if (slug.startsWith("essay_writing_")) {
      slugVariations.push(slug.replace("essay_writing_", ""));
    } else if (slug.startsWith("essay_writings_")) {
      slugVariations.push(slug.replace("essay_writings_", ""));
      slugVariations.push(slug.replace("essay_writings_", "essay_writing_"));
    } else {
      // If slug is like "english", also try "essay_writing_english"
      slugVariations.push(`essay_writing_${slug}`);
      slugVariations.push(`essay_writings_${slug}`);
    }

    // Build query to match any variation
    const orConditions = [];
    for (const variation of slugVariations) {
      orConditions.push({ slug: variation });
      orConditions.push({ id: variation });
    }
    const query = { $or: orConditions };

    console.log(
      `Querying essay_writing with slug: ${slug}, query:`,
      JSON.stringify(query),
    );
    const content = await db.collection("essay_writing").findOne(query);
    console.log("Found content:", content ? "Yes" : "No");

    // If no content found, try to see what's in the collection
    if (!content) {
      const allDocs = await db
        .collection("essay_writing")
        .find({ slug: slug })
        .limit(5)
        .toArray();
      console.log(
        "Sample documents matching slug:",
        allDocs.map((d) => ({ id: d.id, slug: d.slug })),
      );
    }

    // Do not close the client as it is shared

    return content as any;
  } catch (error) {
    console.error("Error fetching page data:", error);
    return null;
  }
}

const Page: React.FC<PageProps> = async ({ params }) => {
  // Check if the subject is valid
  if (!isValidEssaySubject(params.subject)) {
    notFound();
  }

  const pageData = await fetchPageData(params.subject);

  // If no pageData found, still render the page with default structure
  // This allows the page to work even if data doesn't exist in MongoDB yet
  if (!pageData) {
    // Return a default page structure instead of 404
    const defaultPageData: any = {
      id: `essay_writing_${params.subject}`,
      slug: params.subject,
      pageType: `essay_writing_${params.subject}`,
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
      params.subject.charAt(0).toUpperCase() +
      params.subject.slice(1).replace(/-/g, " ");
    const rawBaseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
    const baseUrl = rawBaseUrl.endsWith("/")
      ? rawBaseUrl.slice(0, -1)
      : rawBaseUrl;

    return (
      <EssayWritingDataProvider data={defaultPageData}>
        <ProductSchema
          productTitle={`${subjectTitle} Essay Writing Help - Professional Assistance`}
          metaDescription={`Get expert help with your ${params.subject.replace(
            /-/g,
            " ",
          )} essay writing.`}
          pageUrl={`${baseUrl}/essay-writing/${params.subject}`}
        />
        <MainLayout>
          <HeroSection />
          <DeliveredOn />
          <Success />
          <CardCarousel />
          <Description />
          {/* <GuaranteedBlock />
          <WhySlider /> */}
          <CustomerReviews />
          <ProcessSection />
          <Subjects defaultSubjects={essayWritingSubjects} />
          <SubSubjectsSection defaultSubSubjects={essayWritingSubjects} />
          <OnlinePlatform />
          <AcademicPartners />
          <PriceSection />
          {/* <GetQouteDynamic /> */}
          <Faq />
          <FinalCTA />
        </MainLayout>
      </EssayWritingDataProvider>
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
    params.subject.charAt(0).toUpperCase() +
    params.subject.slice(1).replace(/-/g, " ");
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const productTitle =
    pageData.meta?.title ||
    `${subjectTitle} Essay Writing Help - Professional Assistance`;
  const metaDescription =
    pageData.meta?.description ||
    `Get expert help with your ${params.subject.replace(
      /-/g,
      " ",
    )} essay writing.`;
  const pageUrl =
    pageData.meta?.canonicalUrl || `${baseUrl}/essay-writing/${params.subject}`;

  return (
    <EssayWritingDataProvider data={pageData}>
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
        {/* <GuaranteedBlock />
          <WhySlider /> */}
        <CustomerReviews />
        <ProcessSection />
        <Subjects defaultSubjects={essayWritingSubjects} />
        <SubSubjectsSection defaultSubSubjects={essayWritingSubjects} />
        <OnlinePlatform />
        <AcademicPartners />
        <PriceSection />
        {/* <GetQouteDynamic /> */}
        <Faq />
        <FinalCTA />
      </MainLayout>
    </EssayWritingDataProvider>
  );
};

export default Page;

export function generateStaticParams() {
  return essaySubjects.map((subject) => ({
    subject: subject,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { subject: string };
}): Promise<Metadata> {
  if (!isValidEssaySubject(params.subject)) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db("scholarly_help");

    let slugVariations: string[] = [params.subject];
    if (params.subject.startsWith("essay_writing_")) {
      slugVariations.push(params.subject.replace("essay_writing_", ""));
    } else if (params.subject.startsWith("essay_writings_")) {
      slugVariations.push(params.subject.replace("essay_writings_", ""));
      slugVariations.push(
        params.subject.replace("essay_writings_", "essay_writing_"),
      );
    } else {
      slugVariations.push(`essay_writing_${params.subject}`);
      slugVariations.push(`essay_writings_${params.subject}`);
    }

    const orConditions = [];
    for (const variation of slugVariations) {
      orConditions.push({ slug: variation });
      orConditions.push({ id: variation });
    }
    const query = { $or: orConditions, status: { $ne: "draft" } };

    const pageData: any = await db.collection("essay_writing").findOne(query);
    // Do not close client

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
        } Essay Writing Help`;
      const metaDescription =
        pageData.meta?.description ||
        `Get expert help with your ${params.subject.replace(
          /-/g,
          " ",
        )} essay writing.`;
      const canonicalUrl =
        pageData.meta?.canonicalUrl ||
        `${baseUrl}/essay-writing/${params.subject}`;

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

  const canonicalUrl = `${baseUrl}/essay-writing/${params.subject}`;

  return {
    title: `${subjectTitle} Essay Writing Help - Professional Assistance`,
    description: `Get expert help with your ${params.subject.replace(
      /-/g,
      " ",
    )} essay writing.`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
