// Copy for the /tools/ai-essay-title-generator landing page. Mirrors the
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
  badge: "2,140 students used this tool this week",
  titleTop: "Find the perfect essay title",
  titleAccent: "in seconds",
  subtitle:
    "Tell the essay title generator what your essay is about, and get clear, relevant titles to choose from in seconds.",
  steps: ["Enter Topic", "Get Title Ideas", "Pick Your Favorite"],
};

export const useCasesContent: UseCasesContent = {
  title: "An AI essay title for every situation.",
  subtitle: "Start faster. Choose better. Write with confidence.",
  cards: [
    {
      icon: "📝",
      title: "No title yet",
      description:
        "Turn your essay topic into clear, relevant titles that are ready to use in seconds.",
    },
    {
      icon: "💡",
      title: "A new topic",
      description:
        "Add your topic or keywords, then generate title ideas that match your subject and main focus.",
    },
    {
      icon: "⚖️",
      title: "Comparing title ideas",
      description:
        "Generate multiple title options and choose the one that best fits your essay.",
    },
    {
      icon: "🎭",
      title: "Not sure of the tone",
      description:
        "Create academic, creative, or simple titles that match your assignment and writing style.",
    },
    {
      icon: "✨",
      title: "Making it stand out",
      description:
        "Generate engaging titles that grab attention while staying relevant to your essay topic.",
    },
    {
      icon: "🖥️",
      title: "Staring at a blank screen",
      description:
        "Break the hesitation the second you start. Turn a rough idea into clear, usable titles without wasting time.",
    },
  ],
};

export const howItWorksContent: HowItWorksContent = {
  eyebrow: "How it works",
  title: "Turn any topic into the right essay title",
  steps: [
    {
      title: "Enter your topic",
      description:
        "Type your essay topic, keywords, or short description to begin generating title ideas.",
    },
    {
      title: "Choose your preferences",
      description:
        "Select your subject, essay type, and preferred tone before generating your titles.",
    },
    {
      title: "Generate titles",
      description:
        "Instantly create a list of relevant titles based on the information you provided.",
    },
    {
      title: "Pick your favourite",
      description:
        "Choose the best title, make any final edits, and use it in your essay.",
    },
  ],
  ctaTitleStart: "Want all 16",
  ctaTitleBrand: "ScholarlyHelp",
  ctaTitlePill: "Tools",
  ctaTitleEnd: "in one place?",
  ctaBody:
    "Your free ScholarlyHelp dashboard keeps the essay title generator, outline generator, paraphraser, summarizer, and citation tool ready in one place.",
  ctaButton: "Explore all tools →",
  ctaHref: "/tools",
};

export const whyItWorksContent: WhyItWorksContent = {
  eyebrow: "Why it works",
  title: "Titles that fit your essay, not random ones",
  subtitle:
    "Our AI essay title generator reads your topic, subject, and tone, then shapes each title to fit your essay.",
  features: [
    {
      icon: "🎯",
      title: "Topic-Based Titles",
      description:
        "Turn your topic into relevant essay titles that reflect your subject and main idea.",
    },
    {
      icon: "🎨",
      title: "Tone Selection",
      description:
        "Generate academic, creative, or simple titles that match your assignment requirements.",
    },
    {
      icon: "📋",
      title: "Multiple Title Ideas",
      description:
        "Create several title options at once, making it easier to choose the best one for your essay.",
    },
  ],
};

export const watchVideoContent: WatchVideoContent = {
  eyebrow: "See it in action",
  title: "Generate better essay titles in seconds",
  // https://youtu.be/Evq8Pq6dr6E
  youtubeEmbedUrl: "https://www.youtube.com/embed/Evq8Pq6dr6E",
};

export const twoWaysContent: TwoWaysContent = {
  eyebrow: "How to get help",
  title: "Two ways to get what you need",
  subtitle:
    "Use the free essay title generator to start, or let a ScholarlyHelp writer take the whole thing from here.",
  freeColumn: {
    heading: "Use the title yourself",
    steps: [
      {
        title: "Enter your topic",
        description:
          "Paste your topic or keywords to instantly generate a new list of essay title ideas.",
      },
      {
        title: "Generate title ideas",
        description:
          "Create multiple essay titles that match your subject, topic, and preferred writing style.",
      },
      {
        title: "Use your title",
        description:
          "Pick the title that fits your essay and use it to start or finish your writing.",
      },
      {
        title: "Save and come back!",
        description:
          "Enter your email to save your title ideas in your free, personalised ScholarlyHelp dashboard.",
      },
    ],
  },
  expertColumn: {
    heading: "Let our experts help",
    steps: [
      {
        title: "Share topic and brief",
        description:
          "Send us your topic, your deadline, and any of the instructions your professor has given you.",
      },
      {
        title: "Get matched to writer",
        description:
          "Your topic is matched with a writer who specializes in your subject and your academic level.",
      },
      {
        title: "Track it live for you",
        description:
          "Message your writer, ask questions, and follow the whole essay as it comes together for you.",
      },
      {
        title: "Receive and review it",
        description:
          "Receive your finished essay with a plagiarism report and free revisions until you are happy.",
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
        "I always leave the title till last and then sit there for ages. I typed in my topic, got a list of solid options, and picked one in under a minute. Such a small thing, but a real time-saver.",
      author: "Aisha M.",
      detail: "Political Science, UT Austin — Junior",
    },
    {
      quote:
        "My working title was so boring my tutor told me to change it. This gave me a much sharper version of the same idea, and my final essay honestly looked better before he even read it.",
      author: "Daniel K.",
      detail: "English Literature, NYU — Senior",
    },
    {
      quote:
        "As an international student I never know what a title should sound like. Seeing ten proper academic titles for my topic made the whole thing clear, and I learn a bit more each time.",
      author: "Yuki T.",
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
        "Yes! ScholarlyHelp's AI Essay Title Generator is 100% free to use. Enter your topic and generate essay title ideas in seconds.",
    },
    {
      question: "How many titles will I get?",
      answer:
        "You can generate up to 10 titles. Just enter your topic, choose your subject and preferred tone, then instantly generate titles ready to be used.",
    },
    {
      question: "Can I choose the tone of the title?",
      answer:
        "Yes. You can choose from a variety of tones such as academic, creative, critical, or set up your own custom tone.",
    },
    {
      question: "Can I edit the titles it gives me?",
      answer:
        "Absolutely. Use any generated title as it is, or edit it before submitting your essay.",
    },
    {
      question: "What if I need the whole essay written?",
      answer:
        "Our academic experts can research, write, edit, and format your essay, ready for submission.",
    },
  ],
};

export const footerCtaContent: FooterCtaContent = {
  titleStart: "The right",
  titlePill: "title",
  titleEnd: "is the first easy win.",
  body: "Start free with the essay title generator and pick a title in under a minute, or talk to a ScholarlyHelp writer for more.",
  primaryButton: "Generate my titles free",
  primaryHref: "#essay-title-tool",
  secondaryButton: "Talk to an expert →",
  secondaryHref: "/contact-us",
};
