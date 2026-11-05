// Copy for the /tools/ai-exam-prep landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const examPrepMeta = {
  title: "Online Exam Prep – Create Your Free Study Plan",
  description:
    "Prepare for your next exam with a personalized study schedule. Set your exam date, choose your subject, and plan your daily study hours for the exam prep.",
};

const TOOL_ANCHOR_ID = "exam-prep-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const examPrepLanding: LandingContent = {
  toolName: "Online Exam Prep",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "exam_prep_tool_landing",

  hero: {
    titleLead: "Online Exam Prep:",
    titleAccent: "Master Your Exam With Confidence",
    subtitle:
      "Explore powerful academic tools, smart study resources, and personalized learning solutions designed to simplify your coursework and help you achieve academic success.",
  },

  mobileBar: {
    tool: toTool("Create study plan"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What Is an Online Exam Prep Tool?",
      paragraphs: [
        "An online exam prep tool is a digital resource that helps students create a personalized study plan for their upcoming exams. It allows students to enter their exam type, subject, exam date, current knowledge level, target score, and available study hours. Based on these details, the tool creates a structured study schedule that makes exam preparation easier to manage.",
        "With an online exam prep tool, students can organize their daily study sessions, set realistic preparation goals, and make better use of their available time. Whether you're preparing for the SAT, GAT, or another academic exam, a personalized study schedule can help you stay focused, cover important topics, and work toward your target score with confidence.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Students, test-takers, and anyone preparing for academic exams",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "How to Use Online Exam Prep in 3 Easy Steps",
      subtitle:
        "Making a study plan is simple. Just add your exam details, tell us how much time you have to study, and get a schedule to help you prepare.",
      steps: [
        {
          title: "Enter Your Exam Details",
          description:
            "Choose the exam you're preparing for, such as the SAT, GAT, or another test. Select your subject and enter your exam date.",
          note: {
            title: "Add Your Study Information",
            description:
              "Choose your current knowledge level, add your target score if you have one, and enter how many hours you can study each day.",
          },
        },
        {
          title: "Create Your Study Schedule",
          description:
            "Once you've filled in all the details, click the Create Study Schedule button to get your study plan.",
          note: {
            title: "Get Your Study Plan",
            description:
              "The tool uses the details you entered to put together a schedule that fits your exam date and daily study hours.",
          },
        },
        {
          title: "Follow Your Study Plan",
          description:
            "Use your schedule to decide what to study and when. Try to follow it each day so you can make good use of the time before your exam.",
          note: {
            title: "Stay on Top of Your Studies",
            description:
              "Work through your planned study sessions, go over difficult topics again, and keep revising as your exam date gets closer.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our Online Exam Prep Tool?",
      subtitle:
        "Getting ready for an exam can be stressful, especially when you have a lot to study and don't know where to start. Our Online Exam Prep tool helps you make a study schedule based on your exam date, subject, and the time you have each day. It gives you a clear plan to follow so you can prepare without feeling lost.",
      cards: [
        {
          title: "Get a Study Plan Made for You",
          description:
            "Every student has different study needs. Enter your exam details, current knowledge level, and available study hours to get a schedule that suits your preparation.",
        },
        {
          title: "Prepare for Different Exams",
          description:
            "Preparing for the SAT, GAT, or another test? Select your exam type and subject to create a study schedule for the exam you're taking.",
        },
        {
          title: "Plan Your Daily Study Hours",
          description:
            "Not everyone has the same amount of time to study. Add the hours you can manage each day, and the tool will use them to create your schedule.",
        },
        {
          title: "Keep Your Target Score in Mind",
          description:
            "Have a score you want to achieve? Add it to your details as an optional goal. It can help you stay focused on what you want to accomplish.",
        },
        {
          title: "Know How Much Time You Have",
          description:
            "Enter your exam date to plan your preparation around the time left. This makes it easier to organize your study sessions before exam day.",
        },
        {
          title: "Follow a Clear Study Routine",
          description:
            "Instead of deciding what to study every day, use your schedule as a guide. Follow your planned sessions and make time to review what you have learned.",
        },
      ],
      button: toTool("Create Your Free Study Plan Now"),
    },

    {
      type: "detailCards",
      title: "Who Can Use Online Exam Prep?",
      subtitle:
        "Online Exam Prep is helpful for anyone who wants to prepare for an exam with a clear study schedule. It supports different learning needs and helps users plan their preparation based on their exam date, current knowledge, and available study time.",
      items: [
        {
          name: "Students Preparing for Entrance Exams",
          description:
            "Students getting ready for college or university entrance exams can use the tool to organize their preparation.",
          details: [
            {
              label: "Plan Ahead",
              text: "Set your exam date and target score to create a study schedule that keeps you focused on your admission goals.",
            },
          ],
        },
        {
          name: "Students Preparing for Standardized Tests",
          description:
            "Students taking tests like the SAT or GAT can use Online Exam Prep to plan their daily study sessions.",
          details: [
            {
              label: "Stay on Schedule",
              text: "Choose your exam type, subject, and current knowledge level to get a study plan based on your needs.",
            },
          ],
        },
        {
          name: "Students With Limited Study Time",
          description:
            "Students who have classes, assignments, or other responsibilities can use the tool for an exam preparation plan around a busy routine.",
          details: [
            {
              label: "Make Time for Studying",
              text: "Enter how many hours you can study each day and get a schedule that considers your available time.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Features of Our Online Exam Prep Tool",
      items: [
        {
          title: "Multiple Exam Options",
          description:
            "Choose the exam you're preparing for, such as the SAT, GAT, or another test, and create a study plan that matches your exam needs.",
        },
        {
          title: "Subject Selection",
          description:
            "Select the subject you want to focus on so your preparation plan is based on the areas you need to study.",
        },
        {
          title: "Custom Exam Date",
          description:
            "Enter your upcoming exam date to help organize your preparation around the time you have left.",
        },
        {
          title: "Flexible Study Goals",
          description:
            "Add your current knowledge level, optional target score, and daily study hours to get a personalized study schedule that fits your needs.",
        },
      ],
    },

    {
      type: "comparison",
      title: "Exam Prep vs Read My Essay vs RQ Generator vs CGPA Calculator",
      subtitle:
        "ScholarlyHelp offers a range of academic tools to support students with exam preparation, written content, research projects, and grade calculations. Each tool is designed for a different academic need, helping students manage their work more effectively.",
      columns: ["Read My Essay", "RQ Generator", "CGPA Calculator"],
      highlight: "Exam Prep",
      rows: [
        {
          label: "What it does",
          values: [
            "Reads written content aloud",
            "Creates research questions from a given topic",
            "Calculates cumulative GPA",
          ],
          highlight:
            "Creates a personalized study schedule based on exam details and available study time",
        },
        {
          label: "Best for",
          values: [
            "Students who prefer listening to their written work",
            "Students working on research projects",
            "Students checking their academic performance",
          ],
          highlight: "Students preparing for upcoming exams",
        },
        {
          label: "Uses",
          values: [
            "Essays, notes, and study materials",
            "Research papers, academic topics, and projects",
            "Semester grades, GPA, and credit hours",
          ],
          highlight: "Exam dates, subjects, study hours, and preparation goals",
        },
        {
          label: "Main benefit",
          values: [
            "Makes it easier to listen to and review written content",
            "Helps students find useful questions to guide their research",
            "Helps students understand their overall academic standing",
          ],
          highlight:
            "Helps students organize their study time and follow a structured preparation plan",
        },
        {
          label: "Cost on ScholarlyHelp",
          values: ["Free", "Free", "Free"],
          highlight: "Free",
        },
      ],
    },

    {
      type: "pointCards",
      tone: "cross",
      title: "Mistakes to Avoid When Using Online Exam Prep",
      subtitle:
        "Online Exam Prep can help you organize your study time and prepare for upcoming exams. However, the quality of your study schedule also depends on the information you provide and how consistently you follow the plan for problem solving test practice. Avoid these common mistakes to make better use of the tool.",
      items: [
        {
          title: "Entering the Wrong Exam Date",
          description: "Choose the correct exam date to plan your preparation time properly.",
        },
        {
          title: "Selecting the Wrong Knowledge Level",
          description:
            "Be honest about your current understanding so your study plan matches your needs.",
        },
        {
          title: "Setting Unrealistic Study Hours",
          description: "Enter study hours that fit your daily routine and are easy to maintain.",
        },
        {
          title: "Ignoring Your Study Schedule",
          description: "Follow your daily plan consistently and make time to review each topic.",
        },
      ],
      note: {
        before: "Want to improve your writing? Try the free ",
        link: { label: "Grammar Checker", href: "/tools/ai-grammar-check" },
        after: " to find and fix writing mistakes.",
      },
    },

    {
      type: "ctaBand",
      tag: "Create a personalized exam study schedule",
      titleStart:
        "Plan your online test preparation with a study schedule based on your subject, exam date, and available study time.",
      checks: [
        "Choose your exam type and subject",
        "Set your exam date and current knowledge level",
        "Add your target score and daily study hours",
      ],
      submitLabel: "Try Online Exam Prep",
      note: "Free to use · No sign-up required · Personalized study schedule",
    },

    {
      type: "cards",
      title: "Why Online Exam Prep Beats Manual Study Planning",
      subtitle:
        "Creating a study schedule manually can take time and make exam preparation confusing. Our Online Exam Prep tool makes the process easier by creating a personalized study plan based on your exam details, study goals, and available time.",
      cards: [
        {
          title: "Save Time on Study Planning",
          description:
            "Create a personalized study schedule in less time instead of spending hours organizing topics, setting study hours, and planning your daily preparation.",
        },
        {
          title: "Organize Your Daily Study Hours",
          description:
            "Divide your available study time into manageable sessions so you can balance exam preparation with your regular classes, assignments, and other responsibilities.",
        },
        {
          title: "Set Clear Study Goals",
          description:
            "Add your current knowledge level and optional target score to create a study plan that reflects your preparation needs and helps you work toward your academic goals.",
        },
        {
          title: "Prepare According to Your Exam Date",
          description:
            "Enter your upcoming exam date to get a schedule that considers how much preparation time you have and helps you plan your studies accordingly.",
        },
        {
          title: "Build a Consistent Study Routine",
          description:
            "Follow a structured study schedule to stay organized, cover your subject regularly, and avoid leaving all your preparation until the last few days.",
        },
        {
          title: "Make Exam Preparation More Manageable",
          description:
            "Break your preparation into planned study sessions instead of trying to cover everything at once. This can help you approach your upcoming exam with a clearer plan.",
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How to Set Realistic Study Goals" },
        {
          type: "paragraph",
          text: "Setting realistic study goals can help you stay focused and make better use of your preparation time. Instead of trying to study everything in one day, break your workload into smaller and more manageable targets.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              lead: "Decide What You Need to Study:",
              text: "List the subjects and topics you need to cover before your exam. This gives you a clear idea of how much preparation is required.",
            },
            {
              lead: "Set Daily Study Targets:",
              text: "Choose a few topics to complete each day instead of planning too many tasks at once. Make sure your targets fit your available study hours.",
            },
            {
              lead: "Focus on Difficult Topics First:",
              text: "Give extra attention to subjects or topics you find challenging. This helps you use your study time where it is needed most.",
            },
            {
              lead: "Create Weekly Goals:",
              text: "Set weekly targets for completing topics, reviewing notes, and practicing important concepts. This helps you keep track of your preparation.",
            },
            {
              lead: "Leave Time for Revision:",
              text: "Do not use all your available time to study new topics. Keep some time for reviewing what you have already learned.",
            },
            {
              lead: "Adjust Your Goals When Needed:",
              text: "If a target is difficult to achieve, change your plan instead of giving up. A flexible study routine is easier to maintain.",
            },
          ],
        },
        {
          type: "callout",
          text: "Plan your preparation with ScholarlyHelp's Online Exam Prep tool. Enter your exam details, target score, and available study hours to create a personalized study schedule.",
        },
      ],
    },

    {
      type: "moreTools",
      title: "Discover More Free Academic Tools",
      subtitle:
        "Explore more free ScholarlyHelp tools to support your exam preparation, improve your writing, and manage your academic tasks with ease.",
      items: [
        {
          name: "AI Humanizer",
          description:
            "Make AI-generated text sound more natural and human while keeping your original meaning.",
          href: "/tools/ai-humanizer",
        },
        {
          name: "Read My Essay",
          description:
            "Listen to your essays, notes, and study materials instead of reading everything on screen.",
          href: "/tools/read-my-essay",
        },
        {
          name: "Research Question Generator",
          description: "Create research questions from your topic to guide your academic work.",
          href: "/tools/research-question-generator",
        },
        {
          name: "CGPA Calculator",
          description: "Calculate your cumulative GPA using your grades and credit hours.",
          href: "/tools/cumulative-gpa-calculator",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How does the Online Exam Prep tool work?",
          answer:
            "Enter your exam details, select your current knowledge level, and add your daily study hours. The tool uses this information to create a personalized study schedule.",
        },
        {
          question: "Is Online Exam Prep free to use?",
          answer:
            "Yes, you can use the Online Exam Practice Test Prep tool on ScholarlyHelp for free to create your personalized study schedule.",
        },
        {
          question: "Can I use this tool for different types of exams?",
          answer:
            "Yes, you can enter different exam types, such as the SAT, GAT, and other academic tests, to plan your preparation.",
        },
        {
          question: "Can I add my target score to the study plan?",
          answer:
            "Yes, you can enter your target score as an optional detail to set a clear goal for your exam preparation.",
        },
        {
          question: "Can I use Online Exam Prep if I have limited study time?",
          answer:
            "Yes, enter the number of hours you can study each day. The tool uses your available time to create a study schedule.",
        },
        {
          question: "Do I need to know my subject well before using this tool?",
          answer:
            "No, you can select your current knowledge level, whether you are a beginner or already familiar with the subject.",
        },
        {
          question: "Can I create a study schedule for an upcoming exam?",
          answer:
            "Yes, enter your exam date to get a study schedule based on the time you have left before your exam.",
        },
        {
          question: "Does Online Exam Prep guarantee a high exam score with mock exam online practice?",
          answer:
            "No, the tool helps you organize your study time, but your results depend on how well you prepare, follow your study schedule, and make time for mock exam practice.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Ready to Prepare for Your Next",
      titlePill: "Exam?",
      body: "Create your own study schedule, set your study goals, and plan your exam preparation. Start building your study plan today!",
      primary: toTool("Create My Study Plan"),
      secondary: toTool("Try It for Free"),
    },
  ],
};
