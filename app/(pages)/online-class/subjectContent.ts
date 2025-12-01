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

interface SubjectContent {
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

export const subjectContent: Record<string, SubjectContent> = {
  accounting: {
    btnText: "Take My Online Accounting Class",
    heroContent: {
      mainHeading: "Need Help With Your\nOnline Accounting\nClass?",
      description: "Expert accounting tutors ready to help you succeed in your online classes.",
    },
    academic: {
      mainheading: "Accounting Services",
      mainDescription: "Comprehensive support for all your accounting course needs.",
      academicContent: [
        {
          icon: Homework,
          title: "Assignments",
          description: "Expert help with financial statements, journal entries, and complex accounting problems.",
        },
        {
          icon: Write,
          title: "Homework",
          description: "Professional assistance with accounting homework, from basic bookkeeping to advanced topics.",
        },
        {
          icon: Grades,
          title: "Final Exam",
          description: "Thorough exam preparation and support for all accounting subjects.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Accounting?",
      mainDescription: "Professional accounting tutors with real-world experience.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Expert Accountants",
          description: "Our tutors are certified accountants with years of teaching experience.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Practical Knowledge",
          description: "Learn from professionals who understand both theory and real-world applications.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Comprehensive Support",
          description: "From basic accounting to advanced topics, we cover everything.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "24/7 Assistance",
          description: "Get help whenever you need it with our round-the-clock support.",
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
      mainHeading: "Accounting Topics We Cover",
      subjectsContent: [
        { title: "Financial Accounting" },
        { title: "Managerial Accounting" },
        { title: "Cost Accounting" },
        { title: "Tax Accounting" },
        { title: "Auditing" },
        { title: "Bookkeeping" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can someone take my online accounting class?",
        answer: "Yes, our expert accounting tutors can help you with your entire online accounting class, including assignments, homework, and exams.",
      },
      {
        id: 2,
        question: "What accounting topics do you cover?",
        answer: "We cover all accounting topics including financial accounting, managerial accounting, cost accounting, tax accounting, auditing, and more.",
      },
      {
        id: 3,
        question: "Are your accounting tutors qualified?",
        answer: "Yes, all our accounting tutors are certified professionals with advanced degrees and years of teaching experience.",
      },
    ],
  },
  anatomy: {
    btnText: "Take My Online Anatomy Class",
    heroContent: {
      mainHeading: "Expert Help for Your\nOnline Anatomy\nClass",
      description: "Get professional assistance with your anatomy and physiology courses.",
    },
    academic: {
      mainheading: "Anatomy & Physiology Services",
      mainDescription: "Comprehensive support for anatomy and physiology students.",
      academicContent: [
        {
          icon: Homework,
          title: "Assignments",
          description: "Expert help with anatomy diagrams, lab reports, and theoretical assignments.",
        },
        {
          icon: Write,
          title: "Homework",
          description: "Detailed assistance with anatomy homework and study materials.",
        },
        {
          icon: Grades,
          title: "Lab Work",
          description: "Support with virtual labs and practical assignments.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Anatomy?",
      mainDescription: "Learn from experienced anatomy and physiology experts.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Expert Anatomists",
          description: "Our tutors have advanced degrees in anatomy and physiology.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Practical Experience",
          description: "Learn from professionals with clinical and teaching experience.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Visual Learning",
          description: "Access to detailed anatomical diagrams and study materials.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "24/7 Support",
          description: "Get assistance anytime with our round-the-clock support.",
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
      mainHeading: "Anatomy Topics We Cover",
      subjectsContent: [
        { title: "Human Anatomy" },
        { title: "Physiology" },
        { title: "Histology" },
        { title: "Neuroanatomy" },
        { title: "Gross Anatomy" },
        { title: "Clinical Anatomy" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can you help with anatomy lab work?",
        answer: "Yes, our experts can help you with virtual lab work, lab reports, and practical assignments in anatomy.",
      },
      {
        id: 2,
        question: "Do you cover both anatomy and physiology?",
        answer: "Yes, we provide comprehensive support for both anatomy and physiology courses at all levels.",
      },
      {
        id: 3,
        question: "What resources do you provide?",
        answer: "We provide detailed study materials, anatomical diagrams, practice questions, and one-on-one tutoring support.",
      },
    ],
  },
  biology: {
    btnText: "Help Me Take My Biology Class Online",
    heroContent: {
      mainHeading: "Seeking A Rescue\nWho Helps Me Take\nMy Online Biology\nClass!",
      description: "Scholarly Help is the right place for you. Let us assist you with online biological classes.",
    },
    academic: {
      mainheading: "Further Online Academic Services",
      mainDescription: "Our comprehensive biology support services cover all aspects of your online class needs.",
      academicContent: [
        {
          icon: Homework,
          title: "Assignments",
          description: "If you have a complex biology assignment with a short deadline, hand it over to us. We will complete your bio assignment immediately.",
        },
        {
          icon: Write,
          title: "Homework",
          description: "Similarly, if your biology homework is complicated, you can contact Scholarly Help right away and seek help in your online homework.",
        },
        {
          icon: Grades,
          title: "Final Exam",
          description: "In the case of an online biology exam, all you need to do is provide us with the sources and get your exam done without any mistake.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why is Scholarly Help a Leading Writing Service Provider?",
      mainDescription: "Scholarly Help offers plenty of services through skilled <a href='/online-class' style='text-decoration: underline; color:#565Add'>online class</a> helpers and various subject experts.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Resourceful Solutions",
          description: "We not only deliver immediate answers to your queries but also provide some solutions about how you execute your tasks in your biology online class. So, eradicate your worries about missing the deadlines and let Scholarly Help take care of it.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Highly Educated Biology Experts",
          description: "We have a team of excellent MPhil/MS professionals in Biological sciences and also have master's and Ph.D. degrees from prestigious universities. Students can ask for these experts and get them hired to take your online biology class for you.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Original Content",
          description: "Our subject experts create original content which they write on their own. Also, their written content is checked through various plagiarism checkers to ensure the produced content is 100% original.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "Student's Privacy and Security",
          description: "Our team of educational experts makes sure that the student's information isn't revealed to any other third party. We have secured systems that ensure that the student's accounts don't get flagged.",
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
        { title: "Cell Biology" },
        { title: "Molecular Biology" },
        { title: "Genetics" },
        { title: "Ecology" },
        { title: "Evolution" },
        { title: "Physiology" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can I pay someone to take my Online Biology Class?",
        answer: "Yes, you can. Scholarly Help has a team of professionals and Biology experts that are available anytime to take your online biology classes. We also take more than one online course that is related to Biology and will provide high-quality services to our students. Doubling the demand doesn't mean poor service for us. Our experts will take online biology classes for multiple subjects.",
      },
      {
        id: 2,
        question: "What branches of biology do you cover?",
        answer: "We cover all major branches of biology including molecular biology, cell biology, genetics, ecology, evolution, physiology, and more. Our experts are well-versed in both theoretical and practical aspects of these subjects.",
      },
      {
        id: 3,
        question: "How do you ensure quality in biology assignments?",
        answer: "Our biology experts have advanced degrees in their fields and use the latest research and scientific methods. All work is thoroughly checked for accuracy and originality before submission.",
      },
    ],
  },
  chemistry: {
    btnText: "Take my online chemistry class",
    heroContent: {
      mainHeading: "Help Me take my\nchemistry class for\nme",
      description: "Get rid of low grades by hiring trustworthy services",
    },
    academic: {
      mainheading: "Other Services",
      mainDescription: "Our chemistry experts provide comprehensive support for all your academic needs.",
      academicContent: [
        {
          icon: Homework,
          title: "Assignments",
          description: "If you are unable to complete your assignments on time, you can request us to 'do my chemistry assignment' at any time. Our chemistry professionals will complete your tasks.",
        },
        {
          icon: Write,
          title: "Homework",
          description: "You may not have time to complete your homework, or for whatever reason, you can search for 'chemistry homework help.' Our experts will complete your homework to get better grades.",
        },
        {
          icon: Grades,
          title: "Final Exam",
          description: "Our experts assist students in achieving higher grades on exams, whether they are quizzes, midterms, or finals. You simply need to enter the query 'do my chemistry exam for me.'",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Should You Choose Us?",
      mainDescription: "Scholarly Help offers plenty of services through skilled <a href='/online-class' style='text-decoration: underline; color:#565Add'>online class</a> helpers and various subject experts.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Affordable Prices",
          description: "We have considered your position as a student, so our services are highly affordable. We understand that students have limited budget so, you can take advantage of our services without running out of your budget.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Quality-based Services",
          description: "At Scholarly Help, we believe in creating high-quality content to satisfy your every need. Our experienced subject experts take your online chemistry tasks according to the instructions to get the best grades.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Customized Services",
          description: "Our chemistry professionals are determined to help students with customized online chemistry classes that meet your specific requirements and learning goals.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "Meet deadlines",
          description: "With Scholarly Help, you don't need to worry about late deliveries. We always submit your online tasks on time to make a good impression on your instructor.",
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
      mainHeading: "Chemistry Topics We Cover",
      subjectsContent: [
        { title: "Organic Chemistry" },
        { title: "Inorganic Chemistry" },
        { title: "Physical Chemistry" },
        { title: "Analytical Chemistry" },
        { title: "Biochemistry" },
        { title: "Chemical Engineering" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "What is the minimum time required to complete the tasks that are due tonight in my online class?",
        answer: "It all depends on the nature of the task at hand. Our subject matter experts have completed a number of urgent tasks on very short notice. You should contact us as soon as possible so that your work does not go unnoticed.",
      },
      {
        id: 2,
        question: "What chemistry subject areas do you work on?",
        answer: "<div>We cover all the subject areas under the domain of chemistry. You can ask us what subject area you want us to do under the domain of chemistry. We will help you to get it done on your request 'take my chemistry class for me'. Some of the chemistry subject areas are enlisted here:<ul><li>Basic Chemistry</li><li>Organic Chemistry</li><li>Analytical Chemistry</li><li>Physical Chemistry</li><li>Inorganic Chemistry</li><li>Biochemistry</li></ul></div>",
      },
      {
        id: 3,
        question: "Can I communicate with my chemistry expert?",
        answer: "Yes, you can communicate with the chemistry expert throughout the duration of your online chemistry class. You can also keep track of your progress and communicate any concerns you have with the chemistry expert.",
      },
    ],
  },
  architecture: {
    btnText: "Take My Online Architecture Class",
    heroContent: {
      mainHeading: "Professional Help for\nYour Architecture\nClass",
      description: "Expert assistance with architectural design and theory courses.",
    },
    academic: {
      mainheading: "Architecture Services",
      mainDescription: "Comprehensive support for architecture students.",
      academicContent: [
        {
          icon: Homework,
          title: "Design Projects",
          description: "Expert help with architectural design projects and portfolios.",
        },
        {
          icon: Write,
          title: "Theory Assignments",
          description: "Assistance with architectural theory and history assignments.",
        },
        {
          icon: Grades,
          title: "Technical Drawing",
          description: "Support with CAD, technical drawings, and 3D modeling.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Architecture?",
      mainDescription: "Learn from experienced architects and designers.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Professional Architects",
          description: "Our tutors are practicing architects with teaching experience.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Design Expertise",
          description: "Get help with both creative and technical aspects of architecture.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Software Skills",
          description: "Expert guidance in architectural software and tools.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "Project Support",
          description: "Comprehensive assistance with design projects and portfolios.",
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
      mainHeading: "Architecture Topics We Cover",
      subjectsContent: [
        { title: "Architectural Design" },
        { title: "Building Systems" },
        { title: "Construction Technology" },
        { title: "Architectural History" },
        { title: "Urban Planning" },
        { title: "Sustainable Design" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can you help with architectural design projects?",
        answer: "Yes, our expert architects can help you with design projects, from concept development to final presentation.",
      },
      {
        id: 2,
        question: "Do you provide help with architectural software?",
        answer: "Yes, we offer support for various architectural software including AutoCAD, Revit, SketchUp, and other design tools.",
      },
      {
        id: 3,
        question: "What areas of architecture do you cover?",
        answer: "We cover all aspects of architecture including design, theory, history, technology, and sustainable practices.",
      },
    ],
  },
  economics: {
    btnText: "Take My Online Economics Class",
    heroContent: {
      mainHeading: "Expert Help for Your\nEconomics Course\nOnline",
      description: "Get professional assistance with micro and macroeconomics courses.",
    },
    academic: {
      mainheading: "Economics Services",
      mainDescription: "Comprehensive support for economics students at all levels.",
      academicContent: [
        {
          icon: Homework,
          title: "Assignments",
          description: "Expert help with economic analysis and problem-solving.",
        },
        {
          icon: Write,
          title: "Research Papers",
          description: "Professional assistance with economics research and papers.",
        },
        {
          icon: Grades,
          title: "Data Analysis",
          description: "Support with economic data analysis and interpretation.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Economics?",
      mainDescription: "Learn from experienced economists and researchers.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Expert Economists",
          description: "Our tutors hold advanced degrees in economics and related fields.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Research Experience",
          description: "Get help from professionals with research and analysis expertise.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Comprehensive Coverage",
          description: "Support for both theoretical and applied economics.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "24/7 Support",
          description: "Round-the-clock assistance for all your economics needs.",
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
      mainHeading: "Economics Topics We Cover",
      subjectsContent: [
        { title: "Microeconomics" },
        { title: "Macroeconomics" },
        { title: "Econometrics" },
        { title: "International Economics" },
        { title: "Development Economics" },
        { title: "Financial Economics" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Can you help with economic data analysis?",
        answer: "Yes, our experts can help you with statistical analysis, econometrics, and data interpretation.",
      },
      {
        id: 2,
        question: "What economics topics do you cover?",
        answer: "We cover all areas of economics including micro, macro, international, development, and financial economics.",
      },
      {
        id: 3,
        question: "Do you help with economics research papers?",
        answer: "Yes, we provide comprehensive support for research papers, including literature review, data analysis, and writing.",
      },
    ],
  },
  engineering: {
    btnText: "Take My Online Engineering Class",
    heroContent: {
      mainHeading: "Expert Help for Your\nEngineering\nCourses",
      description: "Professional assistance across all engineering disciplines.",
    },
    academic: {
      mainheading: "Engineering Services",
      mainDescription: "Comprehensive support for engineering students.",
      academicContent: [
        {
          icon: Homework,
          title: "Problem Sets",
          description: "Expert help with engineering calculations and problem-solving.",
        },
        {
          icon: Write,
          title: "Project Work",
          description: "Assistance with engineering projects and design work.",
        },
        {
          icon: Grades,
          title: "Lab Reports",
          description: "Support with engineering lab work and report writing.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Engineering?",
      mainDescription: "Learn from experienced engineers and educators.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Professional Engineers",
          description: "Our tutors are qualified engineers with industry experience.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Technical Expertise",
          description: "Get help with complex engineering concepts and applications.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Practical Focus",
          description: "Learn real-world engineering applications and solutions.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "Software Support",
          description: "Help with engineering software and tools.",
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
      mainHeading: "Engineering Fields We Cover",
      subjectsContent: [
        { title: "Mechanical Engineering" },
        { title: "Electrical Engineering" },
        { title: "Civil Engineering" },
        { title: "Chemical Engineering" },
        { title: "Software Engineering" },
        { title: "Industrial Engineering" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "Which engineering disciplines do you cover?",
        answer: "We cover all major engineering disciplines including mechanical, electrical, civil, chemical, and software engineering.",
      },
      {
        id: 2,
        question: "Can you help with engineering software?",
        answer: "Yes, we provide support for various engineering software including AutoCAD, MATLAB, SolidWorks, and more.",
      },
      {
        id: 3,
        question: "Do you help with engineering projects?",
        answer: "Yes, we offer comprehensive support for engineering projects, from design to implementation and documentation.",
      },
    ],
  },
  finance: {
    btnText: "Take My Online Finance Class",
    heroContent: {
      mainHeading: "Expert Help for Your\nFinance Course\nOnline",
      description: "Professional assistance with all finance courses and topics.",
    },
    academic: {
      mainheading: "Finance Services",
      mainDescription: "Comprehensive support for finance students.",
      academicContent: [
        {
          icon: Homework,
          title: "Financial Analysis",
          description: "Expert help with financial statements and analysis.",
        },
        {
          icon: Write,
          title: "Investment Projects",
          description: "Support with investment analysis and portfolio management.",
        },
        {
          icon: Grades,
          title: "Risk Assessment",
          description: "Assistance with risk analysis and financial modeling.",
        },
        {
          isLast: true,
          icon: GirlWithBoard,
        },
      ],
    },
    whyScholarly: {
      mainHeading: "Why Choose Us for Finance?",
      mainDescription: "Learn from experienced financial professionals.",
      whyScholarlyContent: [
        {
          id: 1,
          icon: "Idea",
          title: "Industry Professionals",
          description: "Our tutors have real-world finance experience.",
        },
        {
          id: 2,
          icon: "Bulb",
          title: "Market Knowledge",
          description: "Stay updated with current financial market trends.",
        },
        {
          id: 3,
          icon: "Content",
          title: "Practical Applications",
          description: "Learn how to apply financial concepts in real scenarios.",
        },
        {
          id: 4,
          icon: "LiveChat",
          title: "Technical Support",
          description: "Help with financial software and tools.",
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
      mainHeading: "Finance Topics We Cover",
      subjectsContent: [
        { title: "Corporate Finance" },
        { title: "Investment Banking" },
        { title: "Financial Markets" },
        { title: "Risk Management" },
        { title: "Portfolio Management" },
        { title: "Financial Analysis" },
      ],
    },
    faqContent: [
      {
        id: 1,
        question: "What finance topics do you cover?",
        answer: "We cover all areas of finance including corporate finance, investments, financial markets, and risk management.",
      },
      {
        id: 2,
        question: "Do you help with financial modeling?",
        answer: "Yes, we provide expert assistance with financial modeling, valuation, and analysis using various tools and software.",
      },
      {
        id: 3,
        question: "Can you help with finance projects?",
        answer: "Yes, we offer comprehensive support for finance projects, including market analysis, portfolio management, and financial planning.",
      },
    ],
  },
};

// Default content to use as fallback
export const defaultContent: SubjectContent = {
  btnText: "Get Help With Your Online Class",
  heroContent: {
    mainHeading: "Professional Online Class Help",
    description: "Get expert assistance with your online classes. Our professional tutors are here to help you succeed.",
  },
  academic: {
    mainheading: "Our Academic Services",
    mainDescription: "We offer comprehensive academic support services to help you excel in your studies.",
    academicContent: [
      {
        icon: Homework,
        title: "Assignments",
        description: "Expert help with all your course assignments, ensuring top grades and timely submission.",
      },
      {
        icon: Write,
        title: "Homework",
        description: "Professional assistance with your homework, making sure you understand the concepts.",
      },
      {
        icon: Grades,
        title: "Final Exam",
        description: "Comprehensive exam preparation and support to help you excel in your finals.",
      },
      {
        isLast: true,
        icon: GirlWithBoard,
      },
    ],
  },
  whyScholarly: {
    mainHeading: "Why Choose Scholarly Help?",
    mainDescription: "We offer comprehensive support through our expert tutors across various subjects.",
    whyScholarlyContent: [
      {
        id: 1,
        icon: "Idea",
        title: "Expert Tutors",
        description: "Our team consists of highly qualified professionals with extensive experience in their fields.",
      },
      {
        id: 2,
        icon: "Bulb",
        title: "Quality Assured",
        description: "We guarantee high-quality work that meets all your academic requirements.",
      },
      {
        id: 3,
        icon: "Content",
        title: "Original Content",
        description: "All our work is original and checked through plagiarism detection tools.",
      },
      {
        id: 4,
        icon: "LiveChat",
        title: "24/7 Support",
        description: "Our support team is available around the clock to assist you with any questions.",
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
    mainHeading: "Subjects We Cover",
    subjectsContent: [
      { title: "Accounting", url: "/online-class/accounting" },
      { title: "Anatomy", url: "/online-class/anatomy" },
      { title: "Architecture", url: "/online-class/architecture" },
      { title: "Biology", url: "/online-class/biology" },
      { title: "Chemistry", url: "/online-class/chemistry" },
      { title: "Computer Science", url: "/online-class/computer-science" },
      { title: "Economics", url: "/online-class/economics" },
      { title: "Engineering", url: "/online-class/engineering" },
      { title: "English", url: "/online-class/english" },
      { title: "Finance", url: "/online-class/finance" },
      { title: "History", url: "/online-class/history" },
      { title: "Human Resource", url: "/online-class/human-resource" },
      { title: "Law", url: "/online-class/law" },
      { title: "Linguistics", url: "/online-class/linguistics" },
      { title: "Marketing", url: "/online-class/marketing" },
      { title: "Mathematics", url: "/online-class/math" },
      { title: "Nursing", url: "/online-class/nursing" },
      { title: "Operation Management", url: "/online-class/operation-management" },
      { title: "Organizational Behavior", url: "/online-class/organizational-behavior" }
    ],
  },
  faqContent: [
    {
      id: 1,
      question: "How does your online class help service work?",
      answer: "Our service connects you with expert tutors who can assist with your online classes, including assignments, homework, and exams.",
    },
    {
      id: 2,
      question: "Is my information kept confidential?",
      answer: "Yes, we take privacy very seriously. All your information is kept strictly confidential and secure.",
    },
    {
      id: 3,
      question: "What subjects do you cover?",
      answer: "We cover a wide range of subjects across various academic disciplines. Contact us to learn more about specific subject coverage.",
    },
  ],
};

export const subjects = [
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
  "philosophy",
  "statistics",
] as const;

export type SubjectType = typeof subjects[number];