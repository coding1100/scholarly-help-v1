import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Grades from "@/app/assets/Images/grades.webp";
import HomeworkImg from "@/app/assets/Images/homework.webp";
import Write from "@/app/assets/Images/write.webp";
import Notes from "@/app/assets/Images/notes.webp";
import GirlWithBoard from "@/app/assets/Images/girlsWithPaperBoard.webp";
import Proof1 from "@/app/assets/Images/proof-1.webp";
import Proof2 from "@/app/assets/Images/proof-2.webp";
import Proof3 from "@/app/assets/Images/proof-3.webp";
import Proof4 from "@/app/assets/Images/proof-4.webp";
import Proof5 from "@/app/assets/Images/proof-5.webp";
import Proof6 from "@/app/assets/Images/proof-6.webp";

interface AssignmentContent {
  btnText: string;
  heroContent: {
    mainHeading: string;
    description: string;
  };
  academic: {
    mainheading: string;
    mainDescription?: string;
    academicContent: Array<{
      icon?: any;
      title?: string;
      description?: string;
      isLast?: boolean;
    }>;
  };
  whyScholarly: {
    mainHeading: string;
    mainDescription: string;
    whyScholarlyContent: Array<{
      id: number;
      icon: string;
      title: string;
      description: string;
    }>;
  };
  excellenceProofContent: Array<{
    img: any;
  }>;
  subjects: {
    mainHeading: string;
    subjectsContent: Array<{
      title: string;
      url?: string;
    }>;
  };
  faqContent: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}

export const assignmentContent: Record<string, AssignmentContent> = {
  accounting: {
    btnText: "Get Accounting Assignment Help",
    heroContent: {
      mainHeading: "Struggling With\nYour Accounting\nAssignment?",
      description: "Experienced accountants ready to complete and explain your assignment tasks.",
    },
    academic: {
      mainheading: "Accounting Assignment Services",
      mainDescription: "Complete solutions for accounting assignments with step-by-step explanations.",
      academicContent: [
        {
          icon: HomeworkImg,
          title: "Problem Solving",
          description: "Accurate solutions for accounting problem sets and cases.",
        },
        {
          icon: Write,
          title: "Report Writing",
          description: "Well-structured assignment reports following academic standards.",
        },
        {
          icon: Grades,
          title: "Plagiarism-Checked",
          description: "Original work with plagiarism checks before delivery.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Assignments?",
      mainDescription: "Qualified experts delivering accurate and on-time assignment solutions.",
      whyScholarlyContent: [
        { id: 1, icon: "Idea", title: "Qualified Writers", description: "Subject-matter experts write and review assignments." },
        { id: 2, icon: "Bulb", title: "Formatting", description: "Assignments formatted to your instructor's guidelines." },
        { id: 3, icon: "Content", title: "Originality", description: "Every submission is original and quality-checked." },
        { id: 4, icon: "LiveChat", title: "Revisions", description: "Free revisions until you're satisfied." },
      ],
    },
    excellenceProofContent: [
      { img: Proof1 },
      { img: Proof2 },
      { img: Proof3 },
      { img: Proof4 },
      { img: Proof5 },
      { img: Proof6 },
    ],
    subjects: {
      mainHeading: "Assignment Subjects We Cover",
      subjectsContent: [
        { title: "Financial Accounting" },
        { title: "Managerial Accounting" },
        { title: "Taxation" },
        { title: "Auditing" },
      ],
    },
    faqContent: [
      { id: 1, question: "Can you complete my assignment?", answer: "Yes, provide instructions and deadline and we'll deliver a fully referenced assignment." },
      { id: 2, question: "Do you follow specific formatting styles?", answer: "Yes, we follow APA, MLA, Chicago, Harvard and other requested styles." },
      { id: 3, question: "Are sources cited?", answer: "All sources are cited and included in a references list." },
    ],
  },
};

export const defaultAssignmentContent: AssignmentContent = {
  btnText: "Get Assignment Help",
  heroContent: {
    mainHeading: "Professional Assignment Help",
    description: "Expert writers and tutors who deliver quality assignments on time.",
  },
  academic: {
    mainheading: "Our Assignment Services",
    mainDescription: "We provide end-to-end assignment help across many subjects.",
    academicContent: [
      { icon: HomeworkImg, title: "Problem Solving", description: "Step-by-step solutions for problem sets." },
      { icon: Write, title: "Essay & Report Writing", description: "High-quality written assignments and reports." },
      { icon: Grades, title: "Quality Checks", description: "Plagiarism and quality checks before delivery." },
      { isLast: true, icon: GirlWithBoard },
    ],
  },
  whyScholarly: {
    mainHeading: "Why Scholarly Help?",
    mainDescription: "Skilled professionals delivering assignment excellence.",
    whyScholarlyContent: [
      { id: 1, icon: "Idea", title: "Experts", description: "Experienced assignment writers." },
      { id: 2, icon: "Bulb", title: "On Time", description: "Deadlines respected." },
      { id: 3, icon: "Content", title: "Original", description: "Plagiarism-free work." },
      { id: 4, icon: "LiveChat", title: "Support", description: "24/7 customer support." },
    ],
  },
  excellenceProofContent: [ { img: Proof1 }, { img: Proof2 }, { img: Proof3 }, { img: Proof4 }, { img: Proof5 }, { img: Proof6 } ],
  subjects: {
    mainHeading: "Subjects We Cover",
    subjectsContent: [
      { title: "Accounting", url: "/assignment/accounting" },
      { title: "Economics", url: "/assignment/economics" },
      { title: "Engineering", url: "/assignment/engineering" },
      { title: "Math", url: "/assignment/math" },
    ],
  },
  faqContent: [
    { id: 1, question: "How do I place an assignment order?", answer: "Send instructions and deadline through our order form or chat." },
    { id: 2, question: "Can I request specific writers?", answer: "Yes, you can request specialists for your topic." },
    { id: 3, question: "What about confidentiality?", answer: "All orders are kept private and secure." },
  ],
};

export const assignmentSubjects = [
  "accounting",
  "anatomy",
  "architecture",
  "biology",
  "chemistry",
  "computer-science",
  "economics",
  "engineering",
  "english",
  "finance",
  "history",
  "human-resource",
  "law",
  "linguistics",
  "marketing",
  "math",
  "nursing",
  "operation-management",
  "organizational-behavior",
] as const;

export type AssignmentSubject = typeof assignmentSubjects[number];

export function getAssignmentContent(subject: AssignmentSubject): AssignmentContent {
  return {
    ...defaultAssignmentContent,
    ...(assignmentContent[subject] as AssignmentContent),
  };
}

export function isValidAssignmentSubject(subject: string): subject is AssignmentSubject {
  return assignmentSubjects.includes(subject as AssignmentSubject);
}
