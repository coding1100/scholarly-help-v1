import ScheduleIcon from "@/app/assets/Images/schedule-icon.webp";
import Grades from "@/app/assets/Images/grades.webp";
import Homework from "@/app/assets/Images/homework.webp";
import Write from "@/app/assets/Images/write.webp";
import Notes from "@/app/assets/Images/notes.webp";
import GirlWithBoard from "@/app/assets/Images/girlsWithPaperBoard.webp";
import Proof1 from "@/app/assets/Images/proof-1.webp";
import Proof2 from "@/app/assets/Images/proof-2.webp";
import Proof3 from "@/app/assets/Images/proof-3.webp";
import Proof4 from "@/app/assets/Images/proof-4.webp";
import Proof5 from "@/app/assets/Images/proof-5.webp";
import Proof6 from "@/app/assets/Images/proof-6.webp";

export const content = {
  btnText:"Do my engineering homework",
  heroContent: {
    // heading1: "",
    mainHeading: `Help Me Do My\nEngineering\nHomework for Better\nGrades`,
    // heading2: "",
    description:
      "Your new engineering homework assistant is right here to take your score to new heights",
  },
  academic: {
    mainheading: "Additional Academic Services",
    academicContent: [
      {
        icon: ScheduleIcon,
        title: "Online Class",
        description:
          "We understand that you’re busy, and our subject experts offer to complete your online classes tasks for you.",
      },
      {
        icon: Homework,
        title: "Assignments",
        description:
          "As making Engineering assignments can be an exhausting job, our subject specialists can write you well-researched and fact-based assignments.",
      },
      {
        icon: Grades,
        title: "Online Exam",
        description:
          "Engineering exams are challenging if you’re not fully prepared, so we can take them for you and guarantee a good grade.",
      },
      {
        isLast: true,
        icon: GirlWithBoard,
      },
    ],
  },
  whyScholarly: {
    mainHeading: "Why should you choose us?",
    mainDescription:
      "Scholarly Help offers plenty of services through skilled <a href='/homework' style='text-decoration: underline; color:#565Add'>homework<a> helpers and various subject experts.",
    whyScholarlyContent: [
      {
        id: 1,
        icon: "Idea",
        title: "Genuine Content",
        description:
          "We highly value originality in your homework and our writers run your finished engineering homework through various plagiarism checking software to ensure complete originality.",
      },
      {
        id: 2,
        icon: "Bulb",
        title: "Limitless Revisions",
        description:
          "Our engineering writers produce high-quality homework but, we give you the choice to review your homework and ask for any required revisions until you are completely satisfied.",
      },
      {
        id: 3,
        icon: "Content",
        title: "Timely Deliverance",
        description:
          "If you’re having a hard time meeting deadlines, you can stop worrying because our writers always deliver your work on time, giving you ample time to review it.",
      },
      {
        id: 4,
        icon: "LiveChat",
        title: "Live Chat Support",
        description:
          "At Scholarly Help, we care about your queries and have 24/7 online chat support to answer them no matter what time of the day it is.",
      },
      {
        id: 5,
        icon: "Plagirism",
        title: "Pocket-Friendly Services",
        description:
          "We keep our homework services affordable so you can get good grades with our homework help on a budget.",
      },
      {
        id: 6,
        icon: "Money",
        title: "Money-Back Guarantee",
        description:
          "Our subject specialists strive to meet your instructions and details but if you are still not satisfied with our service, we offer a full money-back guarantee without any hidden charges.",
      },
    ],
  },
  excellenceProofContent: [
    {
      img: Proof1,
    },
    {
      img: Proof2,
    },
    {
      img: Proof3,
    },
    {
      img: Proof4,
    },
    {
      img: Proof5,
    },
    {
      img: Proof6,
    },
  ],
  subjects: {
    mainHeading: "Subjects We Work On",
    subjectsContent: [
      {
        title: "English",
      },
      {
        title: "Math",
      },
      {
        title: "Anatomy and Physiology",
      },
      {
        title: "Statistics",
      },
      {
        title: "HRM Class",
      },
      {
        title: "Operation Management",
      },
      {
        url: "/homework/computer-science",
        title: "Computer Science",
      },
      {
        title: "Accounting",
      },
      {
        title: "History",
      },
      {
        title: "Marketing",
      },
      {
        title: "Psychology",
      },
      {
        title: "Philosophy",
      },
      {
        title: "Law",
      },
      {
        title: "Physics",
      },
      {
        title: "Biology",
      },
      {
        title: "Engineering",
      },
      {
        title: "Chemistry",
      },
      {
        title: "Finance",
      },
      {
        title: "Nursing",
      },
      {
        title: "Bible",
      },
      {
        title: "Organizational Behavior",
      },
      {
        url: "/homework/architecture",
        title: "Architecture",
      },
      {
        title: "Ethics",
      },
      {
        title: "Sociology",
      },
      {
        title: "Pharmacology",
      },
      {
        title: "Economics",
      },
      {
        title: "Nutrition",
      },
      {
        title: "Linguistics",
      },
      {
        title: "Art",
      },
      {
        title: "Aviation",
      },
      {
        title: "Geography",
      },
      {
        title: "Environmental Science",
      },
    ],
  },
  faqContent: [
    {
      id: 1,
      question: "Can you do my homework within 24 hours?",
      answer:
        "Yes, we can. Our writing experts can do your homework within 24 hours without compromising on quality.",
    },
    {
      id: 2,
      question: "What happens if I don’t get satisfied with my grade on my homework?",
      answer:
        'We aim to get you the best results in your homework but If you don’t get the agreed-upon grade, we offer a full refund of your money.',
    },
    {
      id: 3,
      question: "Can I request modifications if my work is not satisfactory?",
      answer:
        "Yes, you can! If your work is not satisfactory, you can ask for modifications and give detailed guidelines for the specific changes you require.",
    },
    {
      id: 4,
      question:
        'How do I know my homework is original?',
      answer:
        'At Scholarly Help, we take pride in producing original quality content. This is verified by us as we run your homework through several plagiarism-checking software. For further surety, you can always request a plagiarism report with your homework.',
    },
    {
      id: 5,
      question:
        'Can you provide me with samples before I place my order for economics homework?',
      answer:
        "If you want to request a plagiarism report with your homework, just request one while placing your order. This is completely free, without any additional costs!",
    },
  ],
};
