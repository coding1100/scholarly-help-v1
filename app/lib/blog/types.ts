// Shared blog types. Stored in the `scholarly_help` database, `blog_*` collections.

export type PostStatus = "draft" | "published";

export type FeatureIcon =
  | "star"
  | "check"
  | "clock"
  | "book"
  | "target"
  | "shield"
  | "lightbulb"
  | "chart";

export type BlogBlock =
  | { id: string; type: "richText"; html: string }
  | { id: string; type: "image"; url: string; alt: string; caption?: string }
  | {
      id: string;
      type: "featureGrid";
      title?: string;
      items: { icon: FeatureIcon; title: string; text: string }[];
    }
  | {
      id: string;
      type: "cta";
      heading: string;
      text?: string;
      bullets?: string[];
      buttonLabel: string;
      buttonUrl: string;
    }
  | { id: string; type: "linkCards"; items: { imageUrl: string; title: string; url: string }[] }
  | { id: string; type: "stats" } // renders the stats strip configured in blog settings
  | { id: string; type: "video"; url: string }
  | { id: string; type: "faq"; title?: string; items: { question: string; answer: string }[] };

export type BlogBlockType = BlogBlock["type"];

export type HeroCta = {
  heading: string;
  text?: string;
  buttonLabel: string;
  buttonUrl: string;
};

export type PostSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: PostStatus;
  publishAt: string | null; // ISO date; post is live once status is published and publishAt <= now
  categoryId: string | null;
  tagIds: string[];
  authorId: string | null;
  coverImage: { url: string; alt: string } | null;
  heroVideoUrl?: string;
  heroCta?: HeroCta | null;
  finalCta?: HeroCta | null;
  blocks: BlogBlock[];
  seo: PostSeo;
  commentsEnabled: boolean;
  /** Real views counted by this site (one per visitor session; admins and bots excluded). */
  views: number;
  /** View count carried over from WordPress; added to `views` only for the public counter. */
  importedViews?: number;
  leadForms?: PostLeadForms;
  wpId?: number; // set by the WordPress migration, used to re-sync idempotently
  createdAt: string;
  updatedAt: string;
};

export type BlogTerm = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type BlogAuthor = BlogTerm & { avatarUrl?: string; bio?: string };

export type TermKind = "categories" | "tags" | "authors";

export type CommentStatus = "pending" | "approved" | "spam";

export type BlogComment = {
  _id: string;
  postId: string;
  name: string;
  email: string;
  body: string;
  status: CommentStatus;
  ipHash: string;
  createdAt: string;
};

export type StatsStrip = { enabled: boolean; items: { value: string; label: string }[] };

export type HelpBox = {
  enabled: boolean;
  heading: string;
  text: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
};

/** Text of one blog lead form; `highlight` is the part of the heading shown in orange. */
export type LeadFormContent = {
  heading: string;
  highlight: string;
  text: string;
  buttonLabel: string;
  note: string;
};

export type LeadFormPosition = "inline" | "sidebar";

export type LeadForms = { enabled: boolean } & Record<LeadFormPosition, LeadFormContent>;

/** Per-post lead form options; empty override fields fall back to the blog settings. */
export type PostLeadForms = {
  hidden?: boolean;
  inline?: Partial<LeadFormContent>;
  sidebar?: Partial<LeadFormContent>;
};

export type BlogSettings = {
  commentsEnabled: boolean;
  indexTitle: string;
  indexIntro: string[];
  indexImageUrl: string;
  /** Shown wherever a post has a "stats" block. */
  statsStrip: StatsStrip;
  /** Shown at the end of every article. */
  helpBox: HelpBox;
  /** Email + phone forms in the article (inline) and the sidebar; leads go to GHL, email and the sheet. */
  leadForms: LeadForms;
};

export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  commentsEnabled: false,
  indexTitle: "Scholarly Help Blogs",
  indexIntro: [
    "Need help with school or college? Our blog is here for you. Find quick tips, clear guides, and honest advice to make your academic journey easier.",
    "Our posts are written by experienced educators and professionals. No confusing jargon—just straightforward ideas you can use right away. From time-saving hacks to real student success stories, we cover what matters most.",
  ],
  indexImageUrl: "",
  statsStrip: {
    enabled: true,
    items: [
      { value: "95%", label: "Success Rate" },
      { value: "10K+", label: "Students Helped" },
      { value: "500+", label: "Expert Writers" },
      { value: "24/7", label: "Support Available" },
      { value: "A+", label: "Grade Guarantee" },
      { value: "100%", label: "Confidential" },
    ],
  },
  helpBox: {
    enabled: true,
    heading: "Need Professional Help with Your Research?",
    text: "Our team of PhD-qualified experts is ready to guide you through every stage of your academic journey. From topic selection to final submission, we provide personalized support that ensures excellence.",
    primaryLabel: "Get Started Today",
    primaryUrl: "/order/",
    secondaryLabel: "View Our Services",
    secondaryUrl: "/academic-research/",
  },
  // Posts get their own heading and text from the "Blog Form Copy" sheet
  // (scripts/blog-lead-copy); this text covers posts without a row. The button text
  // is the same on every post and comes from here (or Blog Settings once saved).
  leadForms: {
    enabled: true,
    inline: {
      heading: "Need help with a tough subject?",
      highlight: "tough subject?",
      text: "Get matched with a tutor for the topics you find hardest. Connect with a tutor or academic support specialist for a one-on-one session.",
      buttonLabel: "SECURE MY \"A\" OR \"B\" GRADES",
      note: "Free Inquiry · No Card Required · Reply in 15 Minutes",
    },
    sidebar: {
      heading: "Need help with a tough subject?",
      highlight: "tough subject?",
      text: "Get matched with a tutor for the topics you find hardest.",
      buttonLabel: "SECURE MY \"A\" OR \"B\" GRADES",
      note: "Free Inquiry · Reply in 15 Minutes",
    },
  },
};
