// Copy for the /tools/ai-detector landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const aiDetectorLanding: LandingContent = {
  toolName: "AI Detector",
  toolAnchorId: "ai-detector-tool",
  placement: "ai_detector_landing",

  hero: {
    titleLead: "Check your paper",
    titleAccent: "before your professor does.",
    subtitle:
      "Working full-time and studying online? See which sentences read as AI, mixed or human, and fix them before you submit.",
  },

  cta: {
    expert: "Talk to an expert",
    tool: "Check my text free",
    toolShort: "Scan free",
  },

  whatIs: {
    title: "What is an AI detector?",
    paragraphs: [
      "An AI detector estimates how likely it is that a piece of writing was produced by an AI model. It looks for patterns that AI text tends to share, such as predictable word choices and very even sentence rhythm, and scores the text from human to AI.",
      "ScholarlyHelp's free AI detector labels every sentence as AI, Mixed or Human, highlights the ones to review, and adds short notes on why each was flagged. Scan a draft, revise the highlighted parts, then scan again to see how the result changes. Treat the score as a guide, not a verdict: every detector gives an estimate.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Sign-up", value: "Not needed to scan" },
      { label: "Results", value: "AI, Mixed or Human per sentence" },
      { label: "Reports", value: "Downloadable PDF" },
      { label: "Your text", value: "Never stored" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Every student has a reason to check",
    subtitle: "Check your work and save your grade from AI.",
    cards: [
      {
        title: "Sources and quotes",
        description:
          "Used quotes and research? Check that your writing flows naturally and avoids AI detection flags.",
      },
      {
        title: "After making edits",
        description:
          "Updated part of your paper? Scan it again and check if your AI detection score improves.",
      },
      {
        title: "Group assignments",
        description:
          "Working with classmates? Scan the full paper and check that the writing stays consistent.",
      },
      {
        title: "Sentence highlights",
        description:
          "See which sentences were flagged so you know exactly what to review and improve.",
      },
      {
        title: "Writing in English",
        description:
          "Writing in a second language? Check that your work isn't mistaken for AI-written text.",
      },
    ],
    ctaCard: {
      title: "Need it written for you?",
      description:
        "A detector checks a draft. A ScholarlyHelp writer can take on the whole assignment.",
    },
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
  },

  comparison: {
    title: "AI detector vs AI humanizer vs grammar checker",
    subtitle: "Each tool does a different job. Here's when to use which.",
    columns: ["AI detector", "AI humanizer", "Grammar checker"],
    highlight: "Expert writer",
    rows: [
      {
        label: "What it does",
        values: ["Labels sentences AI, Mixed or Human", "Rewrites tone and flow", "Fixes grammar and spelling"],
        highlight: "Writes the whole paper",
      },
      {
        label: "Best for",
        values: ["Checking a draft before you submit", "Stiff or robotic drafts", "Final proofread"],
        highlight: "Assignments you need done",
      },
      {
        label: "Changes your text",
        values: ["No", "Yes", "Yes"],
        highlight: "Written for you",
      },
      {
        label: "Cost on ScholarlyHelp",
        values: ["Free", "Free", "Free"],
        highlight: "Free quote",
        highlightLink: "get a quote",
      },
    ],
  },

  limits: {
    title: "What an AI detector can't do",
    subtitle: "Know the limits so you read the result the right way.",
    items: [
      {
        title: "Prove who wrote it",
        description:
          "It gives an estimate, not proof. Use it as a guide, not a verdict.",
      },
      {
        title: "Match every detector",
        description:
          "Other detectors use other models and may score the same text differently.",
      },
      {
        title: "Fix the text for you",
        description:
          "It shows what to review. You still make the edits, then scan again.",
      },
      {
        title: "Guarantee a grade",
        description:
          "A human score doesn't mean a strong paper. Content and evidence still count.",
      },
    ],
    note: {
      before: "For an assignment written from scratch, ",
      linkLabel: "talk to an expert writer",
      after: ".",
    },
  },

  expertBand: {
    tag: "Short on time?",
    tagline: "Detectors check drafts. Experts write the paper.",
    titleStart: "Get a real writer to",
    titleAccent: "handle the assignment",
    checks: [
      "Subject-specialist writers",
      "Matched to your academic level",
      "Free revisions",
    ],
    note: "Free quote in about two minutes",
  },

  guide: {
    title: "How to read an AI detection score (and what to do next)",
    intro:
      "An AI score is a starting point for revision, not a final answer. Here's how to read the result and improve a draft that gets flagged.",
    sections: [
      {
        heading: "Why human writing gets flagged",
        body: "Detectors look for predictability. Writing that uses safe, common phrasing, sentences of the same length and stock transitions like \"Furthermore\" and \"In conclusion\" can look machine-made, even when a person wrote it. Second-language writers and heavily edited drafts are flagged more often for the same reason.",
      },
      {
        heading: "6 ways to revise a flagged draft",
        steps: [
          { lead: "Start with the highlights.", text: "Revise the sentences marked AI or Mixed first." },
          { lead: "Vary sentence length.", text: "Mix short sentences with longer ones." },
          { lead: "Cut stock phrases.", text: "Replace openers like \"It is important to note\" with your point." },
          { lead: "Add specifics.", text: "Names, numbers and examples from your own reading read as human." },
          { lead: "Use your own voice.", text: "Say it the way you'd explain it to a classmate." },
          { lead: "Scan again.", text: "Check how the result changes after each round of edits." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A detector can tell you which sentences to look at, but it can't rewrite the paper, and it can't make a weak argument strong. If the deadline is close or the assignment is bigger than a quick revision, a ScholarlyHelp writer can take it on from the brief.",
        callout: {
          lead: "Running out of time?",
          text: "Get a free quote from an expert writer.",
        },
      },
      {
        heading: "Using AI tools responsibly in school",
        body: "Schools have very different rules about AI. Check your syllabus or ask your instructor what is allowed, and disclose AI assistance when it's required. Keep your notes and earlier drafts as a record of your own work.",
      },
    ],
  },

  related: ["humanizer", "grammar", "paraphraser", "essay"],

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

  finalCta: {
    titleStart: "Know how your writing",
    titlePill: "reads first.",
    body: "Scan your text free in under a minute, or talk to a writer about the assignment itself.",
  },
};

export const aiDetectorMeta = {
  title: "Free AI Detector | ScholarlyHelp",
  description:
    "The free ScholarlyHelp AI detector checks whether text reads as AI, human, or mixed, with sentence highlights and a confidence range.",
};
