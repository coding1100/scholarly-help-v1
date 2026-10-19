// Copy for the /tools/citation-generator landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const citationGeneratorLanding: LandingContent = {
  toolName: "Citation Generator",
  toolAnchorId: "citation-tool",
  placement: "citation_landing",

  hero: {
    titleLead: "Make Citations in Seconds with",
    titleAccent: "Our Citation Generator",
    subtitle:
      "Paste a DOI, URL, or source details, and our free citation generator creates accurate APA, MLA, Harvard, or Chicago references in seconds, with in-text citations included.",
  },

  cta: {
    expert: "Get expert help",
    tool: "Generate a citation for free",
    toolShort: "Cite free",
  },

  whatIs: {
    title: "What is a citation generator?",
    paragraphs: [
      "A citation generator turns a source's details into a correctly formatted reference, so you don't have to look up the rules for every author, date and title in your chosen style.",
      "Make accurate academic citations in seconds with the ScholarlyHelp citation generator. Get properly formatted references in APA, MLA, Chicago, or Harvard for books, websites, journals, and articles with in-text citations included. Paste a DOI or URL, upload a PDF, or type the details yourself.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Styles", value: "APA, MLA, Harvard, Chicago" },
      { label: "Sources", value: "Books, websites, journals, articles" },
      { label: "Autofill", value: "DOI, URL, PDF or title search" },
      { label: "Output", value: "Reference plus in-text citation" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Every student has a reference list to build",
    subtitle:
      "Whether you are rushing or planning, this free citation generator handles every source type in seconds.",
    cards: [
      {
        title: "Reference list due tonight",
        description:
          "Paste a DOI or URL and get a correctly formatted citation in seconds, without checking style rules yourself.",
      },
      {
        title: "Your literature review",
        description:
          "Use the APA citation generator to create a consistent bibliography without checking formatting rules for every source.",
      },
      {
        title: "Thesis or dissertation",
        description:
          "Keep every chapter consistent with the Chicago style citation generator for footnotes and bibliography entries from start to finish.",
      },
      {
        title: "A PDF you found online",
        description:
          "Upload a PDF and let the tool extract author, title, date, and journal details without retyping every source field.",
      },
      {
        title: "Switching citation styles",
        description:
          "Need MLA instead of APA? The free MLA citation generator reformats your references without rebuilding the list from scratch.",
      },
    ],
    ctaCard: {
      title: "Got 50+ sources?",
      description: "Our editors can check your whole bibliography for consistency.",
    },
  },

  examples: {
    title: "Citation examples by source type",
    subtitle: "Source details in, an APA 7 reference out.",
    items: [
      {
        title: "Book",
        before:
          "Understanding Climate Policy by Jane Smith, published by Oxford University Press in 2021.",
        after: "Smith, J. (2021). Understanding climate policy. Oxford University Press.",
      },
      {
        title: "Journal article",
        before:
          "“Sleep and memory in college students” by Ana Lopez and Ben Carter, Journal of Student Health, volume 12, issue 3, pages 45 to 58, 2022.",
        after:
          "Lopez, A., & Carter, B. (2022). Sleep and memory in college students. Journal of Student Health, 12(3), 45–58.",
      },
      {
        title: "Web page",
        before:
          "“Study tips for online learners” by Learning Hub, published March 4, 2024, at example.org/study-tips.",
        after:
          "Learning Hub. (2024, March 4). Study tips for online learners. https://example.org/study-tips",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "From source to citation in 4 steps",
    steps: [
      {
        title: "Choose a style first",
        description:
          "Select APA, MLA, Harvard, or Chicago from the dropdown before adding your source to begin creating your citation.",
      },
      {
        title: "Pick the source type",
        description:
          "Choose a book, website, journal, or another source type; the tool adjusts the required fields automatically.",
      },
      {
        title: "Autofill or type it",
        description:
          "Add a DOI, URL, or PDF and let the citation generator fill in the source details, or enter them manually.",
      },
      {
        title: "Save your citations",
        description:
          "Add your email to save your work and unlock your free ScholarlyHelp dashboard, with every citation stored and organised by project.",
      },
    ],
  },

  comparison: {
    title: "Citation generator vs formatting by hand vs copying from a database",
    subtitle: "Each way gets you a reference. Here's how they compare.",
    columns: ["Citation generator", "Formatting by hand", "Copying from a database"],
    highlight: "Academic editor",
    rows: [
      {
        label: "Follows the style rules",
        values: ["Yes", "If you know them", "Sometimes"],
        highlight: "Checked by an editor",
      },
      {
        label: "In-text citation included",
        values: ["Yes", "You write it", "Rarely"],
        highlight: "Yes",
      },
      {
        label: "Checks the whole list",
        values: ["No, one source at a time", "Yes, slowly", "No"],
        highlight: "Yes, for consistency",
      },
      {
        label: "Cost",
        values: ["Free", "Free", "Free"],
        highlight: "Free quote",
        highlightLink: "get a quote",
      },
    ],
  },

  limits: {
    title: "What a citation generator can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Judge the source",
        description:
          "It formats a reference. It can’t tell you whether the source supports your point.",
      },
      {
        title: "Fix wrong details",
        description:
          "If autofill pulls a wrong date or author, the citation is wrong too. Check it.",
      },
      {
        title: "Know your course's rules",
        description:
          "Some courses want a specific edition or local version of a style. Follow theirs.",
      },
      {
        title: "Check your whole list",
        description:
          "It works one source at a time. Consistency across the list is on you.",
      },
    ],
    note: {
      before: "For a complete bibliography checked end to end, ",
      linkLabel: "get help from an academic editor",
      after: ".",
    },
  },

  expertBand: {
    tag: "Got 50+ sources to cite?",
    tagline: "Generators format sources. Editors check the whole list.",
    titleStart: "Get a real editor to",
    titleAccent: "check your whole bibliography",
    checks: [
      "Any length, no source limit",
      "Every style covered",
      "Checked for consistency",
    ],
    note: "Free quote in 2 minutes",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to cite sources correctly (and avoid easy lost marks)",
    intro:
      "Citations are some of the easiest marks to lose and the easiest to keep. A generator does the formatting; these habits cover the rest.",
    sections: [
      {
        heading: "Where citation marks get lost",
        body: "Most citation mistakes aren't about the style itself. They're missing in-text citations, references that don't match the in-text ones, details copied wrongly from a database, and a list that switches between styles halfway through. All of these are easy to catch with one careful pass before you submit.",
      },
      {
        heading: "6 habits for a clean reference list",
        steps: [
          { lead: "Pick the style first.", text: "Check which style and edition your course requires." },
          { lead: "Cite as you write.", text: "Add each reference when you use the source, not at the end." },
          { lead: "Check autofilled details.", text: "Compare author, date and title with the source itself." },
          { lead: "Match in-text and list.", text: "Every in-text citation needs a reference, and every reference an in-text citation." },
          { lead: "Keep one style.", text: "Don't mix APA and MLA entries in the same list." },
          { lead: "Order the list.", text: "Most styles sort references alphabetically by author." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A generator formats one source at a time. For a dissertation or research paper with dozens of sources, the risk is inconsistency across the whole list. A ScholarlyHelp academic editor can review every entry for accuracy, formatting and consistency before you submit.",
        callout: {
          lead: "Long reference list?",
          text: "Get your whole bibliography checked by an editor.",
        },
      },
      {
        heading: "Citing responsibly",
        body: "Cite every source you quote, paraphrase or draw an idea from, not only direct quotations. When you're unsure whether something needs a citation, cite it, and check your course's rules on referencing AI tools if you used any.",
      },
    ],
  },

  related: ["researchQuestion", "essay", "paraphraser", "grammar"],

  faq: {
    title: "Frequently Asked Questions",
    subtitle: "FAQ — Common questions about this tool",
    items: [
      {
        question: "Is this citation generator really free?",
        answer:
          "Yes! ScholarlyHelp's Citation Generator is 100% free to use. Create citations in seconds.",
      },
      {
        question: "Which citation styles are supported?",
        answer:
          "The tool supports APA citation generator, MLA citation generator, Harvard, and Chicago citation generators four widely used academic styles.",
      },
      {
        question: "How does autofill find the source details?",
        answer:
          "Paste a DOI or URL, upload a PDF, or search by title. Our AI citation generator retrieves your source details automatically and formats the citation instantly.",
      },
      {
        question: "Can I create both full and in-text citations?",
        answer:
          "Yes. A full citation gives all the source details in your reference list, while an in-text citation briefly identifies the source in your paper. Our citation generator supports APA, Chicago, and MLA format citation generator options for creating both.",
      },
      {
        question: "What if autofill cannot find my source?",
        answer:
          "Enter the source details manually, and the tool formats your citation correctly. Manual entry works with the citation generator MLA, APA, Harvard, and Chicago modes.",
      },
      {
        question: "What if I need my whole bibliography checked?",
        answer:
          "Our academic experts review your complete reference list, whether created with the free citation generator or another tool, for accuracy, formatting, and consistency before submission.",
      },
    ],
  },

  finalCta: {
    titleStart: "Your",
    titlePill: "reference list",
    titleEnd: "won't format itself.",
    body: "Use the free citation generator to create citations in seconds, or connect with a ScholarlyHelp editor for expert help.",
  },
};
