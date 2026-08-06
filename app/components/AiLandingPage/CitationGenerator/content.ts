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
  titleTop: "Make a perfect citation",
  titleAccent: "in seconds",
  subtitle:
    "Paste a DOI, URL, or source details, and the citation generator creates accurate APA, MLA, Harvard, or Chicago references in seconds.",
  steps: ["Choose Style", "Add Source", "Generate Citation"],
  introLine:
    "Make accurate academic citations in seconds with the ScholarlyHelp citation generator. Get properly formatted references in APA, MLA, Chicago, or Harvard for books, websites, journals, and articles, with in-text citations included.",
};

export const useCasesContent: UseCasesContent = {
  title: "Every student has a reference list to build",
  subtitle:
    "Whether you're rushing or planning ahead, this free citation generator helps.",
  cards: [
    {
      icon: "⏰",
      title: "Reference list tonight",
      description:
        "Paste a DOI or URL and generate a correctly formatted citation in seconds.",
    },
    {
      icon: "📚",
      title: "Your literature review",
      description:
        "Build a consistent bibliography without checking every citation rule yourself.",
    },
    {
      icon: "🎓",
      title: "Thesis or dissertation",
      description:
        "Keep every chapter in one citation style from start to finish.",
    },
    {
      icon: "📄",
      title: "A PDF you found online",
      description:
        "Upload a PDF and extract source details instead of typing them yourself.",
    },
    {
      icon: "🔄",
      title: "Changing the style now",
      description:
        "Switch citation styles without creating the same reference again.",
    },
    {
      icon: "✅",
      title: "Checking your own work",
      description:
        "Generate citations as you go and keep your reference list organized.",
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
        "Select APA, MLA, Harvard, or Chicago before adding your source.",
    },
    {
      title: "Pick the source type",
      description: "Pick a book, website, journal, or another source type.",
    },
    {
      title: "Autofill, or type it",
      description:
        "Paste a DOI, URL, or PDF, or enter the details yourself.",
    },
    {
      title: "Save your citations",
      description: "Add your email to save work and unlock your dashboard.",
    },
  ],
  ctaTitleStart: "Want all 16",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "Tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Your free ScholarlyHelp dashboard keeps the citation generator, paraphraser, essay title generator, CGPA calculator, and AI humanizer together.",
  ctaButton: "Explore all tools →",
  ctaHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "Built for accuracy, not guesswork",
  subtitle: "Uses the latest rules for every supported citation style.",
  features: [
    {
      icon: "📚",
      title: "Supports major styles",
      description:
        "Generate citations in APA, MLA, Harvard, and Chicago with just a few clicks.",
    },
    {
      icon: "⚡",
      title: "Autofills source details",
      description:
        "Use a DOI, URL, or PDF to fill citation fields automatically.",
    },
    {
      icon: "🔗",
      title: "Reference and in-text",
      description:
        "Generate both the full reference and matching in-text citation together.",
    },
  ],
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Two ways to handle your citations",
  subtitle:
    "Use the free citation generator yourself, or let our experts build and check your complete reference list.",
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
    heading: "Expert services — Done for you",
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
  body: "The tool works perfectly for individual sources. For a complete bibliography across a dissertation or research paper, ScholarlyHelp editors review every entry for accuracy, formatting, and consistency at any length.",
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
        "I had 40 sources to cite in Chicago style and no idea where to start. I pasted each DOI in and had the whole reference list done in twenty minutes.",
      author: "Rachel M.",
      detail: "History, Boston University — Senior",
    },
    {
      quote:
        "The PDF upload is what sold me. I did not have to retype the title and author from a scanned journal article, since it pulled everything from the file.",
      author: "Devon P.",
      detail: "Sociology, Ohio State — Graduate",
    },
    {
      quote:
        "My professor is strict about APA 7. This got the in-text and the full citation right every time, and it saved me from losing easy marks.",
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
        "Generate citations in APA 7th, MLA 9th, Harvard, and Chicago 17th editions for a wide range of source types.",
    },
    {
      question: "How does autofill find the source details?",
      answer:
        "Paste a DOI or URL, upload a PDF, or search by title to automatically retrieve your source details and generate a citation.",
    },
    {
      question: "What is the difference between the full and in-text citation?",
      answer:
        "The tool generates both your reference list citation and the matching in-text citation in your selected style.",
    },
    {
      question: "What if autofill cannot find my source?",
      answer:
        "Enter the source details manually, and the tool will format your citation correctly in the citation style you choose.",
    },
    {
      question: "What if I need my whole bibliography checked?",
      answer:
        "Our academic experts can review your reference list for accuracy, formatting, and consistency before submission.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "Your",
  titlePill: "reference list",
  titleEnd: "won't format itself.",
  body: "Use the free citation generator to create citations in seconds, or connect with a ScholarlyHelp editor for expert help.",
  primaryButton: "Generate a citation free",
  primaryHref: "#citation-tool",
  secondaryButton: "Talk to an editor →",
  secondaryHref: "/contact-us",
};
