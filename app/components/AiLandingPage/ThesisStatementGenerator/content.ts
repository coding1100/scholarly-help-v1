// Copy for the /tools/ai-thesis-statement-generator landing page. Mirrors the
// structure of the other tool landing pages; all user-facing text lives here so
// copy edits never require touching layout code.

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
  badge: "2,847 students used this tool this week",
  titleTop: "Generate a strong thesis",
  titleAccent: "in seconds",
  subtitle:
    "Turn broad essay ideas into focused, high-impact thesis statements tailored to your paper.",
  steps: ["Enter Topic & Details", "Choose Thesis Style", "Save to Dashboard"],
};

export const useCasesContent: UseCasesContent = {
  title: "Every student needs a strong thesis",
  subtitle:
    "Whether you’re starting or stuck halfway, this thesis generator gets you moving again.",
  cards: [
    {
      icon: "✍️",
      title: "Starting your essay",
      description:
        "Turn your raw topic into a clear thesis statement and start writing with confidence.",
    },
    {
      icon: "🎓",
      title: "Academic standards",
      description:
        "Draft academic thesis statements that sound natural and match university standards.",
    },
    {
      icon: "💪",
      title: "Need stronger arguments?",
      description:
        "Draft a sharp claim that presents a clear argument backed by evidence.",
    },
    {
      icon: "🔧",
      title: "Improving your thesis",
      description:
        "Rewrite a weak thesis into a stronger statement that better supports your assignment.",
    },
    {
      icon: "📖",
      title: "Writing a dissertation",
      description:
        "Formulate a clear research thesis before you begin writing chapters or your introduction.",
    },
    {
      icon: "⚖️",
      title: "Different essay formats",
      description:
        "Instantly compare analytical, argumentative, and comparative angles for your topic.",
    },
  ],
};

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "Create a thesis statement in four simple steps",
  steps: [
    {
      title: "Enter topic & details",
      description:
        "Enter your thesis topic and add key details to customize your generated draft.",
    },
    {
      title: "Generate thesis options",
      description:
        "Receive analytical, argumentative, and comparative thesis statements in seconds.",
    },
    {
      title: "Select your best option",
      description:
        "Review all generated options and pick the statement that fits your paper best.",
    },
    {
      title: "Copy or save to dashboard",
      description:
        "Copy your top thesis directly or save all generated statements to your dashboard.",
    },
  ],
  ctaTitleStart: "Want all",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "Tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Your free ScholarlyHelp dashboard keeps the thesis generator, paraphraser, outline tool, AI humanizer, and citation generator in one place.",
  ctaButton: "Explore all tools →",
  ctaHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "Not just a template — a real thesis builder",
  subtitle:
    "Every thesis is generated from your topic to help you start writing with confidence.",
  features: [
    {
      icon: "🎯",
      title: "Thesis Styles",
      description:
        "Generate analytical, argumentative, and comparative thesis statements from one topic.",
    },
    {
      icon: "⚡",
      title: "Fast Results",
      description:
        "Create multiple thesis statements in seconds and choose the one that fits your assignment.",
    },
    {
      icon: "🎓",
      title: "Academic Language",
      description:
        "Generate clear, focused thesis statements written in natural academic English.",
    },
  ],
};

export const watchVideoContent: WatchVideoContent = {
  eyebrow: "See it in action",
  title: "How to Generate a Strong Thesis Statement Instantly",
  // Video link pending — the section stays hidden until this URL is set.
  youtubeEmbedUrl: "https://www.youtube.com/embed/qK17je_unAI",
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Two ways to strengthen your writing",
  subtitle:
    "Use the free AI thesis generator yourself, or let our writers take it from here.",
  freeColumn: {
    heading: "Free tool, do it yourself",
    sub: "Easy to start.",
    steps: [
      {
        title: "Enter your topic",
        description:
          "Add your essay topic along with key details to shape your thesis statement output.",
      },
      {
        title: "Generate instantly",
        description:
          "Create your thesis statement in seconds and see the results immediately.",
      },
      {
        title: "Choose and write",
        description:
          "Pick the thesis that fits your assignment and build the rest of your essay around it.",
      },
      {
        title: "Save your work",
        description:
          "Sign up for free to access thesis statements wherever you want in your ScholarlyHelp dashboard.",
      },
    ],
  },
  expertColumn: {
    heading: "Expert services, done for you",
    sub: "Get a free quote in 2 minutes →",
    steps: [
      {
        title: "Share your brief",
        description:
          "Share your topic, essay type, deadline, and any specific assignment guidelines.",
      },
      {
        title: "Matched to a writer",
        description:
          "We pair you with a subject specialist who writes your thesis and paper from scratch.",
      },
      {
        title: "Track your order",
        description:
          "Message your writer directly and receive updates throughout the writing process.",
      },
      {
        title: "Receive your paper",
        description:
          "Download your completed paper and request free revisions until you're satisfied.",
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
        "I had my topic but no idea how to turn it into a proper thesis. This gave me three versions in seconds, and the argumentative one was exactly what my professor wanted. It saved me an hour of staring at nothing.",
      author: "Aisha J.",
      detail: "Political Science, NYU — Sophomore",
    },
    {
      quote:
        "I write in English as a second language, and making a thesis sound academic was always hard for me. What this gives me is far better than what I write alone, so I start with it every time.",
      author: "Min K.",
      detail: "Economics, University of Chicago — MSc",
    },
    {
      quote:
        "I had rewritten my intro three times and the thesis still felt weak. I put my topic in here, and the comparative version changed how I framed my whole argument. My grade went from a B+ to an A-.",
      author: "Ryan C.",
      detail: "History, UCLA — Junior",
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
        "Yes. Generate thesis statements for free. Sign up for a free ScholarlyHelp account to save your work and access it anytime.",
    },
    {
      question: "What's the difference between the 3 thesis types?",
      answer:
        "Analytical explores a topic, argumentative supports a position, and comparative examines similarities and differences.",
    },
    {
      question: "Can I use this for any subject?",
      answer:
        "Yes. It works across academic subjects by generating thesis statements from the topic you enter.",
    },
    {
      question: "Will my professor know it was AI-generated?",
      answer:
        "Use the generated thesis as a starting point, then tailor it to your ideas and assignment. You can also refine it with our AI Humanizer.",
    },
    {
      question: "What if I need the whole essay written?",
      answer:
        "ScholarlyHelp also offers professional academic writing services, including research, writing, editing, citations, and formatting for essays of any length.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "Your intro gets easier once you have the",
  titlePill: "thesis.",
  titleEnd: "",
  body: "Get yours free with our thesis statement generator, or have a ScholarlyHelp expert write the whole paper.",
  primaryButton: "Generate my thesis free",
  primaryHref: "#thesis-tool",
  secondaryButton: "Talk to an expert →",
  secondaryHref: "/contact-us",
};
