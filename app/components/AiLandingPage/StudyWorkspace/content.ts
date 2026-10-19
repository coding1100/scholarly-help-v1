// Copy for the /tools/ai-study-workspace landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const studyWorkspaceLanding: LandingContent = {
  toolName: "AI Study Workspace",
  toolAnchorId: "study-workspace-tool",
  placement: "study_workspace_landing",

  hero: {
    titleLead: "Everything You Need to Study Smarter",
    titleAccent: "with AI Study Tools.",
    subtitle:
      "The all-in-one set of free AI study tools that transforms your lectures into notes, summaries, flashcards, quizzes, and a 24/7 AI tutor, helping you study smarter and ace every course.",
  },

  cta: {
    expert: "Get expert help",
    tool: "Start studying for free",
    toolShort: "Study free",
  },

  whatIs: {
    title: "What is an AI study workspace?",
    paragraphs: [
      "An AI study workspace turns your own course material into the things you actually revise from: structured notes, a summary, flashcards and practice quizzes, plus a tutor you can ask about anything that didn't click.",
      "ScholarlyHelp's free study workspace starts from what you upload, so everything it makes is about your course, not a generic textbook. Add a PDF, document, text or link, and each topic gets its own saved session you can come back to before the next quiz or exam.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Add", value: "PDFs, documents, text or links" },
      { label: "Creates", value: "Notes, summaries, flashcards, quizzes" },
      { label: "AI tutor", value: "Answers from your material" },
      { label: "Sessions", value: "Saved automatically" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "An AI Study workflow for every situation.",
    subtitle: "Learn faster. Understand deeper. Stress less.",
    cards: [
      {
        title: "The exam is tomorrow",
        description:
          "With the ai study tool free, turn your lecture notes into study notes, flashcards, quizzes, and a mock test before the exam.",
      },
      {
        title: "A lecture you missed",
        description:
          "Missed an important lecture? Our AI notes generator turns slides or transcripts into clear, structured notes you can follow easily.",
      },
      {
        title: "Active recall drills",
        description:
          "Need to test what you remember? The AI flashcard generator and quiz mode create questions directly from your own study material.",
      },
      {
        title: "Too shy to ask aloud",
        description:
          "Have a question you feel shy asking? The AI tutor gives you a focused answer based on the material you uploaded.",
      },
      {
        title: "Setting a study plan",
        description:
          "Want to study smart? Keep each topic in its own session and return to any subject whenever you need another round of revision.",
      },
    ],
    ctaCard: {
      title: "A whole course to handle?",
      description:
        "The workspace preps you. An expert can manage the coursework.",
    },
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "Turn tough lectures into a smart study session",
    steps: [
      {
        title: "Upload your notes",
        description:
          "Start with PDFs, text, or links and bring your study material into one interactive session.",
      },
      {
        title: "Generate Assets",
        description:
          "Turn your material into summaries, AI flashcard generator sets, quizzes, and AI notes.",
      },
      {
        title: "Chat with AI",
        description:
          "Ask your AI tutor questions about the material and get help with confusing topics as you study.",
      },
      {
        title: "Save your session",
        description:
          "Keep each study session in your dashboard so you can return to your notes anytime.",
      },
    ],
  },

  comparison: {
    title: "Study workspace vs re-reading notes vs a general AI chat",
    subtitle: "Each way of studying works differently. Here's how they compare.",
    columns: ["AI study workspace", "Re-reading notes", "General AI chat"],
    highlight: "Expert help",
    rows: [
      {
        label: "Builds flashcards and quizzes",
        values: ["Yes, from your material", "No", "If you ask"],
        highlight: "Custom study guides",
      },
      {
        label: "Answers from your course",
        values: ["Yes", "No", "Not always"],
        highlight: "Yes",
      },
      {
        label: "Keeps each subject saved",
        values: ["Yes", "In your notes", "No"],
        highlight: "Managed for you",
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
    title: "What an AI study workspace can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Do the studying",
        description:
          "It makes the materials. Recall practice is still on you.",
      },
      {
        title: "Fill gaps in your upload",
        description:
          "The tutor answers from your material, so anything missing from it stays missing.",
      },
      {
        title: "Replace your lectures",
        description:
          "Notes are a summary. Go back to the source for anything that matters.",
      },
      {
        title: "Guarantee a grade",
        description:
          "Good prep helps, but results depend on how much you practise.",
      },
    ],
    note: {
      before: "For full courses and complex assignments, ",
      linkLabel: "get help from an expert",
      after: ".",
    },
  },

  expertBand: {
    tag: "Need more than quick summaries?",
    tagline: "Tools prep you. Experts manage the coursework.",
    titleStart: "Get a real expert to",
    titleAccent: "handle it for you",
    checks: [
      "Full courses and complex assignments",
      "Custom study guides",
      "Any deadline",
    ],
    note: "Free quote in 2 min",
    rating: "Rated 4.6/5 based on 1000+ reviews",
  },

  guide: {
    title: "How to study smarter with your own material",
    intro:
      "Generating notes and flashcards is the easy part. What makes them work is how you use them. These habits get more out of every session.",
    sections: [
      {
        heading: "Why re-reading doesn't stick",
        body: "Re-reading notes feels productive because the material looks familiar, but recognising something isn't the same as recalling it. Testing yourself, spacing your reviews over days and explaining ideas in your own words all build memory far better than another read-through.",
      },
      {
        heading: "6 habits for a better study session",
        steps: [
          { lead: "Upload early.", text: "Start a session as soon as the lecture is posted." },
          { lead: "Quiz before you read.", text: "Trying first shows you what you don't know yet." },
          { lead: "Space your reviews.", text: "Come back to the same session over several days." },
          { lead: "Ask the tutor why.", text: "Go past the definition to the reason behind it." },
          { lead: "Explain it back.", text: "Summarise each topic in your own words." },
          { lead: "One topic per session.", text: "Keep subjects separate so you can revise them later." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "The workspace helps you prepare, but it can't take a course for you. If you're juggling full-time work with a heavy course load, or an assignment is bigger than the time you have, a ScholarlyHelp expert can manage the coursework on any deadline.",
        callout: {
          lead: "Falling behind on a course?",
          text: "Get a free quote from an expert.",
        },
      },
      {
        heading: "Using AI study tools responsibly",
        body: "Study tools are for your own learning. For anything graded, check your syllabus or ask your instructor what is allowed, and make sure the work you hand in is your own.",
      },
    ],
  },

  related: ["math", "coursePlanner", "essay", "paraphraser"],

  faq: {
    title: "FAQ",
    subtitle: "FAQ: Common questions about this tool",
    items: [
      {
        question: "Is this really free?",
        answer:
          "Yes, all the AI study tools inside the workspace are completely free for students.",
      },
      {
        question: "How can we start a study session?",
        answer:
          "Upload your file, name your session, and click start. Our AI study tool free feature instantly creates notes, summaries, flashcards, and quizzes from your uploaded material.",
      },
      {
        question: "How does the tutor work?",
        answer:
          "The AI tutor reads strictly from your uploaded file and answers only from what it finds there, so every response stays accurate, focused, and relevant to your actual material.",
      },
      {
        question: "Can I keep my sessions?",
        answer:
          "Your sessions are automatically saved with all generated notes, cards, and chat history. Access and organize everything anytime right from your sidebar.",
      },
      {
        question: "What can I upload?",
        answer:
          "You can upload PDFs, documents, and text files, or use the Summarize PDF AI feature on any article or web link you paste directly into the workspace.",
      },
    ],
  },

  finalCta: {
    titleStart: "Your",
    titlePill: "exam",
    titleEnd: "won't wait",
    body: "Use the free AI study tools to start prepping in 30 seconds, or connect with an expert tutor right now and study smarter from this moment on.",
  },
};
