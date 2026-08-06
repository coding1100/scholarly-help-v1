// Copy for the /tools/research-question-generator landing page. Mirrors the
// structure of the other tool landing pages; all user-facing text lives here
// so copy edits never require touching layout code.

import type { LandingHeroContent } from "@/app/components/AiLandingPage/ToolLanding/LandingHero";
import type { UseCasesContent } from "@/app/components/AiLandingPage/ToolLanding/UseCases";
import type { HowItWorksContent } from "@/app/components/AiLandingPage/ToolLanding/HowItWorks";
import type { WatchVideoContent } from "@/app/components/AiLandingPage/ToolLanding/WatchVideo";
import type { WhyItWorksContent } from "@/app/components/AiLandingPage/ToolLanding/WhyItWorks";
import type { TwoWaysContent } from "@/app/components/AiLandingPage/ToolLanding/TwoWays";
import type { ReviewsContent } from "@/app/components/AiLandingPage/ToolLanding/StudentReviews";
import type { FaqContent } from "@/app/components/AiLandingPage/ToolLanding/LandingFaq";
import type { FooterCtaContent } from "@/app/components/AiLandingPage/ToolLanding/FooterCta";

export const heroContent: LandingHeroContent = {
  badge: "3,241 students used this tool this week",
  titleTop: "Create a strong research question",
  titleAccent: "in seconds",
  subtitle:
    "Enter your topic and get focused, academically sound research questions ready for your paper",
  steps: ["Enter Topic", "See Results", "Open Dashboard"],
};

export const useCasesContent: UseCasesContent = {
  title: "An AI research question for every situation.",
  subtitle: "Start stronger. Research smarter. Write with confidence.",
  cards: [
    {
      icon: "⏰",
      title: "Deadline is tonight",
      description:
        "Generate a focused research question in seconds and get your research started faster.",
    },
    {
      icon: "🔍",
      title: "Starting your research",
      description:
        "Enter your topic and generate research questions that match your subject and assignment.",
    },
    {
      icon: "💡",
      title: "Need fresh ideas",
      description:
        "Generate multiple research questions and choose the one that best fits your study.",
    },
    {
      icon: "🧪",
      title: "Choosing a method",
      description:
        "Generate broad, focused, hypothesis-driven, or policy-oriented questions for your topic.",
    },
    {
      icon: "🌐",
      title: "Writing in English",
      description:
        "Generate clear academic research questions that are easy to understand and refine.",
    },
    {
      icon: "📋",
      title: "Planning your paper",
      description:
        "Start with a focused research question to build a stronger and more organised paper.",
    },
  ],
};

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "From a blank page to a research question in 4 steps",
  steps: [
    {
      title: "Enter your topic",
      description:
        "Type your topic in a sentence or two. It does not have to be narrow yet.",
    },
    {
      title: "Set your preferences",
      description:
        "Choose your research type, question style, and level of specificity.",
    },
    {
      title: "Generate questions",
      description:
        "Generate research questions tailored to your topic and chosen preferences.",
    },
    {
      title: "Unlock your dashboard",
      description:
        "Sign up free to save your work in your ScholarlyHelp dashboard.",
    },
  ],
  ctaTitleStart: "Want all",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "Tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Keep your results, revisit past work, and reach every tool from one dashboard: essay generator, thesis builder, citation tool, and humanizer.",
  ctaButton: "Explore all tools in dashboard →",
  ctaHref: "/tools/dashboard",
  ctaSecondaryButton: "See what is included",
  ctaSecondaryHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "Not just topics — focused research questions",
  subtitle:
    "Generate focused research questions designed to match your topic and methodology.",
  features: [
    {
      icon: "🧭",
      title: "Matched to your method",
      description:
        "Built for qualitative, experimental, case study, policy analysis, and many other research approaches.",
    },
    {
      icon: "🎯",
      title: "Fits your topic",
      description:
        "Adjust the level of detail to match your topic, assignment, or research project.",
    },
    {
      icon: "📄",
      title: "Ready to copy",
      description:
        "Every question comes out clean, so you can paste it into your draft without editing it first.",
    },
  ],
};

export const watchVideoContent: WatchVideoContent = {
  eyebrow: "See it in action",
  title: "Craft precise research questions instantly",
  // https://youtu.be/BvD-NEG6NMo
  youtubeEmbedUrl: "https://www.youtube.com/embed/BvD-NEG6NMo",
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Two ways to get help",
  subtitle:
    "Work through the free tools yourself, or hand the whole task to our writers.",
  freeColumn: {
    heading: "Free tools, do it yourself",
    sub: "Easy to start.",
    steps: [
      {
        title: "Enter your topic",
        description:
          "Type your research topic or assignment details to generate focused research questions.",
      },
      {
        title: "Set the options",
        description:
          "Choose your research type, then set the style and the level of specificity.",
      },
      {
        title: "Use your question",
        description:
          "Choose a research question and use it as the foundation for your research project.",
      },
      {
        title: "Save and continue",
        description:
          "Sign up for free to save your results and continue working from your personalised dashboard.",
      },
    ],
  },
  expertColumn: {
    heading: "Expert services — Done for you",
    sub: "A free quote in about two minutes →",
    steps: [
      {
        title: "Share the brief now",
        description:
          "Tell us your subject, assignment, deadline, and any instructions from your professor.",
      },
      {
        title: "Matched to an expert",
        description:
          "We match you with a subject specialist who works at exactly the right academic level.",
      },
      {
        title: "Follow the progress",
        description:
          "Message your writer, ask questions, and track the progress as your paper takes shape.",
      },
      {
        title: "Review and receive!",
        description:
          "Receive your completed paper, review it all, and request free revisions where needed.",
      },
    ],
  },
};

export const reviewsContent: ReviewsContent = {
  eyebrow: "Student reviews",
  title: "What students say about this tool",
  ratingLine: "Rated 4.6/5 Based on 1000+ Reviews",
  reviews: [
    {
      quote:
        "My paper was due at eight in the morning and it was already midnight. I got a question I could actually explain to my professor, and I handed it in with time left over.",
      author: "Tyler K.",
      detail: "Psychology, Ohio State — 3rd year",
    },
    {
      quote:
        "I settle the directions here first, then write the paper myself. My marks have improved because I start from something focused instead of wandering around a broad topic.",
      author: "Nina P.",
      detail: "Nursing, University of Michigan — Final year",
    },
    {
      quote:
        "Seeing how a proper academic question is built for my own subject has taught me more than any textbook did. I pick up something new from nearly every set.",
      author: "Yuki L.",
      detail: "Business Management, Purdue — MSc",
    },
  ],
};

export const faqContent: FaqContent = {
  title: "Frequently Asked Questions",
  subtitle: "FAQ — Common questions about this tool",
  items: [
    {
      question: "Is this tool really free?",
      answer:
        "Yes. Generate research questions for free with no payment required. Sign up for a free ScholarlyHelp account to save your work and access it anytime.",
    },
    {
      question: "Which research types are supported?",
      answer:
        "Supports 15 research types, including qualitative, quantitative, mixed methods, case studies, surveys, experiments, policy analysis, and more.",
    },
    {
      question: "What question types can it generate?",
      answer:
        "Generate broad, focused, hypothesis-driven, or policy-oriented research questions to match your topic and assignment requirements.",
    },
    {
      question: "Can I use it for a thesis?",
      answer:
        "Yes. The generated questions can be used as a starting point for research papers, dissertations, theses, proposals, and other academic projects.",
    },
    {
      question: "What if I need the full paper?",
      answer:
        "ScholarlyHelp also offers professional academic writing services, including research, writing, editing, citations, and formatting for assignments of all sizes.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "Your paper",
  titlePill: "deadline",
  titleEnd: "will not wait.",
  body: "Begin with a free tool in half a minute, or speak to a writer today.",
  primaryButton: "Generate my question free",
  primaryHref: "#research-question-tool",
  secondaryButton: "Talk to an expert →",
  secondaryHref: "/contact-us",
  footnote: "Easy to use · Money-back guarantee on services",
};
