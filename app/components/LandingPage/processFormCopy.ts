import { normalizePathname } from "@/app/lib/takeMyClassLandingRoutes";

export type ProcessFormCopy = { heading: string; description: string };

export const DEFAULT_PROCESS_FORM_COPY: ProcessFormCopy = {
  heading: "Start with step 1 right here",
  description: "Get your tutor match and price by text. Takes 30 seconds.",
};

const SUBJECT_LABELS: Record<string, string> = {
  accounting: "Accounting",
  anatomy: "Anatomy",
  art: "Art",
  biology: "Biology",
  chemistry: "Chemistry",
  "computer-science": "Computer Science",
  economics: "Economics",
  engineering: "Engineering",
  english: "English",
  finance: "Finance",
  geography: "Geography",
  history: "History",
  "human-resource": "Human Resources",
  law: "Law",
  linguistics: "Linguistics",
  marketing: "Marketing",
  math: "Math",
  nursing: "Nursing",
  "operation-management": "Operations Management",
  philosophy: "Philosophy",
  physics: "Physics",
  psychology: "Psychology",
  sociology: "Sociology",
  statistics: "Statistics",
};

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

type ServiceCopy = {
  hub: ProcessFormCopy;
  subject: (label: string) => ProcessFormCopy;
  subjects: string[];
};

const SERVICE_COPY: Record<string, ServiceCopy> = {
  "online-class": {
    hub: {
      heading: "Get Help With Your Online Classes",
      description:
        "Share your course and learning goals to explore personalized class support.",
    },
    subject: (s) => ({
      heading: `Need Support in Your ${s} Class?`,
      description: `Share your ${s} course details to find tailored tutoring and study support.`,
    }),
    subjects: [
      "chemistry", "biology", "economics", "math", "law", "accounting",
      "statistics", "operation-management", "physics", "finance", "nursing",
      "english", "history", "marketing", "engineering", "computer-science",
    ],
  },
  exams: {
    hub: {
      heading: "Need Help Preparing for an Exam?",
      description:
        "Tell us your exam subject and date to explore targeted study support.",
    },
    subject: (s) => ({
      heading: `Preparing for ${article(s)} ${s} Exam?`,
      description: `Tell us your ${s} exam topics and get focused preparation support.`,
    }),
    subjects: [
      "history", "philosophy", "finance", "nursing", "math", "statistics",
      "chemistry", "biology", "economics", "physics", "accounting", "anatomy",
      "law", "sociology", "computer-science", "english",
      "operation-management", "psychology",
    ],
  },
  assignment: {
    hub: {
      heading: "Get Support With Your Assignment",
      description:
        "Describe your assignment topic and requirements to find relevant academic guidance.",
    },
    subject: (s) => ({
      heading: `Need Guidance on ${article(s)} ${s} Assignment?`,
      description: `Share your ${s} assignment brief to get topic-specific academic guidance.`,
    }),
    subjects: [
      "statistics", "finance", "marketing", "math", "computer-science",
      "accounting", "law", "nursing", "english", "economics", "engineering",
      "chemistry", "history", "physics", "human-resource", "sociology",
      "philosophy", "linguistics", "operation-management",
    ],
  },
  homework: {
    hub: {
      heading: "Make Progress on Your Homework",
      description:
        "Tell us the subject and questions you’re stuck on for guided support.",
    },
    subject: (s) => ({
      heading: `Stuck on ${s} Homework?`,
      description: `Share the ${s} problems you’re working on for step-by-step tutoring.`,
    }),
    subjects: [
      "math", "statistics", "chemistry", "accounting", "computer-science",
      "finance", "physics", "biology", "history", "english",
      "operation-management", "philosophy", "law", "engineering",
      "psychology", "nursing", "sociology", "geography", "art", "economics",
    ],
  },
  "essay-writing": {
    hub: {
      heading: "Improve Your Essay With Expert Guidance",
      description:
        "Share your essay prompt for help with outlining, research, and revision.",
    },
    subject: (s) => ({
      heading: `Working on ${article(s)} ${s} Essay?`,
      description: `Share your ${s} essay prompt for help with research, structure, and writing.`,
    }),
    subjects: ["law", "history", "nursing", "psychology", "economics"],
  },
};

const PAGE_COPY: Record<string, ProcessFormCopy> = {
  "/take-my-proctored-exam-for-me": {
    heading: "Get Ready for Your Proctored Exam",
    description:
      "Share your exam format and topics for tailored preparation and tutoring.",
  },
};

/** Heading and description for the process section's quote form on this page. */
export function getProcessFormCopy(pathname: string | null | undefined): ProcessFormCopy {
  const path = normalizePathname(pathname);
  if (PAGE_COPY[path]) return PAGE_COPY[path];

  const [service, subject, ...rest] = path.split("/").filter(Boolean);
  const copy = SERVICE_COPY[service];
  if (!copy || rest.length) return DEFAULT_PROCESS_FORM_COPY;
  if (!subject) return copy.hub;
  return copy.subjects.includes(subject)
    ? copy.subject(SUBJECT_LABELS[subject])
    : DEFAULT_PROCESS_FORM_COPY;
}
