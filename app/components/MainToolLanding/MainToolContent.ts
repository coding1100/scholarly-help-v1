import { buildDefaultTabTools } from "./pickTabUtils";

export const defaultAcademicResearchContent = {
  id: "academic-research",
  pageType: "academic-research",
  status: "published",
  meta: {
    title: "AI Academic Research Assistant | Scholarly Academic Research",
    description:
      "Use Scholarly academic research to explore sources, organize notes, write stronger academic drafts, and prepare citation-ready research with confidence.",
    canonicalUrl: "",
  },
  heroSection: {
    badgeText: "16 free AI tools · No account needed",
    headingPrefix: "Stop Staring at a Blank Page Start ",
    highlightWord: "Writing",
    headingSuffix: " Right Now",
    description:
      "<b>Free AI-powered tools</b> for essays, citations, thesis statements, research questions, and more. No account needed. <b>Results in seconds.</b>",
    btn1: "Pick a free tool",
    btn1Url: "#pick-tools",
    btn2: "Need it written? Talk to an expert",
    btn2Url: "/order",
    specs: [
      "No Sign-up Required",
      "Always Free",
      "5M+ Students Helped",
      "100% Private",
    ],
  },
  helpSection: {
    title: "Students helped at",
  },
  pickSection: {
    heading: "Pick one and start instantly",
    description: "No account, no limits, no cost. Click any tool to use it now.",
    tabs: [
      "All tools",
      "Essay writing",
      "Research",
      "Citations",
      "Math & Science",
      "Study tools",
    ],
    showAllButtonText: "Show all 16 tools",
    tools: [
      {
        iconKey: "tmIcon1",
        tag: "POPULAR",
        heading: "AI Essay Generator",
        description:
          "Generate structured, high-quality essays with strong arguments, smooth transitions, and proper academic tone.",
        buttonText: "Generate Essay",
        link: "/tools/essay-outline-tool",
      },
      {
        iconKey: "tmIcon2",
        tag: "FREE",
        heading: "AI Paraphraser",
        description:
          "Rewrite any text instantly while preserving its meaning, improving clarity and originality without losing your argument.",
        buttonText: "Paraphrase text",
        link: "/tools/paraphraser-tool",
      },
      {
        iconKey: "tmIcon3",
        tag: "POPULAR",
        heading: "AI Summarizer",
        description:
          "Condense long papers, PDFs, or articles into clear, digestible key points in seconds. Perfect for research and study notes.",
        buttonText: "Summarize now",
        link: "/tools/summarizer-tool",
      },
      {
        iconKey: "tmIcon4",
        tag: "POPULAR",
        heading: "AI Thesis Generator",
        description:
          "Build a focused, arguable thesis statement for any topic. Adapts to your academic level and discipline.",
        buttonText: "Build thesis",
        link: "/tools/thesis-generator-tool",
      },
      {
        iconKey: "tmIcon1",
        tag: "POPULAR",
        heading: "Citation Generator",
        description:
          "Create accurate citations instantly in APA, MLA, Chicago, Harvard, and more. One click, no manual formatting.",
        buttonText: "Generate citation",
        link: "/tools/citation-tool",
      },
      {
        iconKey: "tmIcon2",
        tag: "FREE",
        heading: "Research Question Generator",
        description:
          "Turn vague topics into precise, measurable research questions at the right academic level for your paper.",
        buttonText: "Generate question",
        link: "/tools/research-question",
      },
      {
        iconKey: "tmIcon3",
        tag: "POPULAR",
        heading: "Essay Title Generator",
        description:
          "Create compelling, research-matched essay titles that signal your main argument and impress from the first line.",
        buttonText: "Generate title",
        link: "/tools/essay-title",
      },
      {
        iconKey: "tmIcon4",
        tag: "POPULAR",
        heading: "Pythagoras Equation Solver",
        description:
          "Instant triangle problem solutions with step-by-step working shown. Understand the method, not just the answer.",
        buttonText: "Solve equation",
        link: "/tools/pythagoras-solver",
      },
    ],
    tabTools: {} as Record<string, import("./pickTabUtils").PickToolItem[]>,
  },
  dashboardSection: {
    badge: "SaaS Dashboard",
    headingLine1: "Your Tools.",
    headingLine2: "All in One Place.",
    description:
      "The free tools are yours forever. But if you're using ScholarlyHelp regularly, the dashboard saves your history, lets you download results, and tracks your usage in one place.",
    ctaButton: "Get free access",
    ctaButtonUrl: "/sign-up",
    features: [
      {
        title: "Save Every Result",
        description: "Revisit Past Essays, Titles, Citations Anytime",
      },
      {
        title: "500 Free Tokens",
        description: "More than enough to try every tool",
      },
      {
        title: "Download Anytime",
        description: "Keep a copy of every result you generate",
      },
    ],
    stats: [
      { value: "4,820", label: "Tokens Remaining" },
      { value: "23", label: "Saved Results" },
      { value: "6", label: "Downloads" },
      { value: "12", label: "Tools Used" },
    ],
    history: [
      { title: "Psychology essay — 1,400 words", time: "2h ago", action: "Save" },
      { title: "APA citation — 8 sources", time: "Yesterday", action: "Save" },
      { title: "Thesis statement — Business ethics", time: "3 days ago", action: "Save" },
    ],
  },
  whySection: {
    heading: "Why use ScholarlyHelp tools?",
    items: [
      {
        heading: "Free & Easy to Use",
        description:
          "No setup or learning curve, just enter your text and get instant results.",
      },
      {
        heading: "Designed for students",
        description:
          "Tools created to support real academic needs with clear, structured output.",
      },
      {
        heading: "AI-powered Accuracy",
        description:
          "Delivers polished, academically aligned results to improve clarity and structure.",
      },
      {
        heading: "100% private & secure",
        description:
          "Your content stays safe; nothing is stored, shared, or reused.",
      },
      {
        heading: "Saves time & improves productivity",
        description:
          "Transforms complex tasks into quick, manageable steps so you work more efficiently.",
      },
      {
        heading: "Improves writing quality",
        description:
          "Helps refine ideas, improve flow, and create clear, well-structured academic content.",
      },
    ],
  },
  cardsSection: {
    cards: [
      {
        iconKey: "MTconfidentiality",
        heading: "100% Confidentiality",
        description: "Nothing you share is ever stored, shared, or reused.",
      },
      {
        iconKey: "MTstudents",
        heading: "Founded by Students",
        description: "Built by people who understand the real academic grind.",
      },
      {
        iconKey: "MTtutors",
        heading: "40+ Master's Tutors",
        description: "A vetted network of qualified academic experts.",
      },
      {
        iconKey: "MTcourse",
        heading: "2,300+ Courses Completed",
        description: "A proven track record across subjects and levels.",
      },
    ],
  },
  faq: [] as { id?: number; question: string; answer: string }[],
};

export type AcademicResearchPageData = typeof defaultAcademicResearchContent;

defaultAcademicResearchContent.pickSection.tabTools = buildDefaultTabTools(
  defaultAcademicResearchContent.pickSection.tools,
);
