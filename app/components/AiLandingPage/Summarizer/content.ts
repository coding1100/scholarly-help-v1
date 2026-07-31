// Copy for the /tools/ai-summarizer landing page. Mirrors the structure of the
// other tool landing pages; all user-facing text lives here so copy edits never
// require touching layout code.

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
  badge: "3,104 students used this tool this week",
  titleTop: "Get your AI summaries within seconds,",
  titleAccent: "for free",
  subtitle:
    "Paste your text or upload a document, and let our AI Summarizer instantly turn it into paragraphs, bullet points, study notes, flashcards, slide decks, or audio summaries.",
  steps: ["Paste or Upload", "Choose Detail & Format", "Get Your Summary"],
};

export const useCasesContent: UseCasesContent = {
  title: "A tool for every kind of reading",
  subtitle:
    "From journal articles to lecture notes, this AI summarizer helps you study faster.",
  cards: [
    {
      icon: "📚",
      title: "Reading due tomorrow",
      description:
        "Fifty pages to read, and bullet points help you get through them faster.",
    },
    {
      icon: "🎴",
      title: "Revising for exams",
      description:
        "Long notes to revise, and flashcards help you remember the important ideas.",
    },
    {
      icon: "🔍",
      title: "Researching sources",
      description:
        "A long research paper, and a brief summary shows the key points.",
    },
    {
      icon: "📝",
      title: "Lecture notes everywhere",
      description:
        "Turn lecture slides and class notes into organised summaries you can review.",
    },
    {
      icon: "📊",
      title: "Presentation due soon",
      description:
        "Too much content to organise, and a slide deck turns it into clear presentation points.",
    },
    {
      icon: "🎧",
      title: "Don’t like reading?",
      description:
        "Turn boring readings into audio summaries and listen anywhere, anytime.",
    },
  ],
};

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "Summarise any text in four simple steps",
  steps: [
    {
      title: "Add your content",
      description:
        "Paste your text or upload a document to get started.",
    },
    {
      title: "Choose detail level",
      description:
        "Choose Brief, Standard, or Comprehensive to control how much detail is included.",
    },
    {
      title: "Choose your format",
      description:
        "Select Text, Flashcards, Slide Deck, or Audio to get your summary your way.",
    },
    {
      title: "Copy or save",
      description:
        "Copy your summary instantly, or sign up for free to save it in your dashboard.",
    },
  ],
  ctaTitleStart: "Want all",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "Tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Your free ScholarlyHelp dashboard keeps the summarizer, paraphraser, essay title generator, AI humanizer, and citation tool ready in one place.",
  ctaButton: "Explore all tools →",
  ctaHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "It finds the point, not just short lines",
  subtitle: "It keeps the meaning, not just fewer words.",
  features: [
    {
      icon: "🎛️",
      title: "Multiple Formats",
      description:
        "Get your summary as text, flashcards, study notes, slide deck, or audio.",
    },
    {
      icon: "🔎",
      title: "Detail Levels",
      description:
        "Choose Brief, Standard, or Comprehensive based on how much detail you need.",
    },
    {
      icon: "📋",
      title: "One-Click Copy",
      description:
        "Copy your summary instantly or save it to your free dashboard for revision.",
    },
  ],
};

export const watchVideoContent: WatchVideoContent = {
  eyebrow: "See it in action",
  title:
    "How to Summarize Articles in Seconds (Free ScholarlyHelp AI Summarizer)",
  youtubeEmbedUrl: "https://www.youtube.com/embed/B_tZrhOdFyU",
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Do it yourself, or let us do it",
  subtitle:
    "Handle it with our free AI summarizer, or pass the job to our writers.",
  freeColumn: {
    heading: "Free tool, do it yourself",
    sub: "Easy to start.",
    steps: [
      {
        title: "Paste or upload your materials",
        description:
          "Paste the content you want to summarise and start in seconds.",
      },
      {
        title: "Choose your style",
        description:
          "Select the summary format and detail level that best suits your study needs.",
      },
      {
        title: "Generate summary",
        description:
          "Receive a clear summary in seconds, ready to read, copy, or review.",
      },
      {
        title: "Save and study",
        description:
          "Copy your summary or save it in your dashboard for future revision.",
      },
    ],
  },
  expertColumn: {
    heading: "Expert services, done for you",
    steps: [
      {
        title: "Give us the brief",
        description:
          "Tell us your assignment, subject, word count, and deadline.",
      },
      {
        title: "Matched to a writer",
        description:
          "We pair you with a subject specialist working at your academic level.",
      },
      {
        title: "Track it live",
        description:
          "Message your writer directly and receive updates throughout the project.",
      },
      {
        title: "Get it and review",
        description:
          "Download your completed work with free revisions included as standard.",
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
        "I had five chapters to get through the night before an exam. I ran each one through this and studied the summaries instead. I still passed, and honestly I don't think I'd have finished otherwise.",
      author: "James K.",
      detail: "Business, University of Michigan — Junior",
    },
    {
      quote:
        "I use it to get through my reading list. I skim the summary first, and if the paper looks useful I go read the whole thing. It saves me hours every single week.",
      author: "Sofia F.",
      detail: "Psychology, Ohio State — First year",
    },
    {
      quote:
        "English is my second language, so long academic papers take me a while. A short summary shows me the main idea first, and then the full text is much easier to follow.",
      author: "Taki K.",
      detail: "Computer Science, Indiana — MSc",
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
        "Yes. The AI Summarizer is free to use. Sign up for a free ScholarlyHelp account to save your work and access it anytime.",
    },
    {
      question: "What's the word limit?",
      answer:
        "You can summarise up to 20,000 words at a time. If you need help with longer documents, ScholarlyHelp's academic writing service can assist with papers of any length.",
    },
    {
      question: "Can I choose the summary style and format?",
      answer:
        "Yes! First, choose your detail level: Brief, Standard, or Comprehensive. Then, pick your preferred output format: Text, Flashcards, Study Notes, Slide Deck, or Audio—or generate all formats at once.",
    },
    {
      question: "Will it change the meaning of my text?",
      answer:
        "No. The summarizer keeps the original meaning while reducing unnecessary detail, making the content quicker and easier to review.",
    },
    {
      question: "What if I need the whole assignment done?",
      answer:
        "ScholarlyHelp also offers professional academic writing services, including research, writing, editing, summarising, and formatting for assignments of any size.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "Your reading list",
  titlePill: "won't wait.",
  titleEnd: "",
  body: "Start now with the free summarizer, or talk to a ScholarlyHelp writer who can take the work off your hands.",
  primaryButton: "Summarize my text free",
  primaryHref: "#summarizer-tool",
  secondaryButton: "Talk to an expert →",
  secondaryHref: "/contact-us",
};
