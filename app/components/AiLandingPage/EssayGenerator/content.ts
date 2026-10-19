// Copy for the /tools/ai-essay-generator landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const essayGeneratorLanding: LandingContent = {
  toolName: "Essay Generator",
  toolAnchorId: "essay-generator-tool",
  placement: "essay_generator_landing",

  hero: {
    titleLead: "The essay generator that",
    titleAccent: "writes the whole essay",
    subtitle:
      "Enter a topic, shape the outline your way, set your tone and citation style, then generate a full essay you can edit in place.",
  },

  cta: {
    expert: "Get expert help",
    tool: "Build my outline for free",
    toolShort: "Start free",
  },

  whatIs: {
    title: "What is an AI essay generator?",
    paragraphs: [
      "An AI essay generator turns a topic and an assignment brief into a structured essay draft. A good one doesn't jump straight to the finished text: it builds an outline first, so you control the structure before a single paragraph is written.",
      "ScholarlyHelp's free essay generator works in four steps. Set up your topic, level, essay type, prompt and rubric; shape the outline; choose your tone, citation style and length; then generate a full draft you can paraphrase, expand or shorten in place. Treat the draft as a strong starting point and make it your own before you hand it in.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Steps", value: "Setup, Outline, Preferences, Draft" },
      { label: "Citation styles", value: "APA 7th, MLA 9th, Chicago 17th, Harvard, none" },
      { label: "Editing", value: "Paraphrase, expand, shorten in place" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Built for every stage of an essay",
    subtitle:
      "From a new topic to a finished draft, AI Essay Generator helps at different stages of your writing.",
    cards: [
      {
        title: "Starting with a topic",
        description:
          "Have only a topic? Turn your first idea into a clear outline for your essay.",
      },
      {
        title: "Following the brief",
        description:
          "Have assignment instructions? Use your prompt and rubric to guide your entire essay from the start.",
      },
      {
        title: "Planning your essay",
        description:
          "Not sure how to organize ideas? Build a clear structure before writing your full draft.",
      },
      {
        title: "Improving the structure",
        description:
          "Need better flow? Review and reorder your sections before creating your complete essay draft.",
      },
      {
        title: "Meeting requirements",
        description:
          "Have specific requirements? Set your tone, length, and citation style before creating your essay.",
      },
    ],
    ctaCard: {
      title: "Rather hand it off?",
      description:
        "A writer in your field can take the whole paper, built to your rubric and on time.",
    },
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "Four steps from setup to a finished draft",
    steps: [
      {
        title: "Set up your essay",
        description:
          "Add your topic, academic level, essay type, assignment prompt, and rubric.",
      },
      {
        title: "Shape your outline",
        description:
          "Review your outline, edit the points, and reorder sections before drafting.",
      },
      {
        title: "Choose your preferences",
        description:
          "Choose your tone, citation style, target length, and writing preferences here.",
      },
      {
        title: "Draft and refine",
        description:
          "Generate your essay, then refine the draft with built-in editing tools.",
      },
    ],
  },

  comparison: {
    title: "Essay generator vs paraphraser vs AI humanizer",
    subtitle: "Each tool does a different job. Here's when to use which.",
    columns: ["Essay generator", "Paraphrasing tool", "AI humanizer"],
    highlight: "Expert writer",
    rows: [
      {
        label: "What it does",
        values: ["Outline and full draft", "Rewords a passage", "Fixes tone and flow"],
        highlight: "Writes the whole paper",
      },
      {
        label: "Best for",
        values: ["Getting from topic to draft", "Restating a source", "Stiff or robotic drafts"],
        highlight: "Papers that must be right",
      },
      {
        label: "Follows your rubric",
        values: ["Yes, from setup", "No", "No"],
        highlight: "Yes",
      },
      {
        label: "Length it handles",
        values: ["A full draft", "200 words at a time", "200 words at a time"],
        highlight: "Any length",
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
    title: "What an essay generator can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Do your research",
        description:
          "It drafts from your topic and brief. You still need to read and cite real sources.",
      },
      {
        title: "Check facts",
        description:
          "Generated text can sound sure and still be wrong. Verify every claim.",
      },
      {
        title: "Replace your voice",
        description:
          "A draft is a start. Add your own examples and analysis before you submit.",
      },
      {
        title: "Guarantee a grade",
        description:
          "A clear structure helps, but grades depend on content, evidence and your own thinking.",
      },
    ],
    note: {
      before: "For a researched paper written to your brief, ",
      linkLabel: "get help from an expert writer",
      after: ".",
    },
  },

  expertBand: {
    tag: "Need the whole paper?",
    tagline: "Tools draft. Experts research and write.",
    titleStart: "Let an expert write",
    titleAccent: "the whole essay",
    checks: [
      "Subject-specialist writers",
      "Built to your rubric and deadline",
      "Free revisions",
    ],
    note: "Free quote in 2 min",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to turn a generated draft into your own essay",
    intro:
      "A generated draft saves the blank-page hours, but the grade comes from what you add to it. Use these steps to make the essay yours.",
    sections: [
      {
        heading: "Start with the outline, not the draft",
        body: "The outline is where an essay is won or lost. Before you generate anything, check that each section answers part of the prompt, that the order builds an argument, and that your thesis is something you can actually defend. Reordering a few points here is much faster than restructuring a finished draft.",
      },
      {
        heading: "6 ways to make the draft yours",
        steps: [
          { lead: "Rewrite the thesis.", text: "Say your main claim in your own words." },
          { lead: "Add real sources.", text: "Find and cite the readings your course expects." },
          { lead: "Bring in your examples.", text: "Use cases from class, work or your own reading." },
          { lead: "Check every claim.", text: "Cut anything you can't back up with a source." },
          { lead: "Match the rubric.", text: "Tick off each requirement against the brief." },
          { lead: "Read it out loud.", text: "Rewrite anything that doesn't sound like you." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A generator gives you structure and a draft, but it doesn't do the research, and it can't know what your professor marked down last time. If the paper is high-stakes, or you're out of time to rework a draft properly, a ScholarlyHelp writer in your field can take the whole paper, built to your rubric.",
        callout: {
          lead: "Got a full paper due?",
          text: "Get a free quote from an expert writer.",
        },
      },
      {
        heading: "Using AI writing tools responsibly in school",
        body: "Schools have very different rules about AI. Before you use any AI tool on coursework, check your syllabus or ask your instructor what is allowed, and disclose AI assistance when it's required. Keep your notes and earlier drafts, and make sure the ideas and arguments in your paper are your own.",
      },
    ],
  },

  related: ["humanizer", "paraphraser", "citation", "researchQuestion"],

  faq: {
    title: "FAQ",
    subtitle: "Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. You can plan and draft an essay for free, and this free essay generator creates a complete essay draft from the topic you give. Sign up for free to access more ScholarlyHelp tools from one dashboard.",
      },
      {
        question: "Can I just outline?",
        answer:
          "Yes. The outline is its own step, so you can stop there if a structure is all you need. Build it, edit each point, reorder the body sections, and copy or save the outline on its own.",
      },
      {
        question: "Will it follow my assignment brief?",
        answer:
          "Yes. Paste the assignment prompt and any rubric or syllabus notes in setup, and both the outline and the draft are built to follow those constraints and cover the required points.",
      },
      {
        question: "Can I choose the citation style?",
        answer:
          "Yes. Pick from APA 7th, MLA 9th, Chicago 17th, Harvard, or no citations, and set the tone and target word count too, so the draft matches what your course expects.",
      },
      {
        question: "Is the draft ready to submit as-is?",
        answer:
          "Treat it as a strong starting point, not a finished submission. Edit it in place, add your own examples and sources, and check it before handing it in, since the work should be your own.",
      },
    ],
  },

  finalCta: {
    titleStart: "Plan it, draft it,",
    titlePill: "make it yours.",
    body: "Start with our free essay generator and get a complete draft, or ask a writer to take on the whole essay.",
  },
};

export const metaContent = {
  title: "Free Essay Generator | ScholarlyHelp",
  description:
    "Go from topic to full essay with the ScholarlyHelp AI essay generator. Build the outline, set your preferences, then generate your draft.",
};
