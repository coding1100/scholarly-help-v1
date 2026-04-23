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
  btnText:"Help me with my biology homework",
  heroContent: {
    // heading1: "",
    mainHeading: `Help Me Do My\nBiology Homework\nfor Me!`,
    // heading2: "",
    description:
      "Our scholarly subject experts can help you do your homework on time.",
  },
  academic: {
    mainheading: "Additional Biology Services We Offer",
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
          "As making biology assignments can be an exhausting job, our biology specialists can write you well-researched and fact-based assignments.",
      },
      {
        icon: Grades,
        title: "Online Exam",
        description:
          "Biology exams are challenging if you’re not fully prepared, so we can take them for you and guarantee a good grade.",
      },
      {
        isLast: true,
        icon: GirlWithBoard,
      },
    ],
  },
  whyScholarly: {
    mainHeading: "Reasons that Make us Standout",
    mainDescription:
      "Scholarly Help offers plenty of services through skilled <a href='/homework' style='text-decoration: underline; color:#565Add'>homework<a> helpers and various subject experts.",
    whyScholarlyContent: [
      {
        id: 1,
        icon: "Idea",
        title: "High-quality content",
        description:
          "Our subject specialists create high-quality content following the details you have provided for your homework. After proofreading and editing, your homework will surely get the results you desire.",
      },
      {
        id: 2,
        icon: "Bulb",
        title: "100% originality",
        description:
          "We ensure originality in your biology homework, making sure it is customized according to your needs. Our subject specialists run your homework through plagiarism checkers for the best results for further surety.",
      },
      {
        id: 3,
        icon: "Content",
        title: "On-time delivery",
        description:
          "Our subject specialists always meet your given deadlines, targeting to deliver before it in case any revisions are required.",
      },
      {
        id: 4,
        icon: "LiveChat",
        title: "24/7 live chat support",
        description:
          "At Scholarly Help, our support team works round the clock, so you’re able to reach them at any time of the day without facing any issues. So, don’t hesitate to reach out to us, no matter what time it is.",
      },
      {
        id: 5,
        icon: "Plagirism",
        title: "Full confidentiality",
        description:
          "We offer complete confidentiality, ensuring that your data is not accessible to anyone. This protects your academic reputation while ensuring you’re safe.",
      },
      {
        id: 6,
        icon: "Money",
        title: "Money-back guarantee",
        description:
          "We aim to do our best to satisfy you entirely, but we offer a full refund of your money without any hidden charges in case of any issues with your homework.",
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
        url: "/homework/physics",
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
        url: "/homework/nursing",
        title: "Nursing",
      },
      {
        title: "Bible",
      },
      {
        title: "Organizational Behavior",
      },
      {
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
      question: "Can you do my biology homework on an urgent basis?",
      answer:
        "At Scholarly Help, we strive to give the best services regardless of the amount of time we are given. We can deliver your requested biology homework within a few hours if provided the accurate instructions.",
    },
    {
      id: 2,
      question: "What if my biology sub branch is not included in the areas you cover?",
      answer:
        'Our subject specialists have ample experience in doing homework in various areas of biology. If your specific area is not mentioned, don’t hesitate to contact our 24/7 live chat support for further information.',
    },
    {
      id: 3,
      question: "How can I know my homework is original?",
      answer:
        "Our biology experts always produce original content. If you want details on its originality, you can ask for a plagiarism report, and our writers can attach one for you for further surety.",
    },
    
  ],
};
