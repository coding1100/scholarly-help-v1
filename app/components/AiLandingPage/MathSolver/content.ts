import type { ToolLandingContent } from "../ToolLanding/types";

export const mathSolverContent: ToolLandingContent = {
  hero: {
    badge: "3,506 students solved a problem this week",
    titleTop: "Solve Every Problem.",
    titleAccent: "Understand Every Step.",
    subtitle:
      "Type in your problem or upload a photo, and get a clear answer with every step explained, not just the final number.",
    steps: ["Add your problem", "Read the steps", "Practice and learn"],
    toolId: "math-solver-tool",
  },
  beforeAfter: {
    eyebrow: "Before vs after",
    title: "From confusing word problems to step-by-step solutions.",
    subtitle: "Paste your math problem and get instant, detailed answers.",
    pasteLabel: "Original (What you paste)",
    pasteText:
      "Find the derivative of f(x) = 3x² + 5x - 2 and evaluate the slope when x equals four.",
    pasteHtml:
      "Find the derivative of <i>f(x) = 3x² + 5x - 2</i> and evaluate the slope when <i>x</i> equals four.",
    resultLabel: "Solved (What you get)",
    resultText:
      "1. Identify Function: f'(x) = 3x² + 5x - 2\n2. Apply Power Rule: f'(x) = 6x + 5\n3. Evaluate at x = 4: f'(4) = 6(4) + 5 = 29",
    resultHtml:
      '<p><b>1. Identify Function:</b> <i>f(x) = 3x² + 5x - 2</i></p><p><b>2. Apply Power Rule:</b> <i>f\'(x) = 6x + 5</i></p><p><b>3. Evaluate at x = 4:</b> <i>f\'(4) = 6(4) + 5 = <span class="font-bold text-green-700">29</span></i></p>',
    tags: [
      { label: "Step-by-Step", className: "bg-green-100 text-green-800" },
      { label: "Power Rule Applied", className: "bg-purple-100 text-purple-800" },
      { label: "Instant Answer", className: "bg-blue-100 text-blue-800" },
    ],
  },
  useCases: {
    eyebrow: "Use cases",
    title: "Your Personal STEM Tutor",
    subtitle:
      "Get step-by-step solutions for math, physics, chemistry, and science problems.",
    cards: [
      {
        icon: "🧩",
        title: "Stuck on a problem",
        description:
          "Break difficult questions into clear steps and learn how to reach the correct answer with confidence.",
      },
      {
        icon: "📷",
        title: "Handwritten notes",
        description:
          "Upload handwritten notes or worksheets and get clear step-by-step explanations within seconds.",
      },
      {
        icon: "📝",
        title: "Exam preparation",
        description:
          "Review difficult topics with simple explanations and clear concept summaries before your next exam or quiz.",
      },
      {
        icon: "📈",
        title: "Clear Explanations",
        description:
          "Understand complex data and breakdowns with detailed notes that make every solution easier to follow.",
      },
      {
        icon: "💡",
        title: "Learning from mistakes",
        description:
          "Learn why mistakes happen, avoid common errors, and build stronger problem-solving skills with every answer.",
      },
      {
        icon: "∑",
        title: "Typing equations",
        description:
          "Type formulas, fractions, and equations easily using the built-in symbol keyboard without formatting problems.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "Solve problems in 4 steps",
    steps: [
      {
        title: "Enter your question",
        description:
          "Type your problem or upload a photo to get an instant solution.",
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
        description:
          "Review every step, then copy your solution when you're ready.",
      },
    ],
    ctaTitle: "Want access to all ScholarlyHelp tools?",
    ctaBody:
      "Sign up free to access the math solver, paraphraser, summarizer, citation tool, and more from one dashboard.",
    ctaButton: "Explore all tools →",
    ctaHref: "/tools",
  },
  whyItWorks: {
    eyebrow: "Why it works",
    title: "Learn while you solve",
    subtitle:
      "Every answer includes clear step-by-step explanations, not just the final result.",
    features: [
      {
        icon: "🪜",
        title: "Step-by-step solutions",
        description:
          "Every answer is explained through simple, easy-to-follow steps with detailed breakdowns.",
      },
      {
        icon: "🧪",
        title: "Built for all STEM fields",
        description:
          "Solve questions across math, physics, chemistry, and problem sets.",
      },
      {
        icon: "📤",
        title: "Type or upload work",
        description:
          "Type your question, use custom keyboards, or upload handwritten notes.",
      },
    ],
  },
  twoWays: {
    eyebrow: "How to get help",
    title: "Two ways to get the answer",
    subtitle:
      "Work it out with the free tool, or ask an expert to solve it for you.",
    freeColumn: {
      heading: "Free tool, do it yourself",
      subheading: "Easy to start.",
      steps: [
        {
          title: "Add your problem",
          description: "Type your question or upload a photo to get started.",
        },
        {
          title: "Choose a subject",
          description: "Pick a subject, or let Auto-detect choose it for you.",
        },
        {
          title: "View the solution",
          description:
            "Follow each step to understand the solution.",
        },
        {
          title: "Practice and learn",
          description: "Review the solutions and practice with confidence.",
        },
      ],
    },
    expertColumn: {
      heading: "Expert help, done for you",
      subheading: "A free quote in about two minutes →",
      steps: [
        {
          title: "Share your brief",
          description: "Share the full assignment plus the deadline you have.",
        },
        {
          title: "Get matched to an expert",
          description: "We will match you with your subject specialist.",
        },
        {
          title: "Follow the working",
          description: "Ask questions and follow the steps as they form here.",
        },
        {
          title: "Receive and review",
          description: "Download the full solution with free edits if needed.",
        },
      ],
    },
  },
  watchVideo: {
    eyebrow: "Watch video",
    title: "How to Solve Any Math or STEM Problem Instantly (Step-by-Step)",
    youtubeEmbedUrl: "https://www.youtube.com/embed/02XHsyMdb98",
  },
  reviews: {
    eyebrow: "Student reviews",
    title: "What students say about this tool",
    reviews: [
      {
        quote:
          "I used to just copy answers and stay confused. Seeing every step laid out actually taught me how to do the triangles myself, so my test went far better than usual.",
        author: "Kayla R.",
        detail: "Engineering, Purdue — 1st year",
      },
      {
        quote:
          "Taking a photo of the question is so much easier than typing symbols. I snapped my physics homework and it worked through the whole thing clearly, step by step.",
        author: "Omar S.",
        detail: "Physics, University of Manchester — 2nd year",
      },
      {
        quote:
          "English is my second language and word problems are hard for me. Having each step written out in plain words helps me follow the method, not just the answer.",
        author: "Lin H.",
        detail: "Chemistry, UBC — Final year",
      },
    ],
  },
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
  footer: {
    titleStart: "Understand the problem,",
    titlePill: "not just the answer.",
    body: "Solve your first problem free in under a minute, or ask a tutor for a hand.",
    primaryButton: "Solve a problem free",
    primaryHref: "#math-solver-tool",
    secondaryButton: "Ask a tutor →",
    secondaryHref: "/contact-us",
  },
};

export const mathSolverMeta = {
  title: "Free Math Solver | ScholarlyHelp",
  description:
    "The free ScholarlyHelp math solver works out maths, physics, and chemistry problems step by step. Type it in or upload a photo.",
};
