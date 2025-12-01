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

interface HomeworkContent {
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

export const homeworkContent: Record<string, HomeworkContent> = {
  accounting: {
    btnText: "Get Accounting Homework Help",
    heroContent: {
      mainHeading: "Need Help With\nYour Accounting\nHomework?",
      description: "Professional accounting tutors ready to help you complete homework and exercises.",
    },
    academic: {
      mainheading: "Accounting Homework Services",
      mainDescription: "Expert help for accounting homework across topics and levels.",
      academicContent: [
        {
          icon: HomeworkImg,
          title: "Problem Sets",
          description: "Guided solutions for accounting problems and exercises.",
        },
        {
          icon: Write,
          title: "Homework",
          description: "Complete and accurate homework solutions tailored to your instructions.",
        },
        {
          icon: Grades,
          title: "Exam Prep",
          description: "Practice and revision materials to prepare for tests.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Homework Help?",
      mainDescription: "Experienced tutors who deliver accurate and well-explained homework solutions.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Clear Explanations",
          description: "We provide step-by-step solutions so you learn while we help.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "On-time Delivery",
          description: "Deadlines are respected so you never miss submission dates.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Original Work",
          description: "All solutions are original and checked for quality.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "24/7 Support",
          description: "Contact us anytime to discuss your homework or revisions.",
        },
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
      mainHeading: "Homework Subjects We Cover",
      subjectsContent: [
        { title: "Financial Accounting" },
        { title: "Managerial Accounting" },
        { title: "Cost Accounting" },
        { title: "Tax Accounting" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can you complete my accounting homework for me?",
        answer: "Yes — provide the instructions and deadline, and our tutors will handle the rest.",
      },
      {
        id: 2,
        question: "Do you offer explanations with homework solutions?",
        answer: "Yes, we include step-by-step explanations so you can learn from the delivered work.",
      },
      {
        id: 3,
        question: "Are your solutions plagiarism-free?",
        answer: "All delivered work is original and checked for quality and authenticity.",
      },
    ],
  },
};

// Default content and subjects list (reused from online-class conventions)
export const defaultHomeworkContent: HomeworkContent = {
  btnText: "Get Homework Help",
  heroContent: {
    mainHeading: "Professional Homework Help",
    description: "Get expert assistance completing your homework with clear explanations and on-time delivery.",
  },
  academic: {
    mainheading: "Our Homework Services",
    mainDescription: "We offer reliable homework assistance across many subjects and levels.",
    academicContent: [
      {
        icon: HomeworkImg,
        title: "Assignments",
        description: "Expert help with your homework and problem sets.",
      },
      {
        icon: Write,
        title: "Research & Writing",
        description: "Support for written homework and projects.",
      },
      {
        icon: Grades,
        title: "Exam Preparation",
        description: "Practice materials and solutions to improve performance.",
      },
      {
        isLast: true,
        icon: GirlWithBoard,
      },
    ],
  },
  whyScholarly: {
    mainHeading: "Why Scholarly Help for Homework?",
    mainDescription: "Skilled tutors delivering accurate, timely homework solutions.",
    whyScholarlyContent: [
      { id: 1, icon: "Idea", title: "Trusted Experts", description: "Qualified tutors with subject-matter expertise." },
      { id: 2, icon: "Bulb", title: "Clear Solutions", description: "Step-by-step explanations included." },
      { id: 3, icon: "Content", title: "Plagiarism-Free", description: "Original solutions every time." },
      { id: 4, icon: "LiveChat", title: "Fast Support", description: "Reach us anytime for updates and revisions." },
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
    mainHeading: "Subjects We Cover",
    subjectsContent: [
      { title: "Accounting", url: "/homework/accounting" },
      { title: "Anatomy", url: "/homework/anatomy" },
      { title: "Biology", url: "/homework/biology" },
      { title: "Chemistry", url: "/homework/chemistry" },
      { title: "Math", url: "/homework/math" },
      { title: "Computer Science", url: "/homework/computer-science" },
    ],
  },
  faqContent: [
    { id: 1, question: "How does your homework service work?", answer: "Submit your instructions and deadline, we assign a qualified tutor to complete and deliver your homework." },
    { id: 2, question: "Can I request revisions?", answer: "Yes, revisions are provided to ensure you are satisfied with the solution." },
    { id: 3, question: "Is my data kept private?", answer: "Yes, we respect your privacy and keep all details confidential." },
  ],
};

export const homeworkSubjects = [
  "accounting",
  "anatomy",
  "biology",
  "chemistry",
  "computer-science",
  "economics",
  "engineering",
  "english",
  "finance",
  "history",
  "human-resource",
  "marketing",
  "math",
  "operation-management",
  "philosophy",
  "psychology",
  "statistics",
] as const;

export type HomeworkSubject = typeof homeworkSubjects[number];

export function getHomeworkContent(subject: HomeworkSubject): HomeworkContent {
  return {
    ...defaultHomeworkContent,
    ...(homeworkContent[subject] as HomeworkContent),
  };
}

export function isValidHomeworkSubject(subject: string): subject is HomeworkSubject {
  return homeworkSubjects.includes(subject as HomeworkSubject);
}
