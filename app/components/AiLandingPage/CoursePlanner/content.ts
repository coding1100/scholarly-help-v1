// Copy for the /tools/ai-course-planner landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import type { LandingContent } from "../Template/types";

export const metaContent = {
  title: "Free Course Planner | ScholarlyHelp",
  description:
    "Build your semester with the free ScholarlyHelp course planner. Describe your ideal week, and it builds a conflict-free schedule.",
};

export const coursePlannerLanding: LandingContent = {
  toolName: "Course Planner",
  toolAnchorId: "course-planner-tool",
  placement: "course_planner_landing",

  hero: {
    titleLead: "Build your semester with our free",
    titleAccent: "course planner.",
    subtitle:
      "Add your courses, describe your ideal week, and get a conflict-free schedule you can adjust by chat.",
  },

  cta: {
    expert: "Talk to an advisor",
    tool: "Build my schedule for free",
    toolShort: "Plan free",
  },

  whatIs: {
    title: "What is an AI course planner?",
    paragraphs: [
      "An AI course planner builds a class schedule from the courses you need and the week you want. Instead of checking section times against each other by hand, you describe your preferences in plain language and it finds a timetable that fits together.",
      "ScholarlyHelp's free course planner works from your own course details: upload a syllabus or PDF, paste text, add a course manually, or reuse one from a past semester. Ask for changes by chat, compare other options, and once term starts it helps track attendance and adjust when plans change.",
    ],
    glance: [
      { label: "Price", value: "Free" },
      { label: "Account", value: "Not needed to build a schedule" },
      { label: "Add courses", value: "Syllabus, text, manual or a past semester" },
      { label: "Changes", value: "Ask in plain language" },
      { label: "During term", value: "Attendance and Adaptive Planning" },
    ],
  },

  useCases: {
    eyebrow: "Use cases",
    title: "Made for building a real semester",
    subtitle: "From a first draft to a full term, this class schedule maker helps.",
    cards: [
      {
        title: "Plan around your life",
        description: "Build around work, travel, study time, or plans outside class.",
      },
      {
        title: "Keep Fridays open",
        description: "Keep a day open for work, family plans, or a weekly routine.",
      },
      {
        title: "Handle busy semesters",
        description: "Fit a full course load into a week that still feels manageable.",
      },
      {
        title: "Choose your instructors",
        description: "Prefer a certain instructor? Tell the planner who you would like.",
      },
      {
        title: "Try different options",
        description: "Compare possible schedules before deciding which one suits you.",
      },
    ],
    ctaCard: {
      title: "Too much on your plate?",
      description:
        "A planner fits your classes in. An expert can take one off your plate.",
    },
  },

  examples: {
    title: "From a wish list to a real week",
    subtitle: "You say what you want in plain words. It plans around it where it can.",
    items: [
      {
        title: "Preferences",
        before:
          "No 8 AM classes, I'd prefer Dr. Ahmed for Statistics, and I want Fridays free.",
        after:
          "A conflict-free week that honours those preferences, with a plain reason for the layout and alternatives to compare.",
      },
      {
        title: "A change mid-plan",
        before: "Swap my Tuesday lab.",
        after:
          "The lab moves to another section, and the rest of the week is reshuffled to still fit.",
      },
      {
        title: "Working full-time",
        before: "I work 9 to 5 on weekdays.",
        after:
          "Evening and weekend sections where your courses offer them, with your working hours kept clear.",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    title: "From courses to a schedule in 4 steps",
    steps: [
      {
        title: "Add your courses",
        description: "Upload your syllabus or paste your course details to get started.",
      },
      {
        title: "Choose your courses",
        description: "Select the courses you need and set your scheduling preferences.",
      },
      {
        title: "Describe your ideal week",
        description: "Tell us what you want, like no early classes or Fridays free.",
      },
      {
        title: "Review and adjust",
        description: "Get your schedule, then ask the AI to make changes until it fits.",
      },
    ],
  },

  comparison: {
    title: "Course planner vs a spreadsheet vs planning on paper",
    subtitle: "Each way gets you a timetable. Here's how they compare.",
    columns: ["Course planner", "Spreadsheet", "Paper planner"],
    highlight: "Real advisor",
    rows: [
      {
        label: "Checks for clashes",
        values: ["Yes", "By hand", "By hand"],
        highlight: "Yes",
      },
      {
        label: "Plans around preferences",
        values: ["Yes, in plain language", "Yes, slowly", "Yes, slowly"],
        highlight: "Yes, talked through",
      },
      {
        label: "Changes in seconds",
        values: ["Yes, by chat", "No", "No"],
        highlight: "By conversation",
      },
      {
        label: "Cost",
        values: ["Free", "Free", "Free"],
        highlight: "Free quote",
        highlightLink: "talk to an advisor",
      },
    ],
  },

  limits: {
    title: "What a course planner can't do",
    subtitle: "Know the limits so you plan the right way.",
    items: [
      {
        title: "Register you",
        description:
          "It plans your week. You still enrol through your school's system.",
      },
      {
        title: "Know every rule",
        description:
          "Prerequisites and degree requirements come from your school. Check them.",
      },
      {
        title: "Hold a seat",
        description:
          "Sections can fill up. Confirm availability before you register.",
      },
      {
        title: "Shrink the workload",
        description:
          "It fits your courses in, but the coursework stays the same.",
      },
    ],
    note: {
      before: "When the semester is more than you can carry, ",
      linkLabel: "talk to an advisor",
      after: ".",
    },
  },

  expertBand: {
    tag: "Too much on your plate?",
    tagline: "Planners build schedules. Experts take on the coursework.",
    titleStart: "Get an expert to",
    titleAccent: "lighten your semester",
    checks: [
      "Classes, exams and assignments",
      "Subject-specialist experts",
      "Free quote, no commitment",
    ],
    note: "Free quote in about two minutes",
  },

  guide: {
    title: "How to build a semester schedule that actually works",
    intro:
      "A schedule with no clashes isn't always a schedule you can keep. These habits help you plan a term that fits your real week.",
    sections: [
      {
        heading: "Why schedules fall apart",
        body: "Most schedules fail on the week, not the timetable: back-to-back classes with no time to travel, labs that collide with work shifts, three exams in the same week. Planning around your real commitments, not just the course list, is what makes a semester survivable.",
      },
      {
        heading: "6 habits for a better semester plan",
        steps: [
          { lead: "Start with fixed hours.", text: "Block out work, commuting and family time first." },
          { lead: "Spread the heavy courses.", text: "Avoid stacking difficult classes on one day." },
          { lead: "Leave buffer time.", text: "Keep gaps between classes for travel and study." },
          { lead: "Check exam weeks.", text: "Look at assessment dates, not only class times." },
          { lead: "Keep a backup.", text: "Save a second option in case a section fills." },
          { lead: "Review in week two.", text: "Adjust early, before drop deadlines pass." },
        ],
      },
      {
        heading: "When a tool isn't enough",
        body: "A planner can fit your courses into a week, but it can't make a full course load lighter. If you're working full-time and the semester is more than you can carry, a ScholarlyHelp expert can take a class, exam or assignment off your plate.",
        callout: {
          lead: "Semester looking heavy?",
          text: "Get a free quote, no commitment.",
        },
      },
      {
        heading: "Planning responsibly",
        body: "Always confirm prerequisites, degree requirements and section availability with your school before you register, and check with an academic advisor if you're unsure a plan meets your program's rules.",
      },
    ],
  },

  related: ["study", "math", "essay", "researchQuestion"],

  faq: {
    title: "Common questions about this tool",
    subtitle: "Everything you need to know about our free AI Course Planner.",
    items: [
      {
        question: "Is this tool really free?",
        answer:
          "Yes. Build your full semester plan for free with no account and get your schedule instantly. Sign up to save sessions and access more ScholarlyHelp tools.",
      },
      {
        question: "How do I add my courses?",
        answer:
          "Four ways: upload a syllabus or PDF, paste text, add a course manually, or retake one from a previous semester. It finds the available sections from what you provide.",
      },
      {
        question: "Can it follow my preferences?",
        answer:
          "Yes. Describe your ideal week in plain language and add must-haves, such as no 8 AM classes or a preferred instructor. It builds your schedule around them where possible.",
      },
      {
        question: "What if I don't like the schedule?",
        answer:
          "View other schedule options, or ask the AI to make a change in plain conversation, like switching an instructor or freeing up a day. It then rebuilds your week.",
      },
      {
        question: "Does it help once term starts?",
        answer:
          "Yes. It tracks attendance from your schedule, while Adaptive Planning notices changes, such as a moved exam, and helps you adjust the rest of your plan.",
      },
    ],
  },

  finalCta: {
    titleStart: "Plan your",
    titlePill: "best semester",
    titleEnd: "yet.",
    body: "Build your schedule for free in under a minute, or plan it with a real advisor.",
  },
};
