import { FC } from "react";
import { Metadata } from "next";
import MainLayout from "@/app/MainLayout";
import ProductSchema from "@/app/components/ProductSchema";
import ToolLanding from "@/app/components/AiLandingPage/ToolLanding/ToolLanding";
import { CoursePlannerEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import type { ToolLandingContent } from "@/app/components/AiLandingPage/ToolLanding/types";
import {
  heroContent,
  beforeAfterContent,
  useCasesContent,
  howItWorksContent,
  whyItWorksContent,
  twoWaysContent,
  reviewsContent,
  faqContent,
  footerCtaContent,
  metaContent,
} from "@/app/components/AiLandingPage/CoursePlanner/content";

const pagePath = "/tools/ai-course-planner";

const coursePlannerLandingContent: ToolLandingContent = {
  hero: {
    badge: heroContent.badge,
    titleTop: heroContent.titleTop,
    titleAccent: heroContent.titleAccent,
    subtitle: heroContent.subtitle,
    steps: heroContent.steps,
    toolId: "course-planner-tool",
  },
  beforeAfter: {
    eyebrow: beforeAfterContent.eyebrow,
    title: beforeAfterContent.title,
    subtitle: beforeAfterContent.subtitle,
    pasteLabel: beforeAfterContent.pasteLabel,
    pasteText: beforeAfterContent.pasteText,
    resultLabel: beforeAfterContent.resultLabel,
    resultText: beforeAfterContent.resultText,
    tags: beforeAfterContent.tags,
  },
  useCases: {
    eyebrow: useCasesContent.eyebrow,
    title: useCasesContent.title,
    subtitle: useCasesContent.subtitle,
    cards: useCasesContent.cards,
  },
  howItWorks: {
    eyebrow: howItWorksContent.eyebrow,
    title: howItWorksContent.title,
    steps: howItWorksContent.steps,
    ctaTitle: `${howItWorksContent.ctaTitleStart} ${howItWorksContent.ctaTitleBrand}${howItWorksContent.ctaTitlePill}`,
    ctaBody: howItWorksContent.ctaBody,
    ctaButton: howItWorksContent.ctaButton,
    ctaHref: howItWorksContent.ctaHref,
  },
  whyItWorks: {
    eyebrow: whyItWorksContent.eyebrow,
    title: whyItWorksContent.title,
    subtitle: whyItWorksContent.subtitle,
    features: whyItWorksContent.features,
  },
  twoWays: {
    eyebrow: twoWaysContent.eyebrow,
    title: twoWaysContent.title,
    subtitle: twoWaysContent.subtitle,
    freeColumn: {
      heading: twoWaysContent.freeColumn.heading,
      subheading: twoWaysContent.freeColumn.subheading,
      steps: twoWaysContent.freeColumn.steps,
    },
    expertColumn: {
      heading: twoWaysContent.expertColumn.heading,
      subheading: twoWaysContent.expertColumn.subheading,
      steps: twoWaysContent.expertColumn.steps,
    },
  },
  reviews: {
    eyebrow: reviewsContent.eyebrow,
    title: reviewsContent.title,
    reviews: reviewsContent.reviews,
  },
  faq: {
    title: faqContent.title,
    subtitle: faqContent.subtitle,
    items: faqContent.items,
  },
  footer: {
    titleStart: footerCtaContent.titleStart,
    titlePill: footerCtaContent.titlePill,
    body: footerCtaContent.body,
    primaryButton: footerCtaContent.primaryButton,
    primaryHref: footerCtaContent.primaryHref,
    secondaryButton: footerCtaContent.secondaryButton,
    secondaryHref: footerCtaContent.secondaryHref,
  },
};

const Page: FC = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;

  return (
    <MainLayout>
      <ProductSchema
        productTitle={metaContent.title}
        metaDescription={metaContent.description}
        pageUrl={`${normalizedBaseUrl}${pagePath}`}
      />
      <ToolLanding content={coursePlannerLandingContent} tool={<CoursePlannerEmbed />} />
    </MainLayout>
  );
};
export default Page;

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const canonicalUrl = `${normalizedBaseUrl}${pagePath}`;

  return {
    title: metaContent.title,
    description: metaContent.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
