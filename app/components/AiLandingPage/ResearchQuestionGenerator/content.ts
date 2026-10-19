// Copy for the /tools/research-question-generator landing page. Layout lives
// in the shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const researchQuestionLanding: LandingContent = {
  toolName: "Research Question Generator",
  toolAnchorId: "research-question-tool",
  placement: "research_question_landing",

  hero: {
    titleLead: "Create a strong research question with our",
    titleAccent: "research question generator",
    subtitle:
      "Enter your topic and get focused, academically sound research questions ready for your paper with our research question generator.",
  },

  cta: {
    expert: "Talk to an expert",
    tool: "Generate my question for free",
    toolShort: "Generate free",
  },

  whatIs: {
    title: "What is a research question generator?",
    paragraphs: [
      "A research question generator turns a broad topic into focused questions you can actually investigate. A good research question is specific, researchable and matched to the method you plan to use, which is the hardest part of starting a paper.",
      "ScholarlyHelp's free research question generator takes your topic in a sentence or two, then lets you set the research type, question style and level of detail. You get several options to compare, ready to refine for an essay, proposal, thesis or dissertation.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Research types", value: "15, from qualitative to policy analysis" },
      { label: "Question styles", value: "Broad, focused, hypothesis-driven, policy-oriented" },
      { label: "Save your work", value: "Free ScholarlyHelp account" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "An AI research question generator for every situation.",
    subtitle: "Start stronger. Research smarter. Write with confidence.",
    cards: [
      {
        title: "Deadline is tonight",
        description:
          "Create a focused question with a research question generator in seconds and get your research started faster.",
      },
      {
        title: "Starting your research",
        description:
          "Enter your topic into a research topic question generator and get questions that match your subject and assignment.",
      },
      {
        title: "Need fresh ideas",
        description:
          "Explore generative research questions and find one that fits your study, topic, and research goals.",
      },
      {
        title: "Choosing a method",
        description:
          "Generate broad, focused, hypothesis-driven, or policy-oriented questions for your topic with our research question AI generator.",
      },
      {
        title: "Writing in English",
        description:
          "Create clear academic questions using an AI research questions generator, with results that are easy to understand, refine, and use.",
      },
    ],
    ctaCard: {
      title: "Need the full paper?",
      description:
        "A ScholarlyHelp writer can research and write it from your question.",
    },
  },

  examples: {
    title: "Research question examples by subject",
    subtitle: "From a broad topic to a question you can investigate.",
    items: [
      {
        title: "Nursing",
        before: "Nurse burnout.",
        after:
          "How do 12-hour shift patterns affect self-reported burnout among ICU nurses in public hospitals?",
      },
      {
        title: "Education",
        before: "Online learning.",
        after:
          "How does weekly live instruction affect course completion among working adults in online degree programs?",
      },
      {
        title: "Business",
        before: "Remote work.",
        after:
          "What is the relationship between remote work frequency and employee retention in mid-sized tech firms?",
      },
    ],
  },

  howItWorks: {
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
          "Use a free online research question generator to create questions for your topic.",
      },
      {
        title: "Unlock your dashboard",
        description: "Sign up for free to save your work in your ScholarlyHelp dashboard.",
      },
    ],
  },

  comparison: {
    title: "Research question generator vs brainstorming vs a general AI chat",
    subtitle: "Each way can get you a question. Here's how they compare.",
    columns: ["Question generator", "Brainstorming alone", "General AI chat"],
    highlight: "Expert writer",
    rows: [
      {
        label: "Matched to your method",
        values: ["Yes", "If you know how", "If you ask"],
        highlight: "Yes",
      },
      {
        label: "Several options to compare",
        values: ["Yes", "Depends", "Yes"],
        highlight: "Chosen with you",
      },
      {
        label: "Writes the paper",
        values: ["No", "No", "No"],
        highlight: "Yes",
      },
      {
        label: "Cost",
        values: ["Free", "Free", "Varies"],
        highlight: "Free quote",
        highlightLink: "get a quote",
      },
    ],
  },

  limits: {
    title: "What a research question generator can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Check the literature",
        description:
          "It can’t tell you if a question is already answered. Search the research first.",
      },
      {
        title: "Confirm it's feasible",
        description:
          "Whether you can get the data or sample depends on your situation.",
      },
      {
        title: "Approve your topic",
        description:
          "Your supervisor or instructor has the final say on your question.",
      },
      {
        title: "Write the paper",
        description:
          "A question is the start. The research and writing still have to happen.",
      },
    ],
    note: {
      before: "For research, writing and citations on the full paper, ",
      linkLabel: "talk to an expert writer",
      after: ".",
    },
  },

  expertBand: {
    tag: "Need the full paper?",
    tagline: "Tools find the question. Experts write the paper.",
    titleStart: "Get an expert to",
    titleAccent: "research and write it",
    checks: [
      "Research, writing and citations",
      "Editing and formatting included",
      "Assignments of all sizes",
    ],
    note: "Free quote · Money-back guarantee on services",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to write a strong research question",
    intro:
      "A good research question decides how easy the rest of the paper will be. Use these checks on any question, whether you wrote it or the tool did.",
    sections: [
      {
        heading: "What makes a question researchable",
        body: "A strong research question is narrow enough to answer in the space you have, specific about who or what you're studying, and phrased so the answer isn't a simple yes or no. It should also fit your method: \"how\" and \"why\" questions suit qualitative work, while \"what is the relationship between\" questions suit quantitative studies.",
      },
      {
        heading: "6 checks before you commit",
        steps: [
          { lead: "Name your population.", text: "Say who or what you're studying." },
          { lead: "Narrow the scope.", text: "Limit it by place, time or group so it's answerable." },
          { lead: "Avoid yes/no questions.", text: "Ask how, why or to what extent instead." },
          { lead: "Match your method.", text: "Make sure your data can actually answer it." },
          { lead: "Search the literature.", text: "Check it hasn't been fully answered already." },
          { lead: "Ask your supervisor.", text: "Get approval before you start the research." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "The generator gets you to a strong starting question, but the research, writing, citations and formatting are where the work is. If time is short or the paper is high-stakes, a ScholarlyHelp writer can take it on, for assignments of any size.",
        callout: {
          lead: "Got the question but not the time?",
          text: "Get a free quote from an expert writer.",
        },
      },
      {
        heading: "Using AI tools responsibly in research",
        body: "Check your course's rules on AI tools before using them for graded work, and disclose AI assistance when it's required. Make sure the research, analysis and conclusions in your paper are your own.",
      },
    ],
  },

  related: ["citation", "essay", "paraphraser", "study"],

  faq: {
    title: "Frequently Asked Questions",
    subtitle: "FAQ — Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. You can use our AI research question generator free to create focused questions, then sign up for a free ScholarlyHelp account to save your work and access it anytime.",
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
  },

  finalCta: {
    titleStart: "Your paper",
    titlePill: "deadline",
    titleEnd: "will not wait.",
    body: "Begin with a free research question generator, or speak to a writer today.",
  },
};
