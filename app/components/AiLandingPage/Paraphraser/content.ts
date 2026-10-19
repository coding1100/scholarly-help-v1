// Copy for the /tools/ai-paraphraser landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const paraphraserLanding: LandingContent = {
  toolName: "AI Paraphraser",
  toolAnchorId: "paraphraser-tool",
  placement: "paraphraser_landing",

  hero: {
    titleLead: "The Free Paraphrasing Tool That",
    titleAccent: "Rewrites Your Text in Seconds",
    subtitle:
      "Paste your text, pick a style, and our paraphrasing tool returns a clean, polished rewrite straight away.",
  },

  cta: {
    expert: "Get expert help",
    tool: "Paraphrase my text for free",
    toolShort: "Paraphrase free",
  },

  whatIs: {
    title: "What is a paraphrasing tool?",
    paragraphs: [
      "A paraphrasing tool rewrites a passage in new words while keeping what it means. It restructures sentences and refreshes vocabulary, so you can restate an idea clearly without copying the original wording.",
      "ScholarlyHelp's free AI paraphraser handles up to 200 words at a time. Pick a style, from neutral Standard to academic Formal, and compare your text with the rewrite side by side. It's useful for restating a source in your own voice, finding a clearer way to say something you're stuck on, or hearing how an idea sounds in good academic English.",
    ],
    glance: [
      { label: "Price", value: "Free (200 words per paraphrase)" },
      { label: "Full rewrite", value: "Unlocked with your email" },
      { label: "Styles", value: "Standard, Formal, Creative, Casual, Custom" },
      { label: "Works for", value: "Essays, posts, reports" },
    ],
  },

  levels: {
    title: "Choose a paraphrasing style",
    subtitle:
      "Each style rewrites for a different purpose. Casual and Custom are in the tool too.",
    items: [
      {
        name: "Standard",
        recommended: true,
        description:
          "A clean, neutral rewrite that keeps your meaning. Best for everyday restating.",
        before: "The study found that sleep has an effect on memory.",
        after: "The research showed that sleep affects how well we remember.",
      },
      {
        name: "Formal",
        description:
          "Academic vocabulary and fuller sentences. Best for essays and reports.",
        before: "Lots of people think social media is bad for teens.",
        after:
          "Many researchers argue that social media has a negative effect on adolescents.",
      },
      {
        name: "Creative",
        description:
          "Varies phrasing for more expressive language. Best for reflective or persuasive writing.",
        before: "The city was very busy in the morning.",
        after: "By morning, the city was already buzzing.",
      },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Every student has a reason to use a paraphraser",
    subtitle:
      "Whether it's last-minute or long-term, this AI paraphrasing tool fits every situation.",
    cards: [
      {
        title: "Deadline tonight",
        description:
          "Short on time? Turn complex paragraphs into submission-ready text in seconds using our paraphrasing tool free.",
      },
      {
        title: "Academic English",
        description:
          "Use Formal mode to hear how good academic English should sound in your subject, and learn from each result.",
      },
      {
        title: "Aiming for a higher grade",
        description:
          "Run your draft through Formal mode to see how top-level academic writing handles the very same ideas.",
      },
      {
        title: "Stuck mid-draft",
        description:
          "Run your paragraph through another rewrite to see a clearer way of expressing exactly that same idea.",
      },
      {
        title: "Maintain Academic Integrity",
        description:
          "One draft won't fit everything, so switch modes until it sounds right for the essay or the post.",
      },
    ],
    ctaCard: {
      title: "Got a whole document?",
      description:
        "The tool rewrites a passage. A ScholarlyHelp writer can rework the full paper.",
    },
  },

  examples: {
    title: "Paraphrasing examples by writing type",
    subtitle: "See how the same tool rewrites essays, discussion posts and emails.",
    items: [
      {
        title: "Essay paragraph",
        before:
          "In recent years, the widespread adoption of artificial intelligence across industries has significantly transformed the nature of employment.",
        after:
          "AI has spread fast across nearly every industry, and it’s quietly reshaping what work looks like.",
      },
      {
        title: "Discussion post",
        before:
          "I agree with the point that was made regarding the importance of early intervention in childhood education.",
        after:
          "I agree that stepping in early makes a real difference in children's education.",
      },
      {
        title: "Professional email",
        before:
          "Please be advised that the submission deadline has been extended until the end of the week.",
        after: "Good news: the deadline now runs to the end of the week.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "From rough draft to refined copy in 4 steps",
    steps: [
      {
        title: "Paste your text",
        description:
          "Drop in a sentence, section, or paragraph up to 200 words for our AI paraphraser free tool to rewrite.",
      },
      {
        title: "Choose your style",
        description:
          "Choose Standard, Creative, Formal, or Casual, or use Custom to spell out exactly what you want now.",
      },
      {
        title: "Enter your email",
        description:
          "Enter your email to unlock the complete rewrite and access it in your free ScholarlyHelp dashboard.",
      },
      {
        title: "Copy and submit",
        description:
          "Copy the full version, read it over, tweak anything that needs your voice, and it’s yours.",
      },
    ],
  },

  comparison: {
    title: "Paraphraser vs AI humanizer vs grammar checker",
    subtitle: "Each tool fixes a different problem. Here's when to use which.",
    columns: ["Paraphrasing tool", "AI humanizer", "Grammar checker"],
    highlight: "Expert writer",
    rows: [
      {
        label: "What it changes",
        values: ["Wording, same meaning", "Tone, rhythm and flow", "Spelling, grammar, punctuation"],
        highlight: "Whatever the brief needs",
      },
      {
        label: "Best for",
        values: ["Restating a source in new words", "Stiff or robotic drafts", "Final proofread"],
        highlight: "Whole essays, reports and theses",
      },
      {
        label: "Keeps your meaning",
        values: ["Yes", "Yes", "Yes"],
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
    title: "What a paraphrasing tool can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Replace a citation",
        description:
          "New wording is still someone else's idea. Cite the source you paraphrased.",
      },
      {
        title: "Check facts",
        description:
          "It restates what you paste, not whether it’s true. Verify every claim.",
      },
      {
        title: "Build your argument",
        description:
          "It can’t create a thesis, structure or analysis. Those have to be yours.",
      },
      {
        title: "Guarantee a grade",
        description:
          "Clearer wording helps, but grades depend on content, structure and evidence.",
      },
    ],
    note: {
      before: "For a full paper reworded at any length, ",
      linkLabel: "get help from an expert writer",
      after: ".",
    },
  },

  expertBand: {
    tag: "Got more than 200 words?",
    tagline: "Tools reword passages. Experts handle the whole document.",
    titleStart: "Get a real expert to",
    titleAccent: "rewrite it for you",
    checks: [
      "Full essays, dissertations and reports",
      "Properly reworded at any length",
      "Plagiarism-free documents",
    ],
    note: "Free quote in 2 min",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to paraphrase well (and when to get human help)",
    intro:
      "A paraphrasing tool is a fast start, but a good paraphrase is more than swapped words. Use these tips on your own writing, with or without the tool.",
    sections: [
      {
        heading: "What a good paraphrase changes",
        body: "A strong paraphrase changes both the wording and the sentence structure while keeping the original meaning. Swapping a few words for synonyms and keeping the same structure reads as patchwriting, and it can still count as copying. Aim to say the idea the way you would explain it to a classmate, then check it against the source.",
      },
      {
        heading: "6 steps to paraphrase a source",
        steps: [
          { lead: "Read it twice.", text: "Make sure you understand the passage before you rewrite it." },
          { lead: "Look away.", text: "Write the idea from memory, in your own words." },
          { lead: "Change the structure.", text: "Start the sentence from a different point, or split one long sentence into two." },
          { lead: "Keep key terms.", text: "Technical terms often have no good synonym. Keep them." },
          { lead: "Compare with the source.", text: "Check the meaning is the same and no phrase is copied." },
          { lead: "Cite it.", text: "A paraphrase still needs a citation to the original source." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A paraphraser rewrites a passage at a time. If you need a full essay, dissertation or report reworded, or the paper needs a stronger argument, structure or sources, that's work for a person. A ScholarlyHelp writer can rework the whole document to your brief.",
        callout: {
          lead: "Got a full document to rework?",
          text: "Get a free quote from an expert writer.",
        },
      },
      {
        heading: "Using paraphrasing tools responsibly in school",
        body: "Check your syllabus or ask your instructor what is allowed before using any AI tool on coursework, and disclose AI-assisted editing when it's required. Always cite the sources you paraphrase, and make sure the ideas and arguments in your paper are your own.",
      },
    ],
  },

  related: ["humanizer", "grammar", "citation", "essay"],

  faq: {
    title: "FAQ",
    subtitle: "Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes, the free AI paraphrasing tool handles up to 200 words per request at no cost. Sign up for free to access more ScholarlyHelp tools from one dashboard.",
      },
      {
        question: "What's the word limit?",
        answer:
          "The paraphraser tool handles up to 200 words per paraphrase. For longer work, our ScholarlyHelp writing service rewrites complete documents at any length, with a plagiarism-free guarantee.",
      },
      {
        question: "What's the difference between the styles?",
        answer:
          "Standard gives a clean, neutral rewrite. Formal uses academic vocabulary and fuller sentences. Creative varies phrasing for more expressive language. Casual sounds more conversational. Custom lets you describe exactly what you need from an AI paraphrasing tool.",
      },
      {
        question: "Will it change the meaning of my text?",
        answer:
          "No. Our paraphraser AI tool reshapes your sentences and refreshes your vocabulary while keeping your original argument intact. Always read the output carefully before submitting.",
      },
      {
        question: "What if I need the whole assignment written?",
        answer:
          "ScholarlyHelp offers a full academic writing service with expert writers handling research, writing, citations, and formatting for assignments of any length, far beyond what any AI paraphrasing tool alone can do.",
      },
    ],
  },

  finalCta: {
    titleStart: "Your",
    titlePill: "deadline",
    titleEnd: "won't wait.",
    body: "Use the free AI paraphrasing tool and get started in 30 seconds",
  },
};
