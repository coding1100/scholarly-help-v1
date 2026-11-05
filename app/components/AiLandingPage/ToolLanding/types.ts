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

export interface BeforeAfterContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  pasteLabel: string;
  pasteText: string;
  pasteHtml?: string;
  resultLabel: string;
  resultText: string;
  resultHtml?: string;
  tags?: { label: string; className: string }[];
}

export interface ToolLandingContent {
  hero: {
    badge: string;
    /** Optional emoji rendered before the badge text. */
    badgeIcon?: string;
    titleTop: string;
    titleAccent: string;
    subtitle: string;
    /** Numbered step pills under the subtitle. Omit or pass [] to skip them. */
    steps: string[];
    toolId: string;
  };
  beforeAfter?: BeforeAfterContent;
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
  /** Replaces the default gradient hero (badge/title/tool) with a fully custom one. Sections below the hero are unaffected. */
  hero?: ReactNode;
}
