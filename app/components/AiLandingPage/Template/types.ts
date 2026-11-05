/**
 * Content for one tool landing page built on LandingTemplate. Every page
 * shares the template's hero and section designs; the page's content decides
 * which sections appear and in what order.
 */

export interface TitledText {
  title: string;
  description: string;
}

export interface LinkButton {
  label: string;
  /** A page path or an in-page anchor such as "#cgpa-calculator-tool". */
  href: string;
}

/** Definition copy beside an "At a glance" fact box. */
export interface WhatIsSectionContent {
  type: "whatIs";
  title: string;
  paragraphs: string[];
  glance: { label: string; value: string }[];
}

/** Numbered steps in a dark panel. */
export interface StepsSectionContent {
  type: "steps";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  steps: (TitledText & { note?: TitledText })[];
}

/** Grid of short cards, with an optional CTA card or button after it. */
export interface CardsSectionContent {
  type: "cards";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cards: TitledText[];
  /** Highlighted last card with a link. */
  ctaCard?: TitledText & { link: LinkButton };
  /** Button centred under the grid. */
  button?: LinkButton;
}

/** Bordered cards, each with a tinted detail box (e.g. levels with Before/After). */
export interface DetailCardsSectionContent {
  type: "detailCards";
  title: string;
  subtitle?: string;
  items: {
    name: string;
    description: string;
    details: { label: string; text: string }[];
    recommended?: boolean;
  }[];
}

/** Four short cards marked with a check (strengths) or a cross (limits). */
export interface PointCardsSectionContent {
  type: "pointCards";
  tone: "check" | "cross";
  title: string;
  subtitle?: string;
  items: TitledText[];
  /** Line under the cards: `${before}<link>${link.label}</link>${after}`. */
  note?: { before: string; link: LinkButton; after: string };
}

/** This tool against alternatives, with a highlighted last column. */
export interface ComparisonSectionContent {
  type: "comparison";
  title: string;
  subtitle?: string;
  columns: string[];
  highlight: string;
  rows: { label: string; values: string[]; highlight: string }[];
}

/** Dark band with checks and an email + phone quote form. */
export interface CtaBandSectionContent {
  type: "ctaBand";
  tag: string;
  tagline?: string;
  titleStart: string;
  titleAccent?: string;
  checks: string[];
  /** The form's button label. */
  submitLabel: string;
  /** Small print under the form. */
  note: string;
}

export type GuideBlock =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: { lead?: string; text: string }[] }
  | { type: "table"; head: string[]; rows: string[][] }
  /** Highlighted box, with a button when `button` is given. */
  | { type: "callout"; lead?: string; text: string; button?: LinkButton };

/**
 * Long-form guide. On mobile only the blocks up to the first paragraph show
 * until "Read the full guide" is tapped.
 */
export interface GuideSectionContent {
  type: "guide";
  blocks: GuideBlock[];
}

/** Links to related tools and the tools hub. */
export interface MoreToolsSectionContent {
  type: "moreTools";
  title: string;
  subtitle: string;
  items: { name: string; description: string; href: string }[];
  button: LinkButton;
}

export interface FaqSectionContent {
  type: "faq";
  title: string;
  subtitle?: string;
  items: { question: string; answer: string }[];
}

/** Closing band: heading, optional rotated pill, and one or two buttons. */
export interface FinalCtaSectionContent {
  type: "finalCta";
  titleStart: string;
  titlePill?: string;
  titleEnd?: string;
  body: string;
  primary: LinkButton;
  secondary?: LinkButton;
}

export type LandingSection =
  | WhatIsSectionContent
  | StepsSectionContent
  | CardsSectionContent
  | DetailCardsSectionContent
  | PointCardsSectionContent
  | ComparisonSectionContent
  | CtaBandSectionContent
  | GuideSectionContent
  | MoreToolsSectionContent
  | FaqSectionContent
  | FinalCtaSectionContent;

export interface LandingContent {
  /** Name in the breadcrumb, e.g. "CGPA Calculator". */
  toolName: string;
  /** Anchor id of the embedded tool; tool CTAs scroll here. */
  toolAnchorId: string;
  /** Sent with Done-for-you clicks and leads so each page can be told apart. */
  placement: string;

  hero: {
    /** Dark part of the H1, punctuation included. */
    titleLead: string;
    /** Orange part of the H1 that follows on the same line. */
    titleAccent: string;
    subtitle: string;
  };

  /** The sticky mobile bar's two buttons. */
  mobileBar: { tool: LinkButton; expert: LinkButton };

  sections: LandingSection[];
}
