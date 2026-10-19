// Copy for the /tools/ai-math-solver landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const mathSolverLanding: LandingContent = {
  toolName: "Math Solver",
  toolAnchorId: "math-solver-tool",
  placement: "math_solver_landing",

  hero: {
    titleLead: "Stuck on a math problem?",
    titleAccent: "See exactly how to solve it.",
    subtitle:
      "Working full-time and back in school? Algebra, statistics, dosage calc and business math, explained in plain English in seconds.",
  },

  cta: {
    expert: "Ask a tutor",
    tool: "Solve a problem free",
    toolShort: "Solve free",
  },

  whatIs: {
    title: "What is an AI math solver?",
    paragraphs: [
      "An AI math solver works through a problem step by step and explains each step, not just the final number. It's built for learning the method, so you can solve the next problem on your own.",
      "ScholarlyHelp's free math solver handles math, physics and chemistry. Type your question, use the built-in symbol keyboard, or upload a photo of handwritten or printed work. Pick a subject or let Auto-detect choose, then follow the full working, including common mistakes and the core concept behind each step.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Subjects", value: "Math, physics, chemistry" },
      { label: "Input", value: "Typing, symbol keyboard or a photo" },
      { label: "Output", value: "Full step-by-step working" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Your Personal STEM Tutor",
    subtitle:
      "Get step-by-step solutions for math, physics, chemistry, and science problems.",
    cards: [
      {
        title: "Stuck on a problem",
        description:
          "Break difficult questions into clear steps and learn how to reach the correct answer with confidence.",
      },
      {
        title: "Handwritten notes",
        description:
          "Upload handwritten notes or worksheets and get clear step-by-step explanations within seconds.",
      },
      {
        title: "Exam preparation",
        description:
          "Review difficult topics with simple explanations and clear concept summaries before your next exam or quiz.",
      },
      {
        title: "Learning from mistakes",
        description:
          "Learn why mistakes happen, avoid common errors, and build stronger problem-solving skills with every answer.",
      },
      {
        title: "Typing equations",
        description:
          "Type formulas, fractions, and equations easily using the built-in symbol keyboard without formatting problems.",
      },
    ],
    ctaCard: {
      title: "A whole course on ALEKS?",
      description:
        "One problem is easy. 40 a week isn't. A math expert can take the class off your plate.",
    },
  },

  examples: {
    title: "Math solver examples by subject",
    subtitle: "See the kind of working you get back for different problems.",
    items: [
      {
        title: "Calculus",
        before:
          "Find the derivative of f(x) = 3x² + 5x − 2 and evaluate the slope when x = 4.",
        after:
          "Apply the power rule: f′(x) = 6x + 5. Substitute x = 4: f′(4) = 6(4) + 5 = 29.",
      },
      {
        title: "Statistics",
        before: "Find the mean of 4, 8, 6, 10 and 7.",
        after: "Add the values: 4 + 8 + 6 + 10 + 7 = 35. Divide by 5: the mean is 7.",
      },
      {
        title: "Dosage calculation",
        before: "Order: 250 mg. Available: 500 mg in 5 mL. How many mL do you give?",
        after: "Dose ÷ strength × volume: 250 ÷ 500 × 5 mL = 2.5 mL.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "Solve problems in 4 steps",
    steps: [
      {
        title: "Enter your question",
        description: "Type your problem or upload a photo to get an instant solution.",
      },
      {
        title: "Choose your subject",
        description:
          "Choose Math, Physics, Chemistry, Triangle Solver, or use Auto-detect.",
      },
      {
        title: "Solve the problem",
        description:
          "Click Solve & Explain to generate a step-by-step solution with full working.",
      },
      {
        title: "Review or copy",
        description: "Review every step, then copy your solution when you're ready.",
      },
    ],
  },

  comparison: {
    title: "Math solver vs calculator vs searching for the answer",
    subtitle: "Each one helps in a different way. Here's when to use which.",
    columns: ["Math solver", "Basic calculator", "Searching online"],
    highlight: "Math expert",
    rows: [
      {
        label: "Shows each step",
        values: ["Yes", "No", "Sometimes"],
        highlight: "Yes",
      },
      {
        label: "Explains the method",
        values: ["Yes", "No", "Rarely"],
        highlight: "Yes, for your course",
      },
      {
        label: "Best for",
        values: ["Learning how to solve it", "Quick arithmetic", "Checking a final answer"],
        highlight: "Whole problem sets and courses",
      },
      {
        label: "Cost on ScholarlyHelp",
        values: ["Free", "Free", "Free"],
        highlight: "Free quote",
        highlightLink: "ask a tutor",
      },
    ],
  },

  limits: {
    title: "What a math solver can't do",
    subtitle: "Know the limits so you use it the right way.",
    items: [
      {
        title: "Replace practice",
        description:
          "Reading a solution isn't the same as doing one. Try the next problem yourself.",
      },
      {
        title: "Read every photo",
        description:
          "Blurry or cut-off images can be misread. Check the problem it solved.",
      },
      {
        title: "Know your course's method",
        description:
          "Your instructor may expect a specific method or notation. Follow theirs.",
      },
      {
        title: "Take your exam",
        description:
          "On test day it's you. Use it to learn the steps, not to skip them.",
      },
    ],
    note: {
      before: "For whole problem sets or a full course, ",
      linkLabel: "ask a math expert",
      after: ".",
    },
  },

  expertBand: {
    tag: "Whole problem sets?",
    tagline: "Tools solve problems. Experts take the class.",
    titleStart: "Get a math expert to",
    titleAccent: "take it off your plate",
    checks: [
      "ALEKS, MyMathLab and problem sets",
      "Math, physics and chemistry",
      "Step-by-step working",
    ],
    note: "Free quote in about two minutes",
  },

  guide: {
    title: "How to actually learn from a worked solution",
    intro:
      "A step-by-step answer is only useful if you can do the next one yourself. Use these habits to turn every solution into practice.",
    sections: [
      {
        heading: "Why reading solutions isn't enough",
        body: "Following a worked example feels like understanding, but recognising a step is easier than producing it. That's why problems that looked clear in a solution feel hard on a quiz. The fix is to use the solution as a check on your own work, not a replacement for it.",
      },
      {
        heading: "6 habits that make the steps stick",
        steps: [
          { lead: "Try it first.", text: "Attempt the problem before you look at the steps." },
          { lead: "Find where you went wrong.", text: "Compare your working with the solution, line by line." },
          { lead: "Name the method.", text: "Write down which rule or formula each step uses." },
          { lead: "Redo it blind.", text: "Close the solution and solve the same problem again." },
          { lead: "Change the numbers.", text: "Solve a variation to check you can apply the method." },
          { lead: "Check the units.", text: "Especially in physics, chemistry and dosage calculations." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "One problem is easy; forty a week on ALEKS or MyMathLab on top of a full-time job isn't. If the workload is the problem, not the method, a ScholarlyHelp math expert can take the class off your plate, so you keep your grade and your evenings.",
        callout: {
          lead: "Behind on a math course?",
          text: "Get a free quote from a math expert.",
        },
      },
      {
        heading: "Using AI tools responsibly in school",
        body: "Check your syllabus or ask your instructor what is allowed before using AI tools on graded work. Use the solver to learn the method, and make sure the work you hand in is your own.",
      },
    ],
  },

  related: ["study", "coursePlanner", "essay", "citation"],

  faq: {
    title: "FAQ",
    subtitle: "Common questions about this tool",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. The Math Solver is free to use. Sign up for a free ScholarlyHelp account and access all ScholarlyHelp tools anytime, anywhere.",
      },
      {
        question: "What subjects does it cover?",
        answer:
          "It handles math, physics, and chemistry. The Triangle Solver solves right-angled triangles using the Pythagorean theorem, and the STEM Solver tackles broader problems across all three subjects.",
      },
      {
        question: "How does this tool work? Can I upload pictures?",
        answer:
          "Yes. Type your question, use the built-in keyboard, or upload a clear photo of handwritten or printed work, and the tool solves it step by step.",
      },
      {
        question: "Does it show the steps or just the answer?",
        answer:
          "It shows the full working: the steps, mistakes students commonly make, and core concept explanations, not just the final answer. The goal is to help you master the method so you can tackle the next problem independently.",
      },
      {
        question: "What if I am still stuck?",
        answer:
          "ScholarlyHelp also has math and science tutors. If a problem or a whole assignment is giving you trouble, an expert can work through it with you, step by step.",
      },
    ],
  },

  finalCta: {
    titleStart: "Understand the problem,",
    titlePill: "not just the answer.",
    body: "Solve your first problem free in under a minute, or ask a tutor for a hand.",
  },
};

export const mathSolverMeta = {
  title: "AI Math Solver: Free & Online | ScholarlyHelp",
  description:
    "Stuck on a math problem? An AI math solver gives step-by-step solutions from typed questions or uploaded photos, with clear explanations. Solve it now.",
};
