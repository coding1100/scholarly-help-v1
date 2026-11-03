// Copy for the /tools/ai-math-helper landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const mathSolverMeta = {
  title: "AI Math Helper – Solve Math Problems Step by Step",
  description:
    "Use our free AI Math Helper to solve math problems, understand step-by-step solutions, and get help with algebra, geometry, calculus, and more.",
};

const TOOL_ANCHOR_ID = "math-solver-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const mathSolverLanding: LandingContent = {
  toolName: "AI Math Solver",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "math_solver_landing",

  hero: {
    titleLead: "AI Math Helper:",
    titleAccent: "Solve Any Math Problem in Seconds",
    subtitle:
      "Having trouble with a math problem? Our AI Math Helper helps you solve questions quickly with easy, step-by-step solutions. Get help with everything from basic calculations to algebra and complex equations, all in one place.",
  },

  mobileBar: {
    tool: toTool("Solve a problem"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is an AI Math Helper?",
      paragraphs: [
        "A Math AI Helper is an online tool that helps students solve math problems and understand how to find the correct answers. It can assist with different types of questions, including basic arithmetic, algebra, fractions, percentages, and equations. Instead of spending too much time figuring out a difficult problem, students can use the tool to get help with calculations and follow the steps involved in solving a question. It can be useful for completing homework, checking answers, and preparing for math tests.",
        "A Math Helper is helpful for students at different learning levels, whether they are learning basic calculations or working on more advanced math topics. It can make difficult questions easier to approach by breaking them into smaller steps and showing how a solution is reached. Students can use it to check their work, understand mistakes, and practice similar problems. However, it is important to review the steps and understand the concepts rather than relying only on the final answer.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Students, teachers, and anyone who needs help solving math problems",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "How to Use Math AI Helper in 3 Easy Steps",
      subtitle:
        "Solve your math questions in a few simple steps. Enter your problem, get a solution, and learn how to find the answer.",
      steps: [
        {
          title: "Enter Your Math Question",
          description:
            "Type or paste the math problem you want to solve into the given input box.",
          note: {
            title: "Add Your Problem",
            description:
              "Check your question to make sure all numbers and symbols are entered correctly.",
          },
        },
        {
          title: "Solve Your Math Problem",
          description: "Click the solve button to get the answer to your question.",
          note: {
            title: "Get the Answer",
            description:
              "Let the Math AI Helper work through the problem and show you the solution.",
          },
        },
        {
          title: "Check the Solution",
          description:
            "Read through the solution and follow the steps to see how the answer was calculated.",
          note: {
            title: "Understand the Steps",
            description:
              "Use the explanation to check your work and practice solving similar math problems.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our Math Helper?",
      subtitle:
        "Math Helper makes it easier to solve math questions and understand different topics. It helps students with homework, calculations, and practice problems.",
      cards: [
        {
          title: "Get Help With Different Math Topics",
          description:
            "Solve questions from different areas of math, including basic calculations, fractions, algebra, and equations.",
        },
        {
          title: "Understand Math Solutions",
          description:
            "Follow the steps to see how a problem is solved. This helps you understand the process instead of just looking at the answer.",
        },
        {
          title: "Save Time on Difficult Questions",
          description:
            "Get help when you are stuck on a math problem. Spend less time figuring out where to start and more time learning how to solve it.",
        },
        {
          title: "Check Your Math Answers",
          description:
            "Compare your answers with the solutions provided by the tool. This makes it easier to find mistakes and correct your calculations.",
        },
        {
          title: "Improve Your Math Skills",
          description:
            "Practice different questions and review their solutions to become more familiar with math concepts and problem-solving methods.",
        },
        {
          title: "Get Help Anytime",
          description:
            "Use Math Helper whenever you need support with homework, practice questions, or math assignments.",
        },
      ],
      button: toTool("Try It for Free"),
    },

    {
      type: "detailCards",
      title: "Who Can Use Math Helper?",
      subtitle:
        "Math Helper is useful for people who work with math problems and need support with calculations and different topics.",
      items: [
        {
          name: "Students",
          description:
            "Students can use Math Helper for homework, assignments, and exam preparation.",
          details: [
            {
              label: "Study Support",
              text: "Review solutions and learn new ways to approach difficult questions.",
            },
          ],
        },
        {
          name: "Teachers",
          description:
            "Teachers can use Math Helper to prepare examples and check answers before lessons.",
          details: [
            {
              label: "Lesson Preparation",
              text: "Find clear examples to make math topics easier to explain.",
            },
          ],
        },
        {
          name: "Researchers",
          description:
            "Researchers can use Math Helper to check calculations and work through mathematical problems.",
          details: [
            {
              label: "Calculation Support",
              text: "Solve calculations and review the steps to check your results.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "What Math Problems Can Math Helper Solve?",
      subtitle:
        "Math AI Helper free helps you solve different math problems, from basic sums to more difficult questions. It also helps you understand how to solve them.",
      items: [
        {
          title: "Algebra Help",
          description:
            "Solve equations, simplify expressions, and find unknown values with clear steps.",
        },
        {
          title: "Calculus Support",
          description:
            "Work through derivatives, integrals, and limits while understanding each step.",
        },
        {
          title: "Geometry Problems",
          description:
            "Solve problems involving shapes, angles, area, perimeter, and volume.",
        },
        {
          title: "Graphing",
          description:
            "Solve functions and equations using graphs to understand how it works.",
        },
      ],
    },

    {
      type: "comparison",
      title: "Math Helper vs Read My Essay vs Grammar Checker vs CGPA Calculator",
      subtitle:
        "Each tool is designed to help with a different academic task. Compare their features below to see what each tool does and how it can support your studies.",
      columns: ["Read My Essay", "Grammar Checker", "CGPA Calculator"],
      highlight: "Math Helper",
      rows: [
        {
          label: "What it does",
          values: [
            "Converts written text into spoken audio",
            "Checks spelling, grammar, and punctuation",
            "Calculates cumulative grade point average",
          ],
          highlight: "Helps solve math problems with step-by-step solutions",
        },
        {
          label: "Best for",
          values: [
            "Listening to essays and written content",
            "Checking and improving written work",
            "Checking overall academic results",
          ],
          highlight: "Solving math questions and understanding solutions",
        },
        {
          label: "Uses",
          values: [
            "Essays, articles, and assignments",
            "Essays, reports, and other written content",
            "Grades, GPA, and credit hours",
          ],
          highlight: "Equations, algebra, geometry, and calculus",
        },
        {
          label: "Main benefit",
          values: [
            "Makes written content easier to listen to",
            "Helps improve writing quality",
            "Helps track academic performance",
          ],
          highlight: "Makes math problems easier to solve and understand",
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
      title: "Mistakes to Avoid When Using Math Helper",
      subtitle:
        "Math AI Helper free can make working on math questions easier, but getting useful results also depends on how you use the tool. Avoid these common mistakes to get the most out of it.",
      items: [
        {
          title: "Using Incorrect Symbols",
          description:
            "Enter the correct signs, numbers, and symbols so the tool can understand your math question.",
        },
        {
          title: "Choosing the Wrong Problem Type",
          description:
            "Make sure you enter the complete question and include all the details needed to solve it.",
        },
        {
          title: "Not Reviewing the Solution",
          description:
            "Take time to read the explanation and understand why each step is needed.",
        },
        {
          title: "Skipping Practice",
          description:
            "Try solving similar questions on your own to improve your skills and remember the methods.",
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
      tag: "Solve math problems in simple steps",
      titleStart:
        "Get help with math questions and understand how to reach the correct answer with ease.",
      checks: [
        "Solve algebra, geometry, calculus, and basic math problems",
        "Follow step-by-step solutions to understand each calculation",
        "Check your answers and learn from mistakes",
      ],
      submitLabel: "Try Math Helper",
      note: "Free to use · No sign-up required · Easy math solutions",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "When Can You Use a Math Helper?" },
        {
          type: "paragraph",
          text: "Math Helper AI can be useful whenever you need help solving a math problem or understanding a difficult concept. Whether you are completing homework, preparing for a test, or checking your calculations, it gives you a simple way to work through different math questions.",
        },
        {
          type: "list",
          items: [
            {
              lead: "While Completing Math Homework:",
              text: "Use AI Helper Math when you get stuck on a homework question. Review the solution steps to understand how to solve the problem correctly.",
            },
            {
              lead: "When Preparing for Exams:",
              text: "Practice different math questions and review their solutions before an exam. This can help you understand important concepts and feel more prepared.",
            },
            {
              lead: "When Learning a New Math Topic:",
              text: "If you are having trouble understanding algebra, geometry, or calculus, use Math Helper to work through examples and learn how each problem is solved.",
            },
            {
              lead: "When Checking Your Calculations:",
              text: "Compare your answers with the solutions provided by Math Helper. This can help you find calculation errors and understand where you need to improve.",
            },
          ],
        },
      ],
    },

    {
      type: "cards",
      title: "Key Features of Our Math Helper",
      subtitle:
        "Our Math Helper provides useful features to make solving math problems easier. Get help with different questions, understand solutions, and work through calculations whenever you need.",
      cards: [
        {
          title: "100M+ Math Problems",
          description:
            "Access a massive collection of solved math problems covering different subjects and learning levels.",
        },
        {
          title: "98% Accuracy Rate",
          description: "Get precise solutions with our advanced Math AI Solver.",
        },
        {
          title: "All-in-One Solution",
          description:
            "Solve everything from basic arithmetic to advanced calculus in one place.",
        },
        {
          title: "24/7 Instant Help",
          description:
            "Get quick assistance with your math questions anytime, anywhere.",
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How Does Math Helper Work?" },
        {
          type: "paragraph",
          text: "Math AI Helper takes the math question you enter and processes it to find the answer. It examines the mathematical information, selects an appropriate method, performs the required calculations, and presents the result in a clear format.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              lead: "Input Recognition:",
              text: "The tool reads your submitted question and identifies its mathematical components, including numbers, symbols, equations, and expressions.",
            },
            {
              lead: "Problem Classification:",
              text: "It determines the type of problem, such as algebra, geometry, or arithmetic, to establish which mathematical approach is suitable.",
            },
            {
              lead: "Mathematical Calculation:",
              text: "The tool applies relevant formulas, rules, and operations to solve the problem and work out the result.",
            },
            {
              lead: "Solution Presentation:",
              text: "The final answer is displayed with relevant working steps, allowing you to review the calculations and understand how the result was reached.",
            },
          ],
        },
      ],
    },

    {
      type: "moreTools",
      title: "Discover More Free Academic Tools",
      subtitle:
        "Make studying and academic tasks easier with a collection of free online tools designed to support your learning and writing.",
      items: [
        {
          name: "CGPA Calculator",
          description:
            "Find out your cumulative GPA and keep track of your academic progress.",
          href: "/tools/cumulative-gpa-calculator",
        },
        {
          name: "Grammar Checker",
          description:
            "Improve your writing by finding grammar, spelling, and punctuation errors.",
          href: "/tools/ai-grammar-check",
        },
        {
          name: "Read My Essay",
          description:
            "Convert your essays and other written content into speech and listen to your text",
          href: "/tools/read-my-essay",
        },
        {
          name: "Plagiarism Checker",
          description:
            "Check your text for matching content and identify sections that may need proper citations.",
          href: "/tools/plagiarism-checker",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions About Math Helper",
      items: [
        {
          question: "Is Math Helper free to use?",
          answer:
            "Yes, our free AI Math Helper can help you work through math questions without the need for expensive tutoring or extra resources. You can use it to solve problems and review their solutions.",
        },
        {
          question: "What types of mathematical problems can Math Helper solve?",
          answer:
            "Math Helper can assist with several areas of mathematics, including basic arithmetic, algebra, geometry, calculus, fractions, percentages, and equations. It is useful for both simple calculations and more challenging questions.",
        },
        {
          question: "How accurate are the solutions provided by Math Helper?",
          answer:
            "Math Helper is designed to provide helpful solutions to mathematical questions. However, results may depend on how clearly a problem is entered and the complexity of the calculation. It is always a good idea to review the working steps and verify important answers.",
        },
        {
          question: "Can Math Helper handle complex calculus and advanced mathematics?",
          answer:
            "Math Helper can assist with calculus questions involving limits, differentiation, and integration. It may also help with other advanced topics, depending on the complexity of the problem. Reviewing the explanation can help you understand the method used.",
        },
        {
          question: "How does Math Helper compare to using regular ChatGPT for math problems?",
          answer:
            "Math Helper is designed specifically for solving math questions, while ChatGPT is a general-purpose AI assistant that handles many different tasks. A dedicated math tool offers a more focused way to enter problems, review calculations, and understand mathematical solutions.",
        },
        {
          question: "Is Math Helper useful for checking homework answers?",
          answer:
            "Yes, you can compare the solutions with your own work to check calculations and identify mistakes. Reviewing the steps can also help you understand where you went wrong.",
        },
        {
          question: "Can I use Math Helper as a replacement for traditional math learning methods?",
          answer:
            "Math Helper is best used alongside regular learning and practice. It can help you understand difficult questions, review calculations, and check your work, but it should not replace studying textbooks, attending lessons, or practicing problems independently.",
        },
        {
          question: "Does Math Helper work on mobile devices?",
          answer:
            "You can access free Math AI Helper through a web browser on a compatible mobile device, as well as on a computer. This makes it convenient to get help with math questions while studying at home, at school, or on the go.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Stuck on a",
      titlePill: "Math Problem?",
      body: "Enter your question and see how to solve it, step by step.",
      primary: toTool("Solve My Problem"),
    },
  ],
};
