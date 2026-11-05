// Copy for the /tools/cumulative-gpa-calculator landing page. Layout lives in
// the shared LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const metaContent = {
  title: "Free CGPA Online Calculator for Students",
  description:
    "Calculate your CGPA online with our free CGPA online calculator. Enter your semester grades and credit hours to find out your CGPA quickly and easily.",
};

const TOOL_ANCHOR_ID = "cgpa-calculator-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const cgpaCalculatorLanding: LandingContent = {
  toolName: "CGPA Calculator",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "cgpa_calculator_landing",

  hero: {
    titleLead: "CGPA Online Calculator:",
    titleAccent: "Calculate Your CGPA in Seconds",
    subtitle:
      "This is a simple CGPA calculator that calculates your CGPA based on your grades and credits.",
  },

  mobileBar: {
    tool: toTool("Calculate CGPA"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is a CGPA Calculator?",
      paragraphs: [
        "A CGPA calculator is an online tool that helps students calculate their Cumulative Grade Point Average (CGPA). It uses your grades and credit hours to work out your overall result across different courses or semesters. Instead of doing the math yourself, you can use a GPA and CGPA online calculator to get your result quickly and see how you're doing in your studies.",
        "The way CGPA is calculated may differ from one school, college, or university to another. Some use the credit hours of each course, while others follow their own grading rules. To get the right result, enter your grades, credit hours, and any other details the calculator asks for. This helps you check your current grades and plan for the next semester.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        { label: "Works for", value: "Students calculating their cumulative grade point average" },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Calculate Your CGPA",
      subtitle: "Calculate your CGPA in three easy steps using your semester results.",
      steps: [
        {
          title: "Add Your Courses and Grades",
          description:
            "Enter each course you took this semester and the letter grade you earned.",
          note: {
            title: "Check Your Grades",
            description: "Make sure your semester results are correct.",
          },
        },
        {
          title: "Add Your Credit Hours",
          description:
            "Enter the credit hours for each course. To include past semesters, add your previous CGPA and total credits.",
          note: {
            title: "Verify Your Credits",
            description: "Use the details listed on your transcript.",
          },
        },
        {
          title: "View Your CGPA",
          description:
            "See your semester GPA and cumulative GPA update as you type to review your academic progress.",
          note: {
            title: "Plan Ahead",
            description: "Set goals for your upcoming semesters.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Benefits of Using a CGPA Calculator",
      subtitle:
        "Stay updated on your academic progress without calculating everything by hand.",
      cards: [
        {
          title: "Calculate CGPA Easily",
          description:
            "Calculate your cumulative grade point average without working through the formula manually.",
        },
        {
          title: "Save Time",
          description:
            "Get your CGPA more quickly by entering your academic details in one place.",
        },
        {
          title: "Track Academic Progress",
          description:
            "Review your overall grades to understand how you are performing across semesters.",
        },
        {
          title: "Set Study Goals",
          description:
            "Use your current CGPA to set realistic academic targets for upcoming semesters.",
        },
        {
          title: "Prepare for Applications",
          description:
            "Check your overall GPA when preparing for academic opportunities or further studies.",
        },
        {
          title: "Plan Future Semesters",
          description:
            "Understand your current standing and decide where to focus your efforts in future courses.",
        },
      ],
      button: toTool("Check Your CGPA"),
    },

    {
      type: "detailCards",
      title: "Key Things to Know About a CGPA Calculator",
      subtitle:
        "A CGPA online calculator helps you find your overall grade point average using your academic results.",
      items: [
        {
          name: "Semester GPA",
          description:
            "Your semester GPA shows your grade point average for one semester. It can be used to calculate your overall CGPA.",
          details: [
            {
              label: "GPA vs. CGPA",
              text: "GPA covers one semester, while CGPA combines results across semesters.",
            },
          ],
        },
        {
          name: "Credit Hours",
          description:
            "Credit hours show the weight of each course in your academic results. They help determine how much each course contributes to your CGPA.",
          details: [
            {
              label: "Course Weight",
              text: "Courses with more credit hours usually have a greater effect on your result.",
            },
          ],
        },
        {
          name: "Grade Point Scale",
          description:
            "A grade point scale assigns numerical values to letter grades. Your CGPA calculation should follow the scale used by your university.",
          details: [
            {
              label: "Grading System",
              text: "Check whether your university uses a 4.0 scale or another grading system.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Why Use Our CGPA Online Calculator?",
      items: [
        {
          title: "Easy to Use",
          description:
            "Enter your academic details to calculate your CGPA without complicated steps.",
        },
        {
          title: "Quick Results",
          description:
            "Get your CGPA calculation in seconds without doing the math yourself.",
        },
        {
          title: "Accurate Calculations",
          description:
            "Use the correct grades and credit hours to get a reliable result based on the calculator's formula.",
        },
        {
          title: "Free to Use",
          description:
            "Calculate your CGPA without paying any fees or creating an account.",
        },
      ],
    },

    {
      type: "comparison",
      title: "CGPA Calculator vs Paraphraser vs Grammar Checker vs Expert Writer",
      subtitle: "Each tool serves a different purpose. Here’s what each one helps you do.",
      columns: ["CGPA Calculator", "Paraphrasing Tool", "Grammar Checker"],
      highlight: "Expert Writer",
      rows: [
        {
          label: "What it does",
          values: [
            "Calculates cumulative grade point average",
            "Rewrites text in different words",
            "Fixes spelling, grammar, and punctuation",
          ],
          highlight: "Helps improve writing, structure and arguments",
        },
        {
          label: "Best for",
          values: [
            "Checking overall academic results",
            "Rewording sentences and paragraphs",
            "Proofreading assignments",
          ],
          highlight: "Improving essays and academic papers",
        },
        {
          label: "Uses",
          values: ["Grades, GPA and credit hours", "Existing text", "Written content"],
          highlight: "Essays, papers and assignments",
        },
        {
          label: "Improves grades",
          values: ["Helps track academic performance", "No", "No"],
          highlight: "Helps strengthen academic writing",
        },
        {
          label: "Cost on ScholarlyHelp",
          values: ["Free", "Free", "Free"],
          highlight: "Free quote",
        },
      ],
    },

    {
      type: "pointCards",
      tone: "cross",
      title: "Things to Avoid When Using a CGPA Calculator",
      subtitle:
        "Use the correct academic details to calculate your CGPA and avoid common mistakes.",
      items: [
        {
          title: "Don't Mix Up GPA and CGPA",
          description: "GPA covers one semester, while CGPA combines multiple semesters.",
        },
        {
          title: "Don't Ignore Credit Hours",
          description:
            "Credit hours affect how much each course contributes to your CGPA.",
        },
        {
          title: "Don't Use the Wrong Grading Scale",
          description: "Follow your university's grading system for accurate results.",
        },
        {
          title: "Don't Confuse CGPA With Percentage",
          description:
            "Use your university's conversion method when converting CGPA to a percentage.",
        },
      ],
      note: {
        before: "Want your writing to sound more natural? Try the free ",
        link: { label: "AI Humanizer", href: "/tools/ai-humanizer" },
        after: ".",
      },
    },

    {
      type: "ctaBand",
      tag: "Check your CGPA in seconds",
      titleStart: "Know where you stand academically with a quick CGPA calculation.",
      checks: [
        "Calculate your cumulative grade point average",
        "Use your semester GPA and credit hours",
        "Check your overall academic results",
      ],
      submitLabel: "Calculate Your CGPA",
      note: "Free to use · No sign-up required · Get your results in seconds",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How Your CGPA Can Affect Your Next Step" },
        {
          type: "paragraph",
          text: "Your CGPA can be important for your studies and future job. For example, a university may check your CGPA before giving you admission. You may also need good grades to apply for some scholarships or jobs. But don't worry if your grades aren't perfect. Your skills and experience count too.",
        },
        {
          type: "list",
          items: [
            {
              lead: "University Admissions:",
              text: "Thinking about applying to a university? Check its CGPA requirement first. Some courses accept students only if their grades meet a certain level.",
            },
            {
              lead: "Scholarships:",
              text: "Planning to apply for a scholarship? Check the rules before you apply. Some scholarships are only open to students with a certain CGPA.",
            },
            {
              lead: "Study Abroad:",
              text: "If you want to study in another country, check the university's entry rules. It may ask for your CGPA as part of your application.",
            },
            {
              lead: "Job Opportunities:",
              text: "Some companies look at CGPA when hiring fresh graduates. Good grades can be a plus, but they aren't the only thing that matters. Employers may also want to know what you can do and what skills you have.",
            },
          ],
        },

        { type: "heading", text: "Quick Tips to Improve Your CGPA" },
        {
          type: "paragraph",
          text: "You don't have to change everything about your study routine. Start with small habits and try to stick to them throughout the semester.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Attend Classes Regularly:",
              text: "Try to go to class every day. You can ask questions and understand the lesson while your teacher is explaining it.",
            },
            {
              lead: "Submit Assignments on Time:",
              text: "Don't wait until the last minute to start an assignment. Give yourself enough time to finish it and check your work.",
            },
            {
              lead: "Ask for Help Early:",
              text: "Stuck on a topic? Ask your teacher or a friend who understands it. There's no need to wait until exams to get help.",
            },
            {
              lead: "Study a Little Every Day:",
              text: "Spend some time going over what you learned in class. This is easier than trying to study everything in one night.",
            },
            {
              lead: "Study With Classmates:",
              text: "Get together with your classmates to go over your notes. If one of you understands a topic better, explain it to the others.",
            },
          ],
        },

        { type: "heading", text: "What is Semester GPA and Where Can You Find It?" },
        {
          type: "paragraph",
          text: "Semester GPA (also called SGPA) is your average grade for one semester. It shows how well you did in your subjects during that term.",
        },
        {
          type: "paragraph",
          text: "Your university calculates it based on your grades and the credit hours of each course.",
        },
        { type: "subheading", text: "Where to Find Your Semester GPA" },
        {
          type: "list",
          items: [
            {
              lead: "Student Portal:",
              text: "Log in to your university's online portal to check your grades.",
            },
            {
              lead: "Report Card:",
              text: "Check the report card you receive at the end of each semester.",
            },
            {
              lead: "Academic Transcript:",
              text: "Look at your official transcript, which lists your grades for completed courses.",
            },
            {
              lead: "Ask Your Teacher:",
              text: "If you cannot find your GPA, ask your teacher or academic office for help.",
            },
          ],
        },

        { type: "heading", text: "What are Credits and How Do You Find Them?" },
        {
          type: "paragraph",
          text: "Credit hours show the value of a course and how much it contributes to your overall CGPA. You need the correct credit hours to calculate your results properly.",
        },
        { type: "subheading", text: "Where to Find Your Credits" },
        {
          type: "list",
          items: [
            {
              lead: "Official Transcript:",
              text: "Check the credit hours listed beside each course.",
            },
            {
              lead: "Academic Portal:",
              text: "Log in to your student account to view course and semester details.",
            },
            {
              lead: "Course Syllabus:",
              text: "Check the course outline for its assigned credit hours.",
            },
          ],
        },
        {
          type: "callout",
          lead: "Want to check your overall grades?",
          text: "Use our free GPA and CGPA calculator to work out your cumulative grade point average.",
          button: toTool("Calculate CGPA"),
        },

        { type: "heading", text: "How Do Credit Hours Affect Your CGPA?" },
        {
          type: "paragraph",
          text: "Credit hours determine how much each course counts toward your overall CGPA. A course with more credit hours generally has a greater effect on your result than a course with fewer credit hours.",
        },
        {
          type: "paragraph",
          text: "For example, a four-credit course carries more weight than a two-credit course when calculating your CGPA with the CGPA online calculator, assuming both are included under the same grading rules.",
        },

        { type: "heading", text: "How CGPA and Percentage Differ" },
        {
          type: "paragraph",
          text: "You may have seen CGPA and percentage on your result card. Both show your academic results, but they use different scales.",
        },
        {
          type: "paragraph",
          text: "CGPA stands for Cumulative Grade Point Average. It gives you an idea of your overall grades across semesters. For example, a university may use a 4.0 or 5.0 scale. A percentage shows how many marks you scored out of 100. If you get 85 marks out of 100, your percentage is 85%.",
        },
        { type: "subheading", text: "Key Differences Between CGPA and Percentage" },
        {
          type: "table",
          head: ["CGPA", "Percentage"],
          rows: [
            [
              "Usually shown on a grade point scale, such as 4.0 or 5.0.",
              "Shown as a value out of 100.",
            ],
            [
              "Represents your overall grade point average.",
              "Represents marks earned compared with total possible marks.",
            ],
            [
              "Calculated using a university's grading system.",
              "Calculated from marks obtained and total marks.",
            ],
            [
              "Conversion to a percentage depends on the university's rules.",
              "Does not need conversion when your marks are already given as a percentage.",
            ],
          ],
        },

        { type: "heading", text: "Can You Convert CGPA to a Percentage?" },
        {
          type: "paragraph",
          text: "Yes, but you need to check your university's rules first. Different universities may use different formulas to convert CGPA into a percentage. A formula that works for one university may not work for another.",
        },
        {
          type: "paragraph",
          text: "If you want to convert your CGPA, check your university's grading policy or use a CGPA to percentage calculator that follows its conversion method.",
        },
        {
          type: "callout",
          lead: "Tip:",
          text: "Need to share your grades for a job, scholarship, or university application? Check the instructions first to make sure you use the correct conversion method.",
        },
      ],
    },

    {
      type: "moreTools",
      title: "Try More Free AI Writing Tools",
      subtitle: "Get all your study tools in one free dashboard and connect with a live tutor.",
      items: [
        {
          name: "AI Paraphraser",
          description:
            "Rewrite sentences in different words while keeping the original meaning clear.",
          href: "/tools/ai-paraphraser",
        },
        {
          name: "Citation Generator",
          description: "Create citations in APA, MLA, and Chicago style in just one click.",
          href: "/tools/citation-generator",
        },
        {
          name: "AI Humanizer",
          description: "Make AI-generated text sound natural, clear, and more human-like.",
          href: "/tools/ai-humanizer",
        },
        {
          name: "AI Study Workspace",
          description:
            "Upload study materials to get notes, quizzes, and tutor support in one place.",
          href: "/tools/ai-study-workspace",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What's the difference between GPA and CGPA?",
          answer:
            "GPA shows your average grades for one semester, while CGPA includes your results from all completed semesters. A CGPA GPA calculator can help you check your overall academic results.",
        },
        {
          question: "Can I calculate my CGPA if my university uses a different grading scale?",
          answer:
            "Yes, if the calculator supports your university's grading scale. Make sure you enter your grades using the correct scale to get a suitable result.",
        },
        {
          question: "What if I fail or repeat a semester?",
          answer:
            "Failed or repeated courses may affect your CGPA. The result depends on your university's rules for handling failed and repeated courses.",
        },
        {
          question: "Can I improve my CGPA in the final semesters?",
          answer:
            "Yes, you can improve your CGPA by earning better grades in your remaining courses. Our target CGPA calculator can help you estimate the grades you may need if it supports future grade calculations.",
        },
        {
          question: "What's a good CGPA for university admission?",
          answer:
            "It depends on the university and program. Check the admission requirements to find out what CGPA you need to qualify.",
        },
        {
          question: "Can internships or projects improve my CGPA?",
          answer:
            "They may help if your university awards grades or credit hours for them. Check your university's rules to understand how internships and projects affect your CGPA. If you need to convert your CGPA to a percentage, use a CGPA to percentage calculator that follows your university's conversion method.",
        },
        {
          question: "Can I calculate my CGPA from my semester GPA?",
          answer:
            "Yes, you can calculate your CGPA using your semester GPAs and credit hours. A GPA to CGPA calculator can help you work out your overall grade point average.",
        },
        {
          question: "Can I use Excel to calculate my CGPA?",
          answer:
            "Yes, you can use a CGPA calculator Excel sheet to calculate your CGPA. Enter your grades and credit hours, then apply the calculation method used by your university.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Curious About Your CGPA?",
      body: "Get your overall grade point average and see where you stand academically.",
      primary: toTool("Calculate Now"),
    },
  ],
};
