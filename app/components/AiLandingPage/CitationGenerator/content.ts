// Copy for the /tools/citation-generator landing page. Mirrors the structure
// of the AI Paraphraser landing page; all user-facing text lives here so copy
// edits never require touching layout code.

import type { LandingHeroContent } from "@/app/components/AiLandingPage/ToolLanding/LandingHero";
import type { UseCasesContent } from "@/app/components/AiLandingPage/ToolLanding/UseCases";
import type { HowItWorksContent } from "@/app/components/AiLandingPage/ToolLanding/HowItWorks";
import type { WatchVideoContent } from "@/app/components/AiLandingPage/ToolLanding/WatchVideo";
import type { WhyItWorksContent } from "@/app/components/AiLandingPage/ToolLanding/WhyItWorks";
import type { TwoWaysContent } from "@/app/components/AiLandingPage/ToolLanding/TwoWays";
import type { ExpertBannerContent } from "@/app/components/AiLandingPage/ToolLanding/ExpertBanner";
import type { ReviewsContent } from "@/app/components/AiLandingPage/ToolLanding/StudentReviews";
import type { FaqContent } from "@/app/components/AiLandingPage/ToolLanding/LandingFaq";
import type { FooterCtaContent } from "@/app/components/AiLandingPage/ToolLanding/FooterCta";

export const heroContent: LandingHeroContent = {
  badge: "3,190 students used this tool this week",
  titleTop: "Make Citations in Seconds with",
  titleAccent: "Our Citation Generator",
  subtitle:
    "Paste a DOI, URL, or source details, and our free citation generator creates accurate APA, MLA, Harvard, or Chicago references in seconds, with in-text citations included.",
  steps: ["Choose style", "Add source", "Generate citation"],
  introLine:
    "Make accurate academic citations in seconds with the ScholarlyHelp citation generator. Get properly formatted references in APA, MLA, Chicago, or Harvard for books, websites, journals, and articles with in-text citations included.",
};

export const useCasesContent: UseCasesContent = {
  title: "Every student has a reference list to build",
  subtitle:
    "Whether you are rushing or planning, this free citation generator handles every source type in seconds.",
  cards: [
    {
      icon: "⏰",
      title: "Reference list due tonight",
      description:
        "Paste a DOI or URL and get a correctly formatted citation in seconds, without checking style rules yourself.",
    },
    {
      icon: "📚",
      title: "Your literature review",
      description:
        "Use the APA citation generator to create a consistent bibliography without checking formatting rules for every source.",
    },
    {
      icon: "🎓",
      title: "Thesis or dissertation",
      description:
        "Keep every chapter consistent with the Chicago style citation generator for footnotes and bibliography entries from start to finish.",
    },
    {
      icon: "📄",
      title: "A PDF you found online",
      description:
        "Upload a PDF and let the tool extract author, title, date, and journal details without retyping every source field.",
    },
    {
      icon: "🔄",
      title: "Switching citation styles",
      description:
        "Need MLA instead of APA? The free MLA citation generator reformats your references without rebuilding the list from scratch.",
    },
    {
      icon: "✅",
      title: "Checking your own work",
      description:
        "Generate citations as you write with our citation generator; keep every entry organised before your final submission.",
    },
  ],
};

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "From source to citation in 4 steps",
  steps: [
    {
      title: "Choose a style first",
      description:
        "Select APA, MLA, Harvard, or Chicago from the dropdown before adding your source to begin creating your citation.",
    },
    {
      title: "Pick the source type",
      description:
        "Choose a book, website, journal, or another source type; the tool adjusts the required fields automatically.",
    },
    {
      title: "Autofill or type it",
      description:
        "Add a DOI, URL, or PDF and let the citation generator fill in the source details, or enter them manually.",
    },
    {
      title: "Save your citations",
      description:
        "Add your email to save your work and unlock your free ScholarlyHelp dashboard, with every citation stored and organised by project.",
    },
  ],
  ctaTitleStart: "Want all",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Your free ScholarlyHelp dashboard keeps the citation generator, paraphraser, essay studio, CGPA calculator, and AI humanizer together.",
  ctaButton: "Explore all tools →",
  ctaHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "Built for accuracy, not guesswork",
  subtitle:
    "Uses the latest official rules for every supported style so your references are always correct.",
  features: [
    {
      icon: "📚",
      title: "Supports every major style",
      description:
        "Covers APA citation generator, MLA citation generator, Harvard, and Chicago four major styles used across universities worldwide.",
    },
    {
      icon: "⚡",
      title: "Auto-fills source details",
      description:
        "Paste a DOI, URL, or PDF and the tool fills every citation field automatically, so you do not need to type anything.",
    },
    {
      icon: "🔗",
      title: "Reference and in-text together",
      description:
        "Every output includes both the full reference entry and matching in-text citation, ready to copy directly into your academic paper.",
    },
  ],
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Two ways to handle your citations",
  subtitle:
    "Use the free citation generator yourself for quick references, or let our experts build and check your complete reference list.",
  freeColumn: {
    heading: "Free tool, do it yourself",
    sub: "Easy to start.",
    steps: [
      {
        title: "Choose your style",
        description:
          "Select APA, MLA, Harvard, or Chicago before choosing your source type.",
      },
      {
        title: "Add your source",
        description:
          "Paste a DOI, URL, upload a PDF, or enter the source details yourself.",
      },
      {
        title: "Generate citations",
        description:
          "Create both your reference entry and matching in-text citation instantly.",
      },
      {
        title: "Copy and use it",
        description:
          "Copy your finished citation and paste it straight into your reference list.",
      },
    ],
  },
  expertColumn: {
    heading: "Expert services, done for you",
    sub: "Get a free quote in 2 minutes →",
    steps: [
      {
        title: "Send us your brief",
        description:
          "Tell us your subject, deadline, and the citation style your instructor requires.",
      },
      {
        title: "Get an expert match",
        description:
          "Your work is matched with an academic editor familiar with your required style.",
      },
      {
        title: "Track the progress now",
        description:
          "Follow the work and message your editor whenever you need an update.",
      },
      {
        title: "Receive and review now",
        description:
          "Receive your completed work and request free revisions until you're satisfied.",
      },
    ],
  },
};

export const watchVideoContent: WatchVideoContent = {
  eyebrow: "Watch video",
  title: "Generate complete citations instantly",
  // https://youtu.be/EcfUz3V5dgs
  youtubeEmbedUrl: "https://www.youtube.com/embed/EcfUz3V5dgs",
};

export const expertBannerContent: ExpertBannerContent = {
  tag: "Got 50+ sources to cite?",
  title: "Get a real editor to check your whole bibliography",
  body: "The free citation generator works perfectly for individual sources. For a complete bibliography across a dissertation or research paper, our editors can review every entry using a citation generator for APA, MLA citation generator, or Chicago-style citation generator for accuracy, formatting, and consistency.",
  perks: [
    "Any length, no source limit",
    "Every style covered",
    "Checked for consistency",
    "Any deadline",
    "Money-back guarantee",
  ],
  button: "Get expert help →",
  buttonHref: "/order",
};

export const reviewsContent: ReviewsContent = {
  eyebrow: "Student reviews",
  title: "What students say about this tool",
  ratingLine: "Rated 4.6/5 Based on 1000+ Reviews",
  reviews: [
    {
      quote:
        "I had 40 sources to cite and no idea where to start. I used the Chicago citation generator mode, pasted each DOI, and had the whole reference list done in twenty minutes.",
      author: "Rachel M.",
      detail: "History, Boston University — Senior",
    },
    {
      quote:
        "The PDF upload is what sold me. I did not have to retype the title and author from a scanned journal article — the citation generator pulled everything from the file.",
      author: "Devon P.",
      detail: "Sociology, Ohio State — Graduate",
    },
    {
      quote:
        "My professor is strict about APA 7. The APA format citation generator got the in-text and the full citation right every time, and it saved me from losing easy marks.",
      author: "Amara N.",
      detail: "Nursing, Indiana — Junior",
    },
  ],
};

export const faqContent: FaqContent = {
  title: "Frequently Asked Questions",
  subtitle: "FAQ — Common questions about this tool",
  items: [
    {
      question: "Is this citation generator really free?",
      answer:
        "Yes! ScholarlyHelp's Citation Generator is 100% free to use. Create citations in seconds.",
    },
    {
      question: "Which citation styles are supported?",
      answer:
        "The tool supports APA citation generator, MLA citation generator, Harvard, and Chicago citation generators four widely used academic styles.",
    },
    {
      question: "How does autofill find the source details?",
      answer:
        "Paste a DOI or URL, upload a PDF, or search by title. Our AI citation generator retrieves your source details automatically and formats the citation instantly.",
    },
    {
      question: "Can I create both full and in-text citations?",
      answer:
        "Yes. A full citation gives all the source details in your reference list, while an in-text citation briefly identifies the source in your paper. Our citation generator supports APA, Chicago, and MLA format citation generator options for creating both.",
    },
    {
      question: "What if autofill cannot find my source?",
      answer:
        "Enter the source details manually, and the tool formats your citation correctly. Manual entry works with the citation generator MLA, APA, Harvard, and Chicago modes.",
    },
    {
      question: "What if I need my whole bibliography checked?",
      answer:
        "Our academic experts review your complete reference list, whether created with the free citation generator or another tool, for accuracy, formatting, and consistency before submission.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "Your",
  titlePill: "reference list",
  titleEnd: "won't format itself.",
  body: "Use the free citation generator to create citations in seconds, or connect with a ScholarlyHelp editor for expert help.",
  primaryButton: "Generate a citation for free",
  primaryHref: "#citation-tool",
  secondaryButton: "Talk to an editor →",
  secondaryHref: "/contact-us",
};
