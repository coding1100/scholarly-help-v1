// Copy for the /tools/ai-grammar-check landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const metaContent = {
  title: "Free Grammar Checker | ScholarlyHelp",
  description:
    "The Free ScholarlyHelp Grammar Checker fixes grammar, spelling, and punctuation with clear explanations for every suggestion.",
};

export const grammarCheckerLanding: LandingContent = {
  toolName: "Grammar Checker",
  toolAnchorId: "grammar-checker-tool",
  placement: "grammar_checker_landing",

  hero: {
    titleLead: "Fix mistakes and learn from every correction with our",
    titleAccent: "grammar checker.",
    subtitle:
      "Paste your text or upload a file, and see each grammar, spelling, and punctuation fix with a reason for it.",
  },

  cta: {
    expert: "Talk to an editor",
    tool: "Check my writing",
    toolShort: "Check free",
  },

  whatIs: {
    title: "What is a grammar checker?",
    paragraphs: [
      "A grammar checker reads your writing and flags mistakes in grammar, spelling and punctuation, then suggests a fix. A good one also explains why, so you learn the rule instead of repeating the error in your next essay.",
      "ScholarlyHelp's free grammar checker goes beyond red underlines. Set your English dialect and writing mode, then review every suggestion for grammar, tense, clarity and tone with a short explanation, and accept the fixes you agree with. You can paste text or upload a Word or PDF document, and save your own subject terms so they stop being flagged.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Checks", value: "Grammar, spelling, punctuation, tense, clarity, tone" },
      { label: "Dialects", value: "US, UK, Canadian, Australian" },
      { label: "Writing modes", value: "General, Literature Review, Methodology, Discussion" },
      { label: "Uploads", value: "Word or PDF" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Every student has writing to improve",
    subtitle: "Check grammar, tense, clarity, and tone before submitting your work.",
    cards: [
      {
        title: "Last Minute Editing",
        description:
          "Submitting an essay today? Run a quick check, copy your final version, and submit.",
      },
      {
        title: "University writing",
        description:
          "Working on a major paper? Select your academic writing mode before checking your draft.",
      },
      {
        title: "Need more clarity",
        description:
          "Not sure what changed? Read detailed explanations for every single correction you make.",
      },
      {
        title: "International English",
        description:
          "Writing for another country? Match your spelling and grammar to the exact English you need.",
      },
      {
        title: "Custom words",
        description:
          "Use technical or familiar words often? Save them so they won't be flagged again.",
      },
    ],
    ctaCard: {
      title: "Want a full proofread?",
      description:
        "A checker fixes errors. An academic editor reviews tone, structure and citations.",
    },
  },

  examples: {
    title: "Grammar checker examples by mistake type",
    subtitle: "See the kinds of errors it catches, each with a reason.",
    items: [
      {
        title: "Spelling and word choice",
        before:
          "Frequent gaming can play a major role in how the brAIn processes info. Each Student might experience fatigue.",
        after:
          "Frequent gaming can play a major role in how the brain processes information. Every student might experience fatigue.",
      },
      {
        title: "Tense consistency",
        before:
          "The participants complete the survey and then they were interviewed about their answers.",
        after:
          "The participants completed the survey and were then interviewed about their answers.",
      },
      {
        title: "Dialect spelling (UK)",
        before: "The organization analyzed the color of each sample.",
        after: "The organisation analysed the colour of each sample.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "Check your writing in 4 steps",
    steps: [
      {
        title: "Add your writing",
        description: "Paste your text or upload a Word or PDF document.",
      },
      {
        title: "Set your goals",
        description: "Choose your English dialect, section, and formality level.",
      },
      {
        title: "Review suggestions",
        description: "See Grammar, Tense, Clarity, and Tone with clear explanations.",
      },
      {
        title: "Make changes and report",
        description:
          "Accept fixes right here, copy the polished version, and review your final report.",
      },
    ],
  },

  comparison: {
    title: "Grammar checker vs AI humanizer vs paraphraser",
    subtitle: "Each tool fixes a different problem. Here's when to use which.",
    columns: ["Grammar checker", "AI humanizer", "Paraphrasing tool"],
    highlight: "Academic editor",
    rows: [
      {
        label: "What it changes",
        values: ["Spelling, grammar, punctuation", "Tone, rhythm and flow", "Wording, same structure"],
        highlight: "Tone, structure, citations",
      },
      {
        label: "Best for",
        values: ["Final proofread", "Stiff or robotic drafts", "Restating a source in new words"],
        highlight: "Whole papers before submission",
      },
      {
        label: "Explains each change",
        values: ["Yes", "No", "No"],
        highlight: "Yes",
      },
      {
        label: "Improves your argument",
        values: ["No", "No", "No"],
        highlight: "Yes",
      },
      {
        label: "Cost on ScholarlyHelp",
        values: ["Free", "Free", "Free"],
        highlight: "Free quote",
        highlightLink: "talk to an editor",
      },
    ],
  },

  limits: {
    title: "What a grammar checker can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Judge your argument",
        description:
          "It checks how sentences are written, not whether your point holds up.",
      },
      {
        title: "Check facts",
        description:
          "A sentence can be perfectly correct and still wrong. Verify every claim.",
      },
      {
        title: "Format citations",
        description:
          "It won’t build references. Use the citation generator for that.",
      },
      {
        title: "Guarantee a grade",
        description:
          "Clean grammar helps, but grades depend on content, structure and evidence.",
      },
    ],
    note: {
      before: "For tone, structure and citations across the whole paper, ",
      linkLabel: "talk to an academic editor",
      after: ".",
    },
  },

  expertBand: {
    tag: "Expert proofreading",
    tagline: "Checkers fix errors. Editors refine the whole paper.",
    titleStart: "Get a real academic editor to",
    titleAccent: "refine your writing",
    checks: [
      "Academic tone and structure reviewed",
      "Citations checked",
      "Free revisions",
    ],
    note: "Free quote in ~2 minutes · 24/7 Availability",
    rating: "Rated 4.8/5 based on 1,200+ student reviews",
  },

  guide: {
    title: "How to proofread your own writing (and when to get an editor)",
    intro:
      "A grammar checker catches a lot, but the best proofreading combines the tool with a careful read of your own. Use these tips with or without the checker.",
    sections: [
      {
        heading: "Why mistakes slip through",
        body: "You read what you meant to write, not what is on the page. That's why tense switches, missing words and wrong-dialect spellings survive several rereads. Tired, last-minute editing makes it worse, and so does writing in a second language, where some rules don't match your first.",
      },
      {
        heading: "6 quick proofreading habits",
        steps: [
          { lead: "Take a break first.", text: "Even ten minutes away helps you see the text fresh." },
          { lead: "Read it out loud.", text: "Your ear catches missing words your eye skips." },
          { lead: "Check one thing at a time.", text: "Do a pass for tense, then one for spelling, then one for punctuation." },
          { lead: "Set the right dialect.", text: "Match US or UK spelling to what your course expects." },
          { lead: "Read the reason.", text: "Before accepting a fix, make sure you understand why it's suggested." },
          { lead: "Save your subject terms.", text: "Add technical words to your dictionary so real errors stand out." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A grammar checker fixes sentences, but it can't tell you whether your structure works, your tone suits the assignment or your citations are right. For a paper that matters, a ScholarlyHelp academic editor reviews the whole thing and explains the changes they make.",
        callout: {
          lead: "Submitting something important?",
          text: "Get a full proofread from an academic editor.",
        },
      },
      {
        heading: "Using AI writing tools responsibly in school",
        body: "Grammar checking is widely accepted, but rules differ. Check your syllabus or ask your instructor what is allowed, and disclose AI-assisted editing when it's required. Make sure the ideas and arguments in your paper are your own.",
      },
    ],
  },

  related: ["humanizer", "paraphraser", "citation", "detector"],

  faq: {
    title: "Common questions about this tool",
    subtitle: "Everything you need to know about our free AI Grammar Checker.",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. You can check your writing for free and see every correction with a clear explanation. Sign up for free to access more ScholarlyHelp tools from one dashboard.",
      },
      {
        question: "What does it check?",
        answer:
          "It checks grammar, spelling, punctuation, tense, clarity, and tone. Every suggestion includes a clear explanation so you understand each correction.",
      },
      {
        question: "Which English dialects can I use?",
        answer:
          "Choose from UK, US, Canadian, or Australian English. The checker adjusts spelling and word choices to match the dialect you select.",
      },
      {
        question: "Can I stop my own words being flagged?",
        answer:
          "Yes. Add technical or familiar words to your dictionary, and the checker won't flag them again.",
      },
      {
        question: "What if I want a full proofread?",
        answer:
          "If you need more than a grammar check, our academic editors can proofread your paper, improve the writing, and explain the changes they make.",
      },
    ],
  },

  finalCta: {
    titleStart: "Hand in writing you can",
    titlePill: "trust.",
    body: "Check your text free in under a minute, or ask an editor for a full proofread.",
  },
};
