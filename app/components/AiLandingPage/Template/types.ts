import type { LandingPageKey } from "./landingPages";

/**
 * Content for one tool landing page built on LandingTemplate. Every page
 * shares the template's layout; only this copy differs. Optional sections are
 * left out of the page when a tool has nothing to say for them.
 */

export interface TitledText {
  title: string;
  description: string;
}

export interface LandingContent {
  /** Name in the breadcrumb, e.g. "AI Humanizer". */
  toolName: string;
  /** Anchor id of the embedded tool; tool CTAs scroll here. */
  toolAnchorId: string;
  /** Sent with clicks and leads so each landing page can be told apart. */
  placement: string;

  hero: {
    /** Dark part of the H1, punctuation included, e.g. "Free AI Humanizer:". */
    titleLead: string;
    /** Orange part of the H1 that follows on the same line. */
    titleAccent: string;
    subtitle: string;
  };

  /** Labels for the page's two calls to action. */
  cta: {
    /** Goes to the expert band, e.g. "Get expert help". */
    expert: string;
    /** Scrolls to the tool, e.g. "Humanize my text free". */
    tool: string;
    /** Short tool label for the mobile sticky bar, e.g. "Humanize free". */
    toolShort: string;
  };

  whatIs?: {
    title: string;
    paragraphs: string[];
    glance: { label: string; value: string }[];
  };

  /** Modes or levels the tool offers, each with a before/after sample. */
  levels?: {
    title: string;
    subtitle: string;
    items: {
      name: string;
      description: string;
      before: string;
      after: string;
      recommended?: boolean;
    }[];
  };

  useCases: {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** Five cards; the sixth slot is the CTA card. */
    cards: TitledText[];
    ctaCard: TitledText;
  };

  examples?: {
    title: string;
    subtitle: string;
    items: { title: string; before: string; after: string }[];
  };

  howItWorks: {
    eyebrow: string;
    title: string;
    steps: TitledText[];
  };

  comparison?: {
    title: string;
    subtitle: string;
    /** This tool and two alternatives. */
    columns: [string, string, string];
    /** The highlighted last column, the done-for-you option. */
    highlight: string;
    rows: {
      label: string;
      values: [string, string, string];
      highlight: string;
      /** Link text appended to the highlight cell, pointing at the expert band. */
      highlightLink?: string;
    }[];
  };

  limits?: {
    title: string;
    subtitle: string;
    items: TitledText[];
    /** Line under the cards: `${before}<link>${linkLabel}</link>${after}`. */
    note?: { before: string; linkLabel: string; after: string };
  };

  expertBand: {
    tag: string;
    tagline: string;
    titleStart: string;
    titleAccent: string;
    checks: string[];
    /** Small print under the form, e.g. "Free quote in 2 min". */
    note: string;
    /** Rating line shown after five stars, e.g. "Rated 4.6/5 by students". */
    rating?: string;
  };

  guide?: {
    title: string;
    /** First paragraph; the only one shown on mobile until expanded. */
    intro: string;
    sections: {
      heading: string;
      body?: string;
      steps?: { lead: string; text: string }[];
      /** Highlighted box with a CTA to the expert band, after the section. */
      callout?: { lead: string; text: string };
    }[];
  };

  /** Four related landing pages for "More free writing tools". */
  related: LandingPageKey[];

  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };

  finalCta: {
    titleStart: string;
    /** Rotated pill after titleStart. */
    titlePill: string;
    /** Optional words after the pill. */
    titleEnd?: string;
    body: string;
  };
}
