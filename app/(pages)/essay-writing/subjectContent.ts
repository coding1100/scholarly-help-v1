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

interface EssayContent {
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

export const essayContent: Record<string, EssayContent> = {
  generic: {
    btnText: "Order an Essay",
    heroContent: {
      mainHeading: "Need an Essay?\nWe Write It For You",
      description: "Professional writers crafting essays that meet your requirements and deadlines.",
    },
    academic: {
      mainheading: "Essay Writing Services",
      mainDescription: "Research-based, well-formatted essays across topics and citation styles.",
      academicContent: [
        { icon: Write, title: "Custom Essays", description: "Original essays written to your specifications." },
        { icon: Notes, title: "Research", description: "Thorough research with credible sources." },
        { icon: Grades, title: "Editing & Proofreading", description: "Polished final drafts ready for submission." },
        { isLast: true, icon: GirlWithBoard },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Our Essay Writing?",
      mainDescription: "Expert writers with experience across academic levels and citation styles.",
      whyScholarlyContent: [
        { id: 1, icon: "Idea", title: "Experienced Writers", description: "Writers with advanced degrees and research experience." },
        { id: 2, icon: "Bulb", title: "Plagiarism-Free", description: "All essays are original and checked for authenticity." },
        { id: 3, icon: "Content", title: "Custom Research", description: "Essays tailored to your instructions and sources." },
        { id: 4, icon: "LiveChat", title: "Revisions", description: "Free revisions until you are satisfied with the essay." },
      ],
    },
    excellenceProofContent: [ { img: Proof1 }, { img: Proof2 }, { img: Proof3 }, { img: Proof4 }, { img: Proof5 }, { img: Proof6 } ],
    subjects: { mainHeading: "Essay Types", subjectsContent: [ { title: "Argumentative" }, { title: "Descriptive" }, { title: "Expository" }, { title: "Narrative" } ] },
    faqContent: [
      { id: 1, question: "Can you write essays for any topic?", answer: "Yes, we can cover virtually any topic with appropriate research and expertise." },
      { id: 2, question: "Do you follow citation styles?", answer: "Yes, we follow APA, MLA, Chicago, Harvard and other requested styles." },
      { id: 3, question: "Can I get revisions?", answer: "Yes, we provide revisions to ensure the final essay matches your expectations." },
    ],
  },
};

export const defaultEssayContent: EssayContent = {
  btnText: "Order an Essay",
  heroContent: { mainHeading: "Professional Essay Writing", description: "Custom essays with research, citations and editing." },
  academic: { mainheading: "Our Essay Services", mainDescription: "Tailored essays for all academic levels.", academicContent: [ { icon: Write, title: "Custom Writing", description: "Original essays written from scratch." }, { icon: Notes, title: "Research", description: "Credible sources and literature review." }, { icon: Grades, title: "Proofreading", description: "Editing and polishing for submission." }, { isLast: true, icon: GirlWithBoard } ] },
  whyScholarly: { mainHeading: "Why Scholarly?", mainDescription: "Expert writers and reliable service.", whyScholarlyContent: [ { id: 1, icon: "Idea", title: "Skilled Writers", description: "Experienced writers in multiple disciplines." }, { id: 2, icon: "Bulb", title: "Quality", description: "Rigorous quality checks and proofreading." }, { id: 3, icon: "Content", title: "Original", description: "Plagiarism-free work." }, { id: 4, icon: "LiveChat", title: "Support", description: "Help available 24/7." } ] },
  excellenceProofContent: [ { img: Proof1 }, { img: Proof2 }, { img: Proof3 }, { img: Proof4 }, { img: Proof5 }, { img: Proof6 } ],
  subjects: { mainHeading: "Essay Services", subjectsContent: [ { title: "Admission Essays", url: "/essay-writing/admissions" }, { title: "Course Essays", url: "/essay-writing/course" }, { title: "Research Essays", url: "/essay-writing/research" } ] },
  faqContent: [ { id: 1, question: "How long does it take?", answer: "Turnaround depends on length and complexity; urgent options are available." }, { id: 2, question: "Are writers native English speakers?", answer: "We have writers with strong academic English proficiency across regions." }, { id: 3, question: "Do you offer refunds?", answer: "Refunds are handled per our policy depending on the case." } ],
};

export const essaySubjects = [
  "generic",
  "admissions",
  "research",
  "course",
  "operation-management",
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
  "organizational-behavior",
  "philosophy",
  "psychology",
  "statistics",
] as const;

export type EssaySubject = typeof essaySubjects[number];

export function getEssayContent(subject: EssaySubject): EssayContent {
  return { ...defaultEssayContent, ...(essayContent[subject] as EssayContent) };
}

export function isValidEssaySubject(subject: string): subject is EssaySubject {
  return essaySubjects.includes(subject as EssaySubject);
}
