import type { ReactNode } from "react";
import type { WatchVideoContent } from "./WatchVideo";

export interface LandingCard {
  icon: string;
  title: string;
  description: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface ToolLandingContent {
  hero: {
    badge: string;
    titleTop: string;
    titleAccent: string;
    subtitle: string;
    steps: string[];
    toolId: string;
  };
  useCases: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cards: LandingCard[];
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    steps: LandingStep[];
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    ctaHref: string;
  };
  whyItWorks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    features: LandingCard[];
  };
  twoWays: {
    eyebrow: string;
    title: string;
    subtitle: string;
    freeColumn: {
      heading: string;
      subheading: string;
      steps: LandingStep[];
    };
    expertColumn: {
      heading: string;
      subheading: string;
      steps: LandingStep[];
    };
  };
  watchVideo?: WatchVideoContent;
  reviews: {
    eyebrow: string;
    title: string;
    reviews: { quote: string; author: string; detail: string }[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  footer: {
    titleStart: string;
    titlePill: string;
    body: string;
    primaryButton: string;
    primaryHref: string;
    secondaryButton: string;
    secondaryHref: string;
    footnote?: string;
  };
}

export interface ToolLandingProps {
  content: ToolLandingContent;
  tool: ReactNode;
}
