// Copy for the /tools/ai-humanizer landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const humanizerLanding: LandingContent = {
  toolName: "AI Humanizer",
  toolAnchorId: "humanizer-tool",
  placement: "humanizer_landing",

  hero: {
    titleLead: "AI Humanizer:",
    titleAccent: "Make your draft sound like you wrote it.",
    subtitle:
      "Paste your draft and get natural, human-sounding writing in seconds. Free to try, no sign-up.",
  },

  cta: {
    expert: "Get expert help",
    tool: "Humanize my text for free",
    toolShort: "Humanize free",
  },

  whatIs: {
    title: "What is an AI humanizer?",
    paragraphs: [
      "An AI humanizer is a writing tool that rewrites stiff, robotic-sounding text so it reads the way a real person talks. It changes sentence rhythm, cuts filler phrases and swaps vague wording for clearer language, while keeping your original meaning.",
      "ScholarlyHelp's free AI humanizer is built for students and working adults who write essays, discussion posts, reports and emails. Paste up to 200 words of your own draft, pick how much you want rewritten, and get a natural, readable version in seconds. It's especially useful if English is your second language, if a draft you wrote quickly sounds mechanical, or if you used AI to brainstorm and want the final text to sound like you.",
    ],
    glance: [
      { label: "Price", value: "Free (200 words per rewrite)" },
      { label: "Sign-up", value: "Not required" },
      { label: "Rewrite levels", value: "Light, Moderate, Full" },
      { label: "Works for", value: "Essays, posts, reports, emails" },
    ],
  },

  levels: {
    title: "Choose how much to rewrite",
    subtitle:
      "Three rewrite levels, so you decide how much of your original wording stays.",
    items: [
      {
        name: "Light",
        description:
          "Fixes stiff phrasing and filler, keeps most of your wording. Best for drafts that are almost there.",
        before: "It is important to note that the results were significant.",
        after: "The results were significant.",
      },
      {
        name: "Moderate",
        recommended: true,
        description:
          "Balances clarity and your voice. Rewords sentences and varies rhythm without changing your points.",
        before: "Utilization of this method facilitates improved outcomes.",
        after: "Using this method leads to better results.",
      },
      {
        name: "Full",
        description:
          "Rebuilds sentence structure from scratch while keeping the meaning. Best for very stiff or awkward text.",
        before:
          "There are numerous factors that contribute to stress among nurses.",
        after: "Nurses deal with stress from many directions.",
      },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Every Student has a reason to humanize AI text",
    subtitle:
      "Whether you write fast or write slow, this AI humanizer tool fits every kind of student and every kind of deadline.",
    cards: [
      {
        title: "Draft sounds robotic!",
        description:
          "Run it through our AI humanizer to turn stiff, mechanical sentences into natural, human-sounding writing.",
      },
      {
        title: "Deadline is tonight",
        description:
          "Paste your draft and use our humanize AI free tool to make rushed writing sound natural and polished.",
      },
      {
        title: "Too many AI fillers?",
        description:
          "Remove repetitive phrases and filler words to turn bland, padded writing into clear, engaging text.",
      },
      {
        title: "English is not native",
        description:
          "Use our online tools to humanize AI text to turn awkward phrasing into fluent, natural English.",
      },
      {
        title: "Built for all writing",
        description:
          "Essays, research papers, marketing copy, and emails our AI to humanized tool adapts your writing to each task's tone.",
      },
    ],
    ctaCard: {
      title: "Want it done for you?",
      description:
        "A tool fixes sentences. A ScholarlyHelp writer can take on the whole paper.",
    },
  },

  examples: {
    title: "AI humanizer examples by writing type",
    subtitle: "See how the same tool adapts to essays, discussion posts and emails.",
    items: [
      {
        title: "Essay paragraph",
        before:
          "It is evident that social media has a significant impact on the mental health of adolescents in various ways.",
        after: "Social media affects teenagers’ mental health in more ways than one.",
      },
      {
        title: "Discussion post",
        before:
          "In my opinion, I believe that the implementation of telehealth services is beneficial for patients.",
        after:
          "I think telehealth helps patients, especially those who can’t easily get to a clinic.",
      },
      {
        title: "Professional email",
        before:
          "I am writing to inform you that I will be unable to attend the meeting that is scheduled for tomorrow.",
        after: "I won’t be able to make tomorrow’s meeting.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "From robotic draft to natural writing in four steps",
    steps: [
      {
        title: "Paste in your text",
        description:
          "Drop up to 200 words of AI-generated content into the box: a line, paragraph, or section needing a human touch.",
      },
      {
        title: "Set intensity and check AI score",
        description:
          "Check your AI score, choose light, balanced, or strong, then click to humanize AI text instantly.",
      },
      {
        title: "Review and copy",
        description:
          "Compare the humanized version with your original, then copy the version that sounds most natural.",
      },
      {
        title: "Unlock your dashboard",
        description:
          "Enter your email to download results and access all 16 tools in your free ScholarlyHelp dashboard.",
      },
    ],
  },

  comparison: {
    title: "AI humanizer vs paraphraser vs grammar checker",
    subtitle: "Each tool fixes a different problem. Here's when to use which.",
    columns: ["AI humanizer", "Paraphrasing tool", "Grammar checker"],
    highlight: "Expert writer",
    rows: [
      {
        label: "What it changes",
        values: ["Tone, rhythm and flow", "Wording, same structure", "Spelling, grammar, punctuation"],
        highlight: "Whatever the brief needs",
      },
      {
        label: "Best for",
        values: ["Stiff or robotic drafts", "Restating a source in new words", "Final proofread"],
        highlight: "Whole essays, reports and theses",
      },
      {
        label: "Keeps your meaning",
        values: ["Yes", "Mostly", "Yes"],
        highlight: "Yes, written to your brief",
      },
      {
        label: "Improves your thesis",
        values: ["No", "No", "No"],
        highlight: "Yes",
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
    title: "What an AI humanizer can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Check facts",
        description:
          "It improves how you say something, not whether it’s true. Verify every claim.",
      },
      {
        title: "Add citations",
        description:
          "It won’t find sources or format references. Use the citation generator for that.",
      },
      {
        title: "Build your argument",
        description:
          "It can’t create a thesis, structure or analysis. Those have to be yours.",
      },
      {
        title: "Guarantee a grade",
        description:
          "Clearer sentences help, but grades depend on content, structure and evidence.",
      },
    ],
    note: {
      before: "For a whole paper, built to your brief, ",
      linkLabel: "get help from an expert writer",
      after: ".",
    },
  },

  expertBand: {
    tag: "More than 200 words?",
    tagline: "Tools fix sentences. Experts handle the whole paper.",
    titleStart: "Let an expert rewrite",
    titleAccent: "the whole thing",
    checks: [
      "Full essays, reports and theses",
      "Written in a clear, human voice",
      "Free revisions until you're satisfied",
    ],
    note: "Free quote in 2 min",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to make your writing sound natural (and when to get human help)",
    intro:
      "A humanizer is a fast fix, but the best results come when you understand why a draft sounds robotic in the first place. Use these tips on your own writing, with or without the tool.",
    sections: [
      {
        heading: "Why drafts sound robotic",
        body: "Most stiff writing shares the same patterns: throat-clearing openers like \"It is important to note that\", sentences that are all the same length, piles of abstract nouns (\"the utilization of\", \"the implementation of\"), and filler transitions such as \"Furthermore\" and \"Moreover\" at the start of every paragraph. AI-generated drafts lean on these patterns heavily, but rushed human writing does too.",
      },
      {
        heading: "7 quick fixes for natural-sounding writing",
        steps: [
          { lead: "Cut the warm-up.", text: "Delete openers like \"It should be noted that\" and start with the point." },
          { lead: "Vary sentence length.", text: "Follow a long sentence with a short one. Rhythm is what makes writing sound human." },
          { lead: "Use active voice.", text: "\"Nurses reported higher stress\" beats \"Higher stress was reported by nurses.\"" },
          { lead: "Turn nouns back into verbs.", text: "\"We analyzed\" instead of \"an analysis was conducted.\"" },
          { lead: "Add one specific example.", text: "A real detail from your experience or reading makes a paragraph yours." },
          { lead: "Read it out loud.", text: "If you wouldn't say a sentence to a classmate, rewrite it." },
          { lead: "Keep your own words.", text: "After any tool rewrite, put back phrases that sound like you and remove ones that don't." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A humanizer improves sentences, but grades depend on bigger things: a clear thesis, a logical structure, strong evidence and correct citations. If your instructor's feedback mentions \"weak argument\", \"unclear organization\" or \"needs more analysis\", no rewriting tool will fix that. That's where a ScholarlyHelp expert helps, with a subject specialist who can take on the whole paper.",
        callout: {
          lead: "Got a full paper due?",
          text: "Get a free quote from an expert writer.",
        },
      },
      {
        heading: "Using AI writing tools responsibly in school",
        body: "Schools have very different rules about AI. Before you use any AI tool on coursework, check your syllabus or ask your instructor what is allowed, and disclose AI-assisted editing when it's required. Keep your notes and earlier drafts, and make sure the ideas and arguments in your paper are your own. Used this way, a humanizer is simply an editing aid, like a grammar checker.",
      },
    ],
  },

  related: ["paraphraser", "citation", "essay", "grammar"],

  faq: {
    title: "FAQ",
    subtitle: "Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes, the free AI humanizer handles up to 200 words per request at no cost and with no sign-up required. Break your document down and paste it freely, or unlock unlimited access with premium.",
      },
      {
        question: "Can I check my AI score before and after humanizing?",
        answer:
          "Absolutely. The built-in AI detector and humanizer button lets you test your draft instantly, check the score, adjust the intensity, and verify the result again before you copy anything.",
      },
      {
        question: "Will it change the meaning of my text?",
        answer:
          "No. The humanize AI text process changes tone and wording to sound more natural, but your argument and key points stay exactly as you wrote them. Always read the output once before you use it.",
      },
      {
        question: "Can I control the humanization level?",
        answer:
          "Yes. Set the rewrite intensity to light, balanced, or strong, and the AI humanizer tool adjusts the output to match — subtle polish or a full rewrite, your choice.",
      },
      {
        question: "What if I need the whole assignment written?",
        answer:
          "ScholarlyHelp offers a full academic writing service, with expert writers who handle the research, writing, citations, and formatting. For urgent orders, delivery can start from just three hours.",
      },
    ],
  },

  finalCta: {
    titleStart: "Your writing should sound like",
    titlePill: "you.",
    body: "Start now with the best AI humanizer to humanize AI text free, or talk to a ScholarlyHelp writer who can take the whole thing from here.",
  },
};

/** Page-level SEO. */
export const metaContent = {
  title: "Free AI Humanizer: Humanize AI Text | ScholarlyHelp",
  description:
    "Humanize AI text with ScholarlyHelp’s free AI humanizer. Turn robotic wording into natural, human-like writing while keeping your message clear. Try it.",
};
