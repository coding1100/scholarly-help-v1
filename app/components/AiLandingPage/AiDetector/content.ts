import type { ToolLandingContent } from "../ToolLanding/types";

export const aiDetectorContent: ToolLandingContent = {
  hero: {
    badge: "2,468 students checked their text this week",
    titleTop: "Trusted AI detector for ChatGPT,",
    titleAccent: "Gemini, and all major LLMs",
    subtitle:
      "Paste your text and see whether each sentence reads as AI, human, or mixed.",
    steps: ["Paste text", "Read the breakdown", "Edit and rescan"],
    toolId: "ai-detector-tool",
  },
  useCases: {
    eyebrow: "Use cases",
    title: "Every student has a reason to check",
    subtitle: "Check your work and save your grade from AI.",
    cards: [
      {
        icon: "📚",
        title: "Sources and quotes",
        description:
          "Used quotes and research? Check that your writing flows naturally and avoids AI detection flags.",
      },
      {
        icon: "✏️",
        title: "After making edits",
        description:
          "Updated part of your paper? Scan it again and check if your AI detection score improves.",
      },
      {
        icon: "👥",
        title: "Group assignments",
        description:
          "Working with classmates? Scan the full paper and check that the writing stays consistent.",
      },
      {
        icon: "🔎",
        title: "Sentence highlights",
        description:
          "See which sentences were flagged so you know exactly what to review and improve.",
      },
      {
        icon: "🌐",
        title: "Writing in English",
        description:
          "Writing in a second language? Check that your work isn't mistaken for AI-written text.",
      },
      {
        icon: "📄",
        title: "Download reports",
        description:
          "Save a PDF report after every scan and keep your results ready whenever you need them.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Check your writing in 4 steps",
    steps: [
      {
        title: "Add your text",
        description: "Paste your writing or upload a document to get started.",
      },
      {
        title: "Run the scan",
        description: "Click Scan and let the tool analyze every sentence.",
      },
      {
        title: "Review the results",
        description:
          "See your overall score, sentence labels, and highlighted sections.",
      },
      {
        title: "Edit your text",
        description:
          "Rewrite the detected text, then rescan to check the updated score.",
      },
    ],
    ctaTitle: "Want access to all ScholarlyHelp tools?",
    ctaBody:
      "Sign up for free to access the humaniser, paraphraser, summarizer, citation tool, and more from one dashboard.",
    ctaButton: "Explore all tools →",
    ctaHref: "/tools",
  },
  whyItWorks: {
    eyebrow: "Why it works",
    title: "Understand your results",
    subtitle:
      "Review the highlighted sections and understand your results in a clear, simple way.",
    features: [
      {
        icon: "🖍️",
        title: "Sentence highlights",
        description:
          "Every sentence is marked AI, Mixed, or Human so you know what to review.",
      },
      {
        icon: "📊",
        title: "Clear overview",
        description:
          "See your overall result alongside the highlighted parts of your writing.",
      },
      {
        icon: "💡",
        title: "Helpful notes",
        description:
          "Simple notes explain why each sentence was highlighted in your report.",
      },
    ],
  },
  twoWays: {
    eyebrow: "How to get help",
    title: "Two ways to handle your writing",
    subtitle:
      "Check and revise it yourself, or hand the whole task to our writers.",
    freeColumn: {
      heading: "Free tool, do it yourself",
      subheading: "Easy to start.",
      steps: [
        {
          title: "Add your text",
          description:
            "Paste your writing or upload a file to start your AI Detector scan.",
        },
        {
          title: "View your results",
          description:
            "See your overall result and review your writing in just a few seconds.",
        },
        {
          title: "Review highlights",
          description:
            "See which sentences are labelled AI, Mixed, or Human as you review.",
        },
        {
          title: "Edit and scan",
          description:
            "Make changes to your writing, then scan it again whenever you're ready.",
        },
      ],
    },
    expertColumn: {
      heading: "Expert services, done for you",
      subheading: "A free quote in about two minutes →",
      steps: [
        {
          title: "Share your brief",
          description:
            "Share the assignment, the subject, and the deadline you now face.",
        },
        {
          title: "Get matched to a writer",
          description:
            "You are paired with a subject specialist for your academic level.",
        },
        {
          title: "Follow the progress",
          description:
            "Put any questions to your writer and follow the work as it grows.",
        },
        {
          title: "Receive and review",
          description:
            "Get the completed piece once ready, plus free edits where needed.",
        },
      ],
    },
  },
  watchVideo: {
    eyebrow: "Watch video",
    title: "How to Check AI using ScholarlyHelp AI Detector",
    youtubeEmbedUrl: "https://www.youtube.com/embed/gnAWsmO_PPs",
  },
  reviews: {
    eyebrow: "Student reviews",
    title: "What students say about this tool",
    reviews: [
      {
        quote:
          "I like that it does not just throw a number at me. Seeing which sentences were flagged, and why, showed me exactly what to change in my own draft. That part is genuinely useful.",
        author: "Hannah B.",
        detail: "Sociology, University of Leeds — 2nd year",
      },
      {
        quote:
          "English is my second language, and I worried my own writing would look machine-made. Checking it here first, sentence by sentence, gave me a bit of reassurance before I handed it in.",
        author: "Diego R.",
        detail: "Engineering, Arizona State — Final year",
      },
      {
        quote:
          "Honesty is what I trust. It shows a range and admits it is an estimate, rather than pretending to be certain. That is more useful to me than a confident wrong answer would be.",
        author: "Mei C.",
        detail: "Law, University of Sydney — Postgraduate",
      },
    ],
  },
  faq: {
    title: "FAQ",
    subtitle: "Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. You can use the AI Detector for free and check your writing in just a few clicks. Sign up for free to access more ScholarlyHelp tools from one dashboard.",
      },
      {
        question: "How accurate is the AI Detector?",
        answer:
          "The AI Detector gives you an estimate, not a final answer. Use it as a guide rather than an ultimate decision-maker.",
      },
      {
        question: "What do the Mixed, Human, and AI labels mean?",
        answer:
          "Human means the writing shows natural patterns typical of human authorship. AI means the text shows predictable AI patterns. Mixed means the draft shows a combination, which often happens when someone paraphrases or edits AI content to sound human.",
      },
      {
        question: "Will my text be stored?",
        answer:
          "No. Your writing is only used to generate your results. We do not store or share the text you scan.",
      },
      {
        question: "What do the highlights mean?",
        answer:
          "The highlights show which sentences are labeled AI, Mixed, or Human. Red shows AI-generated text, yellow shows mixed text, and green shows human-written text.",
      },
    ],
  },
  footer: {
    titleStart: "Know how your writing",
    titlePill: "reads first.",
    body: "Scan your text free in under a minute, or talk to a writer about the assignment itself.",
    primaryButton: "Check my text free",
    primaryHref: "#ai-detector-tool",
    secondaryButton: "Talk to an expert →",
    secondaryHref: "/contact-us",
    footnote: "No sign-up to scan · Text never stored",
  },
};

export const aiDetectorMeta = {
  title: "Free AI Detector | ScholarlyHelp",
  description:
    "The free ScholarlyHelp AI detector checks whether text reads as AI, human, or mixed, with sentence highlights and a confidence range.",
};
