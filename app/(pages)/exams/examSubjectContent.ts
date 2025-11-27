import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Grades from "@/app/assets/Images/grades.webp";
import Homework from "@/app/assets/Images/homework.webp";
import Write from "@/app/assets/Images/write.webp";
import Notes from "@/app/assets/Images/notes.webp";
import GirlWithBoard from "@/app/assets/Images/girlsWithPaperBoard.webp";
import Proof1 from "@/app/assets/Images/examss1.webp";
import Proof2 from "@/app/assets/Images/exam-ss-2.webp";
import Proof3 from "@/app/assets/Images/exam-ss-3.webp";
import Proof4 from "@/app/assets/Images/exam-ss-4.webp";
import Proof5 from "@/app/assets/Images/exam-ss-5.webp";
import Proof6 from "@/app/assets/Images/exam-ss-6.webp";
import Proctored from "@/app/assets/Images/proctored.webp";
import NonProctored from "@/app/assets/Images/nonProctored.webp";

export interface ExamSubjectContent {
  btnText: string;
  heroContent: {
    heading1: string;
    mainHeading: string;
    heading2: string;
    description: string;
  };
  academic: {
    mainheading: string;
    academicContent: {
      icon: any;
      title?: string;
      description?: string;
      isLast?: boolean;
    }[];
  };
  whyScholarly: {
    mainHeading: string;
    mainDescription: string;
    whyScholarlyContent: {
      id: number;
      icon: string;
      title: string;
      description: string;
    }[];
  };
  excellenceProofContent: {
    img: any;
  }[];
  subjects: {
    mainHeading: string;
    subjectsContent: {
      title: string;
      url?: string;
    }[];
  };
  examTypeContent: {
    img: any;
    title: string;
    description: string;
  }[];
  variousNames: {
    mainHeading: string;
    variousNamesContent: {
      title: string;
      desciption: string;
    }[];
  };
  faqContent: {
    id: number;
    question: string;
    answer: string;
  }[];
}

const defaultContent: ExamSubjectContent = {
  btnText: "Get Expert Help",
  heroContent: {
    heading1: "",
    mainHeading: "Get Expert Help with Your Exams",
    heading2: "",
    description: "Professional assistance to help you succeed in your exams",
  },
  academic: {
    mainheading: "Other Academic Services",
    academicContent: [
      {
        icon: ScheduleIcon,
        title: "Online Class",
        description: "Complete assistance with your online class requirements.",
      },
      {
        icon: Homework,
        title: "Assignments",
        description: "Expert help with your subject-specific assignments.",
      },
      {
        icon: Write,
        title: "Homework",
        description: "Professional assistance with your homework tasks.",
      },
      {
        isLast: true,
        icon: GirlWithBoard,
      },
    ],
  },
  whyScholarly: {
    mainHeading: "We Offer Unbeatable Guarantees",
    mainDescription: "Scholarly Help offers comprehensive exam assistance through skilled experts across various subjects.",
    whyScholarlyContent: [
      {
        id: 1,
        icon: "Idea",
        title: "Confidentiality",
        description: "Your privacy and data security are our top priorities.",
      },
      {
        id: 2,
        icon: "Bulb",
        title: "100% Genuine Content",
        description: "All answers and solutions are original and tailored to your needs.",
      },
      {
        id: 3,
        icon: "Content",
        title: "24/7 Customer Care Center",
        description: "Round-the-clock support for all your queries and concerns.",
      },
      {
        id: 4,
        icon: "LiveChat",
        title: "Money-Back Warranty",
        description: "Full refund guarantee if you're not satisfied with our service.",
      },
      {
        id: 5,
        icon: "Plagirism",
        title: "Affordable services",
        description: "Budget-friendly options for students without compromising quality.",
      },
      {
        id: 6,
        icon: "Money",
        title: "Customer Bonuses",
        description: "Special bonuses for first-time and returning customers.",
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
    mainHeading: "Subjects We Work On",
    subjectsContent: [
      { title: "English" },
      { title: "Math" },
      { title: "Anatomy and Physiology" },
      { title: "Statistics", url: "/exams/statistics" },
      { title: "HRM Class" },
      { title: "Operation Management" },
      { title: "Computer Science" },
      { title: "Accounting" },
      { title: "History" },
      { title: "Marketing" },
      { title: "Psychology" },
      { title: "Philosophy" },
      { title: "Law" },
      { title: "Physics" },
      { title: "Biology" },
      { title: "Engineering" },
      { title: "Chemistry" },
      { title: "Finance" },
      { title: "Nursing", url: "/exams/nursing" },
      { title: "Bible" },
      { title: "Organizational Behavior" },
      { title: "Architecture" },
      { title: "Ethics" },
      { title: "Sociology" },
      { title: "Pharmacology" },
      { title: "Economics" },
      { title: "Nutrition" },
      { title: "Linguistics" },
      { title: "Art" },
      { title: "Aviation" },
      { title: "Geography" },
      { title: "Environmental Science" },
    ],
  },
  examTypeContent: [
    {
      img: Proctored,
      title: "Proctored Exams",
      description: "Secure assistance for proctored exams through remote desktop with complete confidentiality.",
    },
    {
      img: NonProctored,
      title: "Non-Proctored Exams",
      description: "Professional assistance with non-proctored exams using secure lockdown browser systems.",
    },
  ],
  variousNames: {
    mainHeading: "Help with Online Exam Under Various Names: You Name It, We Can Do It!",
    variousNamesContent: [
      {
        title: "Quizzes",
        desciption: "Short assessments designed to evaluate specific topics.",
      },
      {
        title: "Tests",
        desciption: "Comprehensive assessments covering broader material.",
      },
      {
        title: "Lockdown Exams",
        desciption: "Secure examinations with enhanced security measures.",
      },
      {
        title: "Job Assessments",
        desciption: "Professional evaluations for job positions.",
      },
      {
        title: "Entrance Exams",
        desciption: "Admission tests for educational institutions.",
      },
      {
        title: "Midterm & Final Exams",
        desciption: "Comprehensive course assessments.",
      },
    ],
  },
  faqContent: [
    {
      id: 1,
      question: "How do you maintain confidentiality during exams?",
      answer: "We follow strict privacy protocols and ensure your information remains secure throughout the process.",
    },
    {
      id: 2,
      question: "Can you help with proctored exams?",
      answer: "Yes, we provide assistance with proctored exams while maintaining complete privacy and academic integrity.",
    },
    {
      id: 3,
      question: "What happens if I'm not satisfied with the results?",
      answer: "We offer a money-back guarantee if you're not satisfied with our services.",
    },
    {
      id: 4,
      question: "How do you handle urgent exam requests?",
      answer: "Our experts are available 24/7 to handle urgent exam requests with the same level of quality.",
    },
    {
      id: 5,
      question: "What subjects do you cover?",
      answer: "We cover a wide range of subjects including sciences, humanities, business, and technical courses.",
    },
  ],
};

export const examSubjects = [
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
  "psychology",
  "statistics"
] as const;

export type ExamSubject = typeof examSubjects[number];

// Subject-specific content
const examSubjectContent: Record<ExamSubject, Partial<ExamSubjectContent>> = {
  accounting: {
    btnText: "Seek Accounting quiz help",
    heroContent: {
      heading1: "",
      mainHeading: "Take my Accounting\nTest & Score A Good\nGrade!",
      heading2: "",
      description: "Elevate your score in accounting exam with Scholarly Help",
    },
    faqContent: [
      {
        id: 1,
        question: "Will you take responsibility if I get caught during my accounting exam?",
        answer: "Our priority is to keep your information confidential and we follow utmost discretion when attempting your quizzes and exams. We ensure that you will not get caught during your accounting exams.",
      },
      {
        id: 2,
        question: "Can you take the accounting proctored exam for me?",
        answer: "Yes, we can! We go through several steps of maintaining your privacy when taking your proctored exams which ensures that your academic integrity is not damaged.",
      },
      {
        id: 3,
        question: "What if you fail my accounting exam?",
        answer: "Our subject experts put their best efforts when attempting your accounting tests but if somehow, we do not get the desired results we return all your money without any hidden charges.",
      },
      {
        id: 4,
        question: "How do you keep confidentiality during exams?",
        answer: "Our subject experts follow strict guidelines to maintain confidentiality while taking your exams. We match your location and time to make sure confidentiality is prioritized.",
      },
      {
        id: 5,
        question: "Can you do my accounting exam on an urgent basis?",
        answer: "Yes, we can! Just send us your exam details and our subject experts can do it on an urgent basis as your accounting test helper.",
      },
    ],
  },
    anatomy: {},
    architecture: {},
    biology: {},
    chemistry: {},
    "computer-science": {},
    economics: {},
    engineering: {},
    english: {},
    finance: {},
    history: {},
    "human-resource": {},
    law: {},
    linguistics: {},
    marketing: {},
    math: {},
    nursing: {},
    "operation-management": {},
    "organizational-behavior": {},
    psychology: {},
    statistics: {},
};

export function getExamSubjectContent(subject: ExamSubject): ExamSubjectContent {
  return {
    ...defaultContent,
    ...examSubjectContent[subject],
  };
}

export function isValidExamSubject(subject: string): subject is ExamSubject {
  return examSubjects.includes(subject as ExamSubject);
}