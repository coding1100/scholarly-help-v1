
export async function getOnlineClassContent() {
  // Return static content for public pages to avoid API dependency
  return content;
}

export const content = {
  btnText: "Take my online class",
  heroContent: {
    heading1: "",
    mainHeading: `Online Classes Help from the Best Class Takers`,
    heading2: "",
    description:
      "Need help with deadlines and grades? Pay someone to do your online class — our experts will take your class and handle all your coursework.",
  },
  academic: {
    mainheading:
      "What We Offer — Trusted<br/>Online Class Help, Start to Finish",
    mainDescription:
      "From exams and essays to full-class management, we handle it all so you don’t have to.",
    academicContent: [
      {
        icon: "/assets/Images/schedule-icon.webp",
        title: "Online Class Help",
        description:
          "Too busy or overwhelmed with daily tasks? We provide complete online class help — handling your entire course so you stay stress-free and on track.",
      },
      {
        icon: "/assets/Images/grades.webp",
        title: "Online Exam Help",
        description:
          "No time to prep? No problem. Our experts take your exams for you, just like you'd expect when you pay someone to take my online class — with results that speak for themselves.",
      },
      {
        icon: "/assets/Images/write.webp",
        title: "Online Homework Assistance",
        description:
          "Tired of complex homework? We handle it quickly and accurately. Get real online classes help that saves time and gets results.",
      },
      {
        icon: "/assets/Images/notes.webp",
        title: "Essay Writing Services",
        description:
          "Need a polished, plagiarism-free essay delivered on time? Our writers craft compelling, original essays that are ready to submit.",
      },
      {
        icon: "/assets/Images/homework.webp",
        title: "Assignment Help",
        description:
          "Falling behind on assignments? Let us step in. When you ask us to do my online class for me, we make sure your coursework gets done right — and on time.",
      },
      {
        isLast: true,
        icon: "/assets/Images/girlsWithPaperBoard.webp",
      },
    ],
  },
  whyScholarly: {
    mainHeading: "Why We’re the Best Class Taker for You",
    mainDescription:
      // "Scholarly Help offers plenty of services through skilled <a href='/online-class' style='text-decoration: underline; color:#565Add'>online class<a> helpers and various subject experts.",
      "From full-course coverage to strict deadlines, we make taking online classes effortless. Unlike others, we don’t tutor — you come to us saying do my online class for me, and we deliver reliable online classes help without the stress.",
    whyScholarlyContent: [
      {
        id: 1,
        icon: "Idea",
        title: "Complete Class Coverage",
        description:
          "From assignments to exams, we handle everything. If you need someone to take my class for me, we’ve got it covered — start to finish.",
      },
      {
        id: 2,
        icon: "Bulb",
        title: "Always On Time",
        // title: "Comprehensive Course Coverage for Do My Online Class",
        description:
          "We never miss a deadline. When you pay someone to take my online class, you expect punctual work — and we deliver.",
      },
      {
        id: 3,
        icon: "Content",
        title: "All Subjects Covered",
        // title: "Timely Delivery for Take My Online Class",
        description:
          "Our team handles math, science, business, humanities, and more. This is the kind of online class help students actually need — full-service, not just advice.",
      },
      {
        id: 4,
        icon: "LiveChat",
        title: "Real Experts, No Guesswork",
        // title: "Expert Tutors to Take My Online Class",
        description:
          "Your course is assigned to trained professionals, not random freelancers. When you ask us to do my online class for me, you're hiring experience and accuracy",
      },
      {
        id: 5,
        icon: "Plagirism",
        title: "Flexible for Your Schedule",
        // title: "Flexible Scheduling Options for Take My Online Class",
        description:
          "Busy with work or life? No problem. We adjust to your deadlines when you need someone to take my class for me on your terms.",
      },
      {
        id: 6,
        icon: "Money",
        title: "Affordable & Transparent",
        // title: "Affordable Pricing Packages for Do My Online Class",
        description:
          "We keep our pricing student-friendly and fully transparent. You get value and results when you pay someone to take my online class through us.",
      },
      {
        id: 7,
        icon: "ConfidentialityIcon",
        title: "24/7 Support",
        // title: "24/7 Customer Support for Take My Online Class",
        description:
          "Need help, updates, or peace of mind? Our support team is available around the clock to assist you during your course.",
      },
      {
        id: 8,
        icon: "Grammer",
        title: "Private & Secure",
        // title: "Confidentiality and Privacy for Do My Online Class",
        description:
          "Your privacy is a priority. All login info, coursework, and records are fully confidential. This is what sets the best class taker apart from the rest.",
      },
    ],
  },
  excellenceProofContent: [
    {
      img: "/assets/Images/proof-1.webp",
    },
    {
      img: "/assets/Images/proof-2.webp",
    },
    {
      img: "/assets/Images/proof-3.webp",
    },
    {
      img: "/assets/Images/proof-4.webp",
    },
    {
      img: "/assets/Images/proof-5.webp",
    },
    {
      img: "/assets/Images/proof-6.webp",
    },
  ],
  subjects: {
    mainHeading: "Subjects We Work On",
    subjectsContent: [
      {
        url: "/online-class/english",
        title: "English",
      },
      {
        url: "/online-class/math",
        title: "Math",
      },
      {
        title: "Anatomy and Physiology",
      },
      {
        url: "/online-class/statistics",
        title: "Statistics",
      },
      {
        title: "HRM Class",
      },
      {
        title: "Operation Management",
      },
      {
        url: "/online-class/computer-science",
        title: "Computer Science",
      },
      {
        url: "/online-class/accounting",
        title: "Accounting",
      },
      {
        url: "/online-class/history",
        title: "History",
      },
      {
        url: "/online-class/marketing",
        title: "Marketing",
      },
      {
        url: "/online-class/psychology",
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
        url: "/online-class/biology",
        title: "Biology",
      },
      {
        url: "/online-class/engineering",
        title: "Engineering",
      },
      {
        url: "/online-class/chemistry",
        title: "Chemistry",
      },
      {
        url: "/online-class/finance",
        title: "Finance",
      },
      {
        url: "/online-class/nursing",
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
      question: "Can I pay someone to do my coursework?",
      answer:
        "Yes — but not just anyone. At Scholarly Help, you're not dealing with a random freelancer. You’re hiring a trusted academic team that completes your coursework accurately, on time, and with zero stress on your end",
    },
    {
      id: 2,
      question: "How much does it cost to pay someone to take my online class?",
      answer:
        "Costs depend on your class type, workload, and deadline — but compared to others in the market, Scholarly Help offers some of the most reasonable pricing for full-service online class help. Get a quote, and you’ll see the difference.",
    },
    {
      id: 3,
      question: "Can you do my online class for me from start to finish?",
      answer:
        "Yes. When you say “do my online class for me,” we take over everything: assignments, discussions, quizzes, and exams. No tutoring. No templates. We log in and do the actual work — beginning to end.",
    },
    {
      id: 4,
      question: "Is it safe to hire Scholarly Help for my online class?",
      answer:
        "Absolutely. You’re not paying someone random — you’re working with Scholarly Help. We use encrypted systems, never share your data, and keep your identity fully confidential.",
    },
    {
      id: 5,
      question: "Why are you the best class taker?",
      answer:
        "Because we do what others promise but don’t deliver. We don’t disappear after payment, miss deadlines, or outsource your work. Our team handles your course with precision — that’s why we’re called the best class taker by returning clients.",
    },
    {
      id: 6,
      question: "Can you take my class for me while I work or study elsewhere?",
      answer:
        "Yes — that’s exactly what we’re here for. If you're balancing a job, other courses, or just need a break, we step in and take your class for you while you stay focused on life.",
    },
    {
      id: 7,
      question: "Do online classes take a lot of time?",
      answer:
        "Yes — usually 6 to 12 hours per week per class. That’s why students turn to Scholarly Help for full online classes help when they’re overloaded. We free up your time completely.",
    },
    {
      id: 8,
      question: "Are online classes harder than in-person classes?",
      answer:
        "For many students, yes. Online classes require more time management and self-discipline — which is why more and more students rely on online class help from Scholarly Help to stay ahead without burning out.",
    },
  ],
};
