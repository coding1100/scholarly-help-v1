/**
 * "Free Study Guides From Our Blog" content per page, keyed by pathname
 * without the trailing slash. Copied from the study guides content docs
 * (main service pages and the online class, exam, assignment, homework and
 * essay writing subject docs). Pages without an entry show no section.
 */
export type StudyGuideCard = {
  category: string;
  title: string;
  description: string;
  href: string;
};

export type StudyGuidesContent = {
  heading: string;
  description: string;
  cards: StudyGuideCard[];
  button: { label: string; href: string };
};

export const STUDY_GUIDES: Record<string, StudyGuidesContent> = {
  "/online-class": {
    heading: "Free Online Class Study Guides From Our Blog",
    description: "Free guides to help you manage online classes, organize coursework, and build better study habits.",
    cards: [
      {
        category: "WORK–STUDY BALANCE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work, classes, and deadlines piling up? Keep your week on track without burning out.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too many tasks and too little time? Make room for classes, deadlines, and yourself.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Want better grades this semester? Small changes to your study routine can add up.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Online Class Guides", href: "/blog/" },
  },
  "/exams": {
    heading: "Free Online Exam Preparation Guides From Our Blog",
    description: "Free guides to understand online exam formats, prepare effectively, and approach test day with confidence.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Not sure what happens in an online exam? Know the steps before test day arrives.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Multiple choice, essays, or timed tests? Feel ready for the format you’ll face.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "PROCTORED EXAM PREP",
        title: "ATI Nutrition Proctored Exam Prep: Proven Tips to Boost Your Score",
        description: "ATI Nutrition exam coming up? Focus your revision on the topics that matter.",
        href: "/blog/ati-nutrition-proctored-exam/",
      },
    ],
    button: { label: "Browse All Exam Preparation Guides", href: "/blog/" },
  },
  "/assignment": {
    heading: "Free Assignment Writing Guides From Our Blog",
    description: "Free guides to understand assignment requirements, organize research, and improve academic writing.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Assignment deadline getting closer? Get your ideas organized before you start writing.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Stuck on a research paper? Sort out the outline, format, and examples first.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC RESEARCH",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get past the first paragraph? Give your research paper a stronger opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/homework": {
    heading: "Free Homework & Study Guides From Our Blog",
    description: "Free guides to build homework routines, manage study time, and improve focus and productivity.",
    cards: [
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that helps you stay on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Why Is Time Management Important for Students Today?",
        description: "Deadlines sneaking up again? Plan your week so homework feels less overwhelming.",
        href: "/blog/why-is-time-management-important-for-students-today/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try smarter habits that fit your routine.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/essay-writing": {
    heading: "Free Essay Writing Guides From Our Blog",
    description: "Free guides to improve essay introductions, understand essay structures, and develop stronger arguments.",
    cards: [
      {
        category: "ESSAY INTRODUCTIONS",
        title: "5 Proven Techniques: How to Write a Hook for an Essay",
        description: "Staring at a blank page? Start your essay with a hook that grabs attention.",
        href: "/blog/how-to-write-a-hook-for-an-essay/",
      },
      {
        category: "EXPLANATORY ESSAYS",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Not sure how to explain your topic? Give your essay a clear, easy-to-follow flow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ARGUMENTATIVE ESSAYS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a strong argument? Pick a focused topic and back up your point with evidence.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
  "/online-class/chemistry": {
    heading: "Free Chemistry Study Guides From Our Blog",
    description: "Free guides for chemistry topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "ORGANIC CHEMISTRY",
        title: "Why Is Organic Chemistry Hard?",
        description: "Organic chemistry feeling impossible? See what makes the reactions so tricky.",
        href: "/blog/why-is-organic-chemistry-hard/",
      },
      {
        category: "CHEMISTRY TOPICS",
        title: "Chemistry Research Topics",
        description: "Stuck choosing a chemistry topic? Here are ideas worth checking out.",
        href: "/blog/chemistry-research-topics/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/biology": {
    heading: "Free Biology Study Guides From Our Blog",
    description: "Free guides for biology topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "BIOLOGY BASICS",
        title: "The Biological Species Concept",
        description: "Species definitions getting confusing? Clear up the concept before class.",
        href: "/blog/the-biological-species-concept/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Biology grades not where you want them? Build habits that fit your semester.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/economics": {
    heading: "Free Economics Study Guides From Our Blog",
    description: "Free guides for economics topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "ECONOMICS",
        title: "How Long Is the AP Economics Exam?",
        description: "Economics assessments on your mind? Check the exam timing basics.",
        href: "/blog/how-long-is-the-ap-economics-exam/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/math": {
    heading: "Free Math Study Guides From Our Blog",
    description: "Free guides for math topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "COLLEGE MATH",
        title: "Easiest College Math Class",
        description: "Picking next semester’s math course? See which options might suit you.",
        href: "/blog/easiest-college-math-class/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Math classes moving too fast? Make study time count before your next deadline.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/law": {
    heading: "Free Law Study Guides From Our Blog",
    description: "Free guides for law topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Law readings piling up? Set a study routine that keeps you on track.",
        href: "/blog/how-to-get-better-grades/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/accounting": {
    heading: "Free Accounting Study Guides From Our Blog",
    description: "Free guides for accounting topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Accounting modules piling up? Make room for study time in a busy week.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Accounting grades falling behind? Keep your weekly study routine on track.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/statistics": {
    heading: "Free Statistics Study Guides From Our Blog",
    description: "Free guides for statistics topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "STATISTICS",
        title: "Statistics Project Ideas That Actually Work",
        description: "Need a statistics project idea? Find a topic you can actually tackle.",
        href: "/blog/statistics-project-ideas-that-actually-work/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/operation-management": {
    heading: "Free Operations Management Study Guides From Our Blog",
    description: "Free guides for operations management topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/physics": {
    heading: "Free Physics Study Guides From Our Blog",
    description: "Free guides for physics topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/finance": {
    heading: "Free Finance Study Guides From Our Blog",
    description: "Free guides for finance topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/nursing": {
    heading: "Free Nursing Study Guides From Our Blog",
    description: "Free guides for nursing topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/english": {
    heading: "Free English Study Guides From Our Blog",
    description: "Free guides for English topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "English coursework feeling tough? Keep up with reading and writing tasks.",
        href: "/blog/how-to-get-better-grades/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/history": {
    heading: "Free History Study Guides From Our Blog",
    description: "Free guides for history topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "HISTORY WRITING",
        title: "How to Write a Thesis Statement for a History Paper",
        description: "Can’t pin down your history argument? Start with a stronger thesis.",
        href: "/blog/how-to-write-a-thesis-statement-for-a-history-paper/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/marketing": {
    heading: "Free Marketing Study Guides From Our Blog",
    description: "Free guides for marketing topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/engineering": {
    heading: "Free Engineering Study Guides From Our Blog",
    description: "Free guides for engineering topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "TIME MANAGEMENT",
        title: "Time Management for Students: Learn the Skills School Never Taught You",
        description: "Too much coursework at once? Find a schedule you can stick to.",
        href: "/blog/time-management-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Grades slipping this term? Small study changes can make days easier.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/online-class/computer-science": {
    heading: "Free Computer Science Study Guides From Our Blog",
    description: "Free guides for computer science topics, tricky course concepts, and busy online class schedules.",
    cards: [
      {
        category: "STUDY ROUTINE",
        title: "How to Balance Work and Study with Smart Time Management",
        description: "Work shifts and online classes colliding? Make your weekly plan manageable.",
        href: "/blog/how-to-balance-work-and-study/",
      },
      {
        category: "COMPUTER SCIENCE",
        title: "Computer Science Project Ideas",
        description: "Need a coding project? Pick an idea that fits your current skills.",
        href: "/blog/computer-science-project-ideas/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Coding assignments stacking up? Stay on track with better study habits.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Study Guides", href: "/blog/" },
  },
  "/exams/math": {
    heading: "Free Math Exam Study Guides From Our Blog",
    description: "Free guides for math exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Math exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your math test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations: Challenging Problems and How to Approach Them",
        description: "Revision time running out? Put your math study hours where they count.",
        href: "/blog/hard-math-equations/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/statistics": {
    heading: "Free Statistics Exam Study Guides From Our Blog",
    description: "Free guides for statistics exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Statistics exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your statistics test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your statistics study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/chemistry": {
    heading: "Free Chemistry Exam Study Guides From Our Blog",
    description: "Free guides for chemistry exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Chemistry exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your chemistry test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your chemistry study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/biology": {
    heading: "Free Biology Exam Study Guides From Our Blog",
    description: "Free guides for biology exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Biology exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your biology test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "HEALTH SCIENCE EXAMS",
        title: "ATI Nutrition Proctored Exam Prep: Proven Tips to Boost Your Score",
        description: "Revision time running out? Put your biology study hours where they count.",
        href: "/blog/ati-nutrition-proctored-exam/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/finance": {
    heading: "Free Finance Exam Study Guides From Our Blog",
    description: "Free guides for finance exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Finance exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your finance test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your finance study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/accounting": {
    heading: "Free Accounting Exam Study Guides From Our Blog",
    description: "Free guides for accounting exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Accounting exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your accounting test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your accounting study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/anatomy": {
    heading: "Free Anatomy Exam Study Guides From Our Blog",
    description: "Free guides for anatomy exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Anatomy exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your anatomy test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "HEALTH SCIENCE EXAMS",
        title: "ATI Nutrition Proctored Exam Prep: Proven Tips to Boost Your Score",
        description: "Revision time running out? Put your anatomy study hours where they count.",
        href: "/blog/ati-nutrition-proctored-exam/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/law": {
    heading: "Free Law Exam Study Guides From Our Blog",
    description: "Free guides for law exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Law exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your law test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your law study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/sociology": {
    heading: "Free Sociology Exam Study Guides From Our Blog",
    description: "Free guides for sociology exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Sociology exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your sociology test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your sociology study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/computer-science": {
    heading: "Free Computer Science Exam Study Guides From Our Blog",
    description: "Free guides for computer science exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Computer Science exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your computer science test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "ONLINE TEST PLATFORMS",
        title: "Can Blackboard Detect Switching Tabs? What Students Should Know",
        description: "Revision time running out? Put your computer science study hours where they count.",
        href: "/blog/can-blackboard-detect-switching-tabs/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/english": {
    heading: "Free English Exam Study Guides From Our Blog",
    description: "Free guides for English exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "English exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your English test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your English study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/operation-management": {
    heading: "Free Operation Management Exam Study Guides From Our Blog",
    description: "Free guides for operation management exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Operation Management exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your operation management test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your operation management study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/exams/psychology": {
    heading: "Free Psychology Exam Study Guides From Our Blog",
    description: "Free guides for psychology exam prep, test formats, and getting through revision week.",
    cards: [
      {
        category: "ONLINE EXAMS",
        title: "How Do Online Exams Work? A Student’s Guide to the Online Exam Process",
        description: "Psychology exam coming up? Get familiar with the online test process before exam day.",
        href: "/blog/how-do-online-exams-work/",
      },
      {
        category: "EXAM FORMATS",
        title: "Exam Format 101: What Every College Student Needs to Know Before Test Day",
        description: "Timed questions or unfamiliar formats? Know what to expect in your psychology test.",
        href: "/blog/exam-format-guide/",
      },
      {
        category: "EXAM PREPARATION",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Revision time running out? Put your psychology study hours where they count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Exam Guides", href: "/blog/" },
  },
  "/assignment/accounting": {
    heading: "Free Accounting Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for accounting assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Accounting assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your accounting paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger accounting submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/computer-science": {
    heading: "Free Computer Science Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for computer science assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Computer Science assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your computer science paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger computer science submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/finance": {
    heading: "Free Finance Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for finance assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Finance assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your finance paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger finance submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/law": {
    heading: "Free Law Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for law assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Law assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your law paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger law submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/nursing": {
    heading: "Free Nursing Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for nursing assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Nursing assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your nursing paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger nursing submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/english": {
    heading: "Free English Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for English assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "English assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your English paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger English submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/economics": {
    heading: "Free Economics Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for economics assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Economics assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your economics paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger economics submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/engineering": {
    heading: "Free Engineering Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for engineering assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Engineering assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your engineering paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger engineering submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/chemistry": {
    heading: "Free Chemistry Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for chemistry assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Chemistry assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your chemistry paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger chemistry submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/history": {
    heading: "Free History Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for history assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "History assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your history paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger history submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/physics": {
    heading: "Free Physics Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for physics assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Physics assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your physics paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger physics submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/human-resource": {
    heading: "Free Human Resource Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for human resource assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Human Resource assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your human resource paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger human resource submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/sociology": {
    heading: "Free Sociology Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for sociology assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Sociology assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your sociology paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger sociology submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/philosophy": {
    heading: "Free Philosophy Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for philosophy assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Philosophy assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your philosophy paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger philosophy submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/linguistics": {
    heading: "Free Linguistics Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for linguistics assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Linguistics assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your linguistics paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger linguistics submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/operation-management": {
    heading: "Free Operation Management Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for operation management assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Operation Management assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your operation management paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Need a stronger operation management submission? Make each study session count.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/organizational-behavior": {
    heading: "Free Organizational Behavior Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for organizational behavior assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Organizational Behavior assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Research notes everywhere? Give your organizational behavior paper a clearer structure.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "ESSAY ARGUMENTS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger organizational behavior submission? Make each study session count.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/math": {
    heading: "Free Math Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for math assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Math assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your math paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations: Challenging Problems and How to Approach Them",
        description: "Need a stronger math submission? Make each study session count.",
        href: "/blog/hard-math-equations/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/assignment/statistics": {
    heading: "Free Statistics Assignment Study Guides From Our Blog",
    description: "Free writing and research guides for statistics assignments, tight deadlines, and clearer drafts.",
    cards: [
      {
        category: "ASSIGNMENT WRITING",
        title: "Advance Study Assignment for College Students: A Complete Guide",
        description: "Statistics assignment due soon? Put your ideas in order before the first draft.",
        href: "/blog/advance-study-assignment/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes everywhere? Give your statistics paper a clearer structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations: Challenging Problems and How to Approach Them",
        description: "Need a stronger statistics submission? Make each study session count.",
        href: "/blog/hard-math-equations/",
      },
    ],
    button: { label: "Browse All Assignment Guides", href: "/blog/" },
  },
  "/homework/math": {
    heading: "Free Math Homework Study Guides From Our Blog",
    description: "Free guides for tackling math homework, staying organized, and making study time count.",
    cards: [
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations",
        description: "Stuck on a tough equation? Break it into steps you can actually follow.",
        href: "/blog/hard-math-equations/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/statistics": {
    heading: "Free Statistics Homework Study Guides From Our Blog",
    description: "Free guides for tackling statistics homework, staying organized, and making study time count.",
    cards: [
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations",
        description: "Stuck on a tough equation? Break it into steps you can actually follow.",
        href: "/blog/hard-math-equations/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/chemistry": {
    heading: "Free Chemistry Homework Study Guides From Our Blog",
    description: "Free guides for tackling chemistry homework, staying organized, and making study time count.",
    cards: [
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/accounting": {
    heading: "Free Accounting Homework Study Guides From Our Blog",
    description: "Free guides for tackling accounting homework, staying organized, and making study time count.",
    cards: [
      {
        category: "TIME MANAGEMENT",
        title: "Why Is Time Management Important for Students Today?",
        description: "Deadlines sneaking up again? Plan your week before the pressure builds.",
        href: "/blog/why-is-time-management-important-for-students-today/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Want stronger grades this term? Build habits that last beyond one deadline.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/computer-science": {
    heading: "Free Computer Science Homework Study Guides From Our Blog",
    description: "Free guides for tackling computer science homework, staying organized, and making study time count.",
    cards: [
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations",
        description: "Stuck on a tough equation? Break it into steps you can actually follow.",
        href: "/blog/hard-math-equations/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/finance": {
    heading: "Free Finance Homework Study Guides From Our Blog",
    description: "Free guides for tackling finance homework, staying organized, and making study time count.",
    cards: [
      {
        category: "TIME MANAGEMENT",
        title: "Why Is Time Management Important for Students Today?",
        description: "Deadlines sneaking up again? Plan your week before the pressure builds.",
        href: "/blog/why-is-time-management-important-for-students-today/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Want stronger grades this term? Build habits that last beyond one deadline.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/physics": {
    heading: "Free Physics Homework Study Guides From Our Blog",
    description: "Free guides for tackling physics homework, staying organized, and making study time count.",
    cards: [
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations",
        description: "Stuck on a tough equation? Break it into steps you can actually follow.",
        href: "/blog/hard-math-equations/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/biology": {
    heading: "Free Biology Homework Study Guides From Our Blog",
    description: "Free guides for tackling biology homework, staying organized, and making study time count.",
    cards: [
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/history": {
    heading: "Free History Homework Study Guides From Our Blog",
    description: "Free guides for tackling history homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/english": {
    heading: "Free English Homework Study Guides From Our Blog",
    description: "Free guides for tackling English homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/operation-management": {
    heading: "Free Operation Management Homework Study Guides From Our Blog",
    description: "Free guides for tackling operation management homework, staying organized, and making study time count.",
    cards: [
      {
        category: "TIME MANAGEMENT",
        title: "Why Is Time Management Important for Students Today?",
        description: "Deadlines sneaking up again? Plan your week before the pressure builds.",
        href: "/blog/why-is-time-management-important-for-students-today/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "ACADEMIC SUCCESS",
        title: "How to Get Better Grades Consistently Every Semester",
        description: "Want stronger grades this term? Build habits that last beyond one deadline.",
        href: "/blog/how-to-get-better-grades/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/philosophy": {
    heading: "Free Philosophy Homework Study Guides From Our Blog",
    description: "Free guides for tackling philosophy homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/law": {
    heading: "Free Law Homework Study Guides From Our Blog",
    description: "Free guides for tackling law homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/engineering": {
    heading: "Free Engineering Homework Study Guides From Our Blog",
    description: "Free guides for tackling engineering homework, staying organized, and making study time count.",
    cards: [
      {
        category: "MATH PRACTICE",
        title: "Hard Math Equations",
        description: "Stuck on a tough equation? Break it into steps you can actually follow.",
        href: "/blog/hard-math-equations/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/psychology": {
    heading: "Free Psychology Homework Study Guides From Our Blog",
    description: "Free guides for tackling psychology homework, staying organized, and making study time count.",
    cards: [
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/nursing": {
    heading: "Free Nursing Homework Study Guides From Our Blog",
    description: "Free guides for tackling nursing homework, staying organized, and making study time count.",
    cards: [
      {
        category: "STUDY STRATEGIES",
        title: "15 Science-Backed Study Tips for Students to Boost Learning and Productivity",
        description: "Long study sessions not paying off? Try habits that fit your schedule.",
        href: "/blog/15-study-tips-for-students/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "HOMEWORK FOCUS",
        title: "How to Focus on Homework | Proven Strategies & Routines",
        description: "Homework distractions taking over? Find a routine that keeps you on task.",
        href: "/blog/how-to-focus-on-homework/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/sociology": {
    heading: "Free Sociology Homework Study Guides From Our Blog",
    description: "Free guides for tackling sociology homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/homework/geography": {
    heading: "Free Geography Homework Study Guides From Our Blog",
    description: "Free guides for tackling geography homework, staying organized, and making study time count.",
    cards: [
      {
        category: "ESSAY WRITING",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Unsure how to explain a topic? Make each paragraph easier to follow.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes all over the place? Give your next paper a clear structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC WRITING",
        title: "How to Write an Introduction for a Research Paper",
        description: "Can't get the first paragraph right? Start with a more focused opening.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Homework Guides", href: "/blog/" },
  },
  "/essay-writing/law": {
    heading: "Free Law Essay Writing Guides From Our Blog",
    description: "Free writing guides for stronger law essays, clearer arguments, and smoother drafts.",
    cards: [
      {
        category: "ARGUMENTATIVE ESSAYS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger argument? Choose a clear position and support it with facts.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
      {
        category: "ESSAY TOPICS",
        title: "Controversial Essay Topics",
        description: "Not sure what to write about? Find a topic with room for a real debate.",
        href: "/blog/controversial-essay-topics/",
      },
      {
        category: "ESSAY INTRODUCTIONS",
        title: "5 Proven Techniques: How to Write a Hook for an Essay",
        description: "Blank page staring back? Open with a line that gives readers a reason to stay.",
        href: "/blog/how-to-write-a-hook-for-an-essay/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
  "/essay-writing/history": {
    heading: "Free History Essay Writing Guides From Our Blog",
    description: "Free writing guides for stronger history essays, clearer arguments, and smoother drafts.",
    cards: [
      {
        category: "HISTORY WRITING",
        title: "How to Write a Thesis Statement for a History Paper",
        description: "History essay feeling scattered? Anchor it with one focused argument.",
        href: "/blog/how-to-write-a-thesis-statement-for-a-history-paper/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes piling up? Put your evidence into a cleaner structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ESSAY INTRODUCTIONS",
        title: "5 Proven Techniques: How to Write a Hook for an Essay",
        description: "Blank page staring back? Open with a line that gives readers a reason to stay.",
        href: "/blog/how-to-write-a-hook-for-an-essay/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
  "/essay-writing/nursing": {
    heading: "Free Nursing Essay Writing Guides From Our Blog",
    description: "Free writing guides for stronger nursing essays, clearer arguments, and smoother drafts.",
    cards: [
      {
        category: "EXPLANATORY ESSAYS",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Complex topic to explain? Keep your points clear from start to finish.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes piling up? Put your evidence into a cleaner structure.",
        href: "/blog/research-paper-examples/",
      },
      {
        category: "ACADEMIC RESEARCH",
        title: "How to Write an Introduction for a Research Paper",
        description: "First paragraph holding you back? Set up your argument from the start.",
        href: "/blog/how-to-write-an-introduction-for-a-research-paper/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
  "/essay-writing/psychology": {
    heading: "Free Psychology Essay Writing Guides From Our Blog",
    description: "Free writing guides for stronger psychology essays, clearer arguments, and smoother drafts.",
    cards: [
      {
        category: "ARGUMENTATIVE ESSAYS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger argument? Choose a clear position and support it with facts.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
      {
        category: "EXPLANATORY ESSAYS",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Complex topic to explain? Keep your points clear from start to finish.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes piling up? Put your evidence into a cleaner structure.",
        href: "/blog/research-paper-examples/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
  "/essay-writing/economics": {
    heading: "Free Economics Essay Writing Guides From Our Blog",
    description: "Free writing guides for stronger economics essays, clearer arguments, and smoother drafts.",
    cards: [
      {
        category: "ARGUMENTATIVE ESSAYS",
        title: "Mastering Argumentative Essay Topics for Students",
        description: "Need a stronger argument? Choose a clear position and support it with facts.",
        href: "/blog/argumentative-essay-topics-for-students/",
      },
      {
        category: "EXPLANATORY ESSAYS",
        title: "How to Write an Explanatory Essay: Tips & Topics",
        description: "Complex topic to explain? Keep your points clear from start to finish.",
        href: "/blog/how-to-write-an-explanatory-essay/",
      },
      {
        category: "RESEARCH PAPERS",
        title: "Research Paper Examples for Students: Format, Outline, and Samples",
        description: "Research notes piling up? Put your evidence into a cleaner structure.",
        href: "/blog/research-paper-examples/",
      },
    ],
    button: { label: "Browse All Essay Writing Guides", href: "/blog/" },
  },
};
