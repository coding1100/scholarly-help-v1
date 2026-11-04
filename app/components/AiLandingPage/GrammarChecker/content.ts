// Copy for the /tools/ai-grammar-check landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const grammarCheckerMeta = {
  title: "Free AI Grammar Checker – Check and Fix Grammar Mistakes",
  description:
    "Make your writing better with our free AI Grammar Checker. Find common mistakes and correct your sentences before sharing your work.",
};

const TOOL_ANCHOR_ID = "grammar-checker-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const grammarCheckerLanding: LandingContent = {
  toolName: "AI Grammar Checker",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "grammar_checker_tool_landing",

  hero: {
    titleLead: "Free AI Grammar Checker:",
    titleAccent: "Simplify Your Writing Workflow",
    subtitle:
      "ScholarlyHelp's free grammar checker reviews your writing to fix grammar mistakes, improve sentence structure, and make your words clear and easy to understand.",
  },

  mobileBar: {
    tool: toTool("Check grammar"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is an AI Grammar Checker?",
      paragraphs: [
        "A grammar checker is an online tool that helps you find and fix mistakes in your writing. It checks your text for grammar errors and suggests corrections to make your sentences sound right. Whether you are writing an essay, an email, or an assignment, it helps you improve your writing without spending too much time checking every sentence yourself.",
        "With ScholarlyHelp's AI Grammar Checker, you can paste your text or type directly into the editor to check your writing. The tool helps you spot common grammar mistakes so you can correct them and make your work easier to read. It's a simple way to review your writing before submitting an assignment or sharing your work.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Essays, assignments, emails, articles, and everyday writing",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Check Your Grammar",
      subtitle:
        "Check your text in just three easy steps and fix mistakes before using your writing.",
      steps: [
        {
          title: "Add Your Text",
          description:
            "Paste your text into the AI Grammar Checker or type directly in the box.",
          note: {
            title: "Enter Your Writing",
            description:
              "You can add an essay, school assignment, email, or any other text.",
          },
        },
        {
          title: "Check for Mistakes",
          description: "Click the Check Grammar button to find mistakes in your writing.",
          note: {
            title: "See What Needs Fixing",
            description: "The tool will show you where your grammar needs improvement.",
          },
        },
        {
          title: "Fix Your Errors",
          description:
            "Go through the suggested changes and correct the mistakes in your text.",
          note: {
            title: "Make Your Writing Better",
            description:
              "Read your text again to make sure everything looks right before you submit it.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Benefits of Using an AI Grammar Checker",
      subtitle:
        "An AI grammar checker helps you improve your writing by finding common mistakes and showing you what needs to be fixed. Here are some ways that can make your writing better.",
      cards: [
        {
          title: "Correct Punctuation Mistakes",
          description:
            "Find missing commas, periods, and apostrophes in your text. Correct punctuation helps your sentences make sense and keeps your message clear.",
        },
        {
          title: "Detect Grammar Errors",
          description:
            "Find grammar mistakes in your writing and see which sentences need correction. This makes it easier to fix errors before finishing your work.",
        },
        {
          title: "Improve Sentence Structure",
          description:
            "Fix sentences that sound awkward or are hard to understand. Better sentence structure helps your ideas flow naturally.",
        },
        {
          title: "Fix Spelling Mistakes",
          description:
            "Catch misspelled words and correct them before sharing your writing. This helps you avoid small spelling errors in your essays and assignments.",
        },
        {
          title: "Improve Readability",
          description:
            "Make your sentences easier to read and understand. Clear writing helps readers follow your ideas without getting confused.",
        },
        {
          title: "Build Writing Confidence",
          description:
            "Check your work and fix common mistakes before submitting an assignment or sharing your content. This helps you feel more confident about your writing.",
        },
        {
          title: "Choose the Right Words",
          description:
            "Find better word choices when a sentence does not sound right. The right words help you express your ideas while keeping your original meaning.",
        },
      ],
      button: toTool("Try Grammar Checker for Free"),
    },

    {
      type: "detailCards",
      title: "Who Can Use an AI Grammar Checker?",
      subtitle:
        "An AI grammar checker is useful for anyone who wants to find writing mistakes and make their text easier to read.",
      items: [
        {
          name: "Students",
          description:
            "Students can use the grammar checker to review essays, assignments, research papers, and other schoolwork before turning them in.",
          details: [
            {
              label: "Better Assignments",
              text: "Find grammar mistakes and make your academic writing easier to read.",
            },
          ],
        },
        {
          name: "Teachers",
          description:
            "Teachers can review lesson plans, class notes, and study materials to make sure everything is written correctly.",
          details: [
            {
              label: "Clear Study Materials",
              text: "Prepare easy-to-read learning materials for your students.",
            },
          ],
        },
        {
          name: "Bloggers",
          description:
            "Bloggers can check their articles and blog posts before publishing them online.",
          details: [
            {
              label: "Error-Free Blog Posts",
              text: "Find writing mistakes and make your content easier for readers to follow.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Why Use Our AI Grammar Checker?",
      items: [
        {
          title: "Understand Sentence Context",
          description:
            "Check how words fit together to find mistakes and make your sentences clearer.",
        },
        {
          title: "Keep Your Original Meaning",
          description:
            "Fix grammar mistakes while keeping your original meaning and making your writing clearer.",
        },
        {
          title: "Improve Sentence Structure",
          description:
            "Get suggestions to fix awkward sentences and make your writing sound more natural.",
        },
        {
          title: "Spelling Errors",
          description:
            "Find misspelled words and correct them before submitting your work.",
        },
      ],
    },

    {
      type: "comparison",
      title: "Grammar Checker vs Read My Essay vs AI Math Helper vs CGPA Calculator",
      subtitle:
        "Each tool helps students with a different part of their academic work. Here's a simple comparison to help you understand what each tool does and when to use it.",
      columns: ["Read My Essay", "AI Math Helper", "CGPA Calculator"],
      highlight: "Grammar Checker",
      rows: [
        {
          label: "What it does",
          values: [
            "Turns written text into spoken audio",
            "Helps solve math problems",
            "Calculates your cumulative grade point average",
          ],
          highlight: "Finds grammar and spelling mistakes",
        },
        {
          label: "Best for",
          values: [
            "Listening to essays and other text",
            "Solving math questions and understanding problems",
            "Checking your overall academic results",
          ],
          highlight: "Checking and improving written work",
        },
        {
          label: "Uses",
          values: [
            "Essays, notes, and study materials",
            "Math questions, equations, and calculations",
            "Grades, GPA, and credit hours",
          ],
          highlight: "Essays, assignments, emails, and articles",
        },
        {
          label: "Main benefit",
          values: [
            "Helps you review your work by listening",
            "Makes math problems easier to work through",
            "Helps you keep track of your academic progress",
          ],
          highlight: "Makes your writing clearer and easier to read",
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
      title: "Mistakes to Avoid When Using a Grammar Checker",
      subtitle:
        "Our free Grammar Checker can help you find writing mistakes and improve your text. However, how you use the tool also matters. Avoid these common mistakes to get better results.",
      items: [
        {
          title: "Not Checking the Full Text",
          description:
            "Add your complete text so the tool can check your sentences and find mistakes throughout your writing.",
        },
        {
          title: "Accepting Every Suggestion",
          description:
            "Read each suggested correction before making changes. Some suggestions may not fit the meaning of your sentence.",
        },
        {
          title: "Ignoring Sentence Context",
          description:
            "Check how each correction fits into your sentence. Make sure it keeps your original meaning.",
        },
        {
          title: "Not Reviewing Your Final Text",
          description:
            "Read your writing again after making corrections. This helps you catch any mistakes that may still be there.",
        },
      ],
      note: {
        before: "Want to track your academic progress? Try the free ",
        link: { label: "CGPA Calculator", href: "/tools/cumulative-gpa-calculator" },
        after: " to calculate your cumulative GPA.",
      },
    },

    {
      type: "ctaBand",
      tag: "Check grammar mistakes in simple steps",
      titleStart:
        "Find writing errors and make your sentences clear and easy to understand.",
      checks: [
        "Find grammar and spelling mistakes in your text",
        "Fix punctuation and sentence structure errors",
        "Improve your writing while keeping your original meaning",
      ],
      submitLabel: "Try Grammar Checker",
      note: "Free to use · No sign-up required · Easy grammar checking",
    },

    {
      type: "cards",
      title: "Key Features of Our AI Grammar Checker",
      subtitle:
        "Our AI Grammar Checker gives you a simple way to review your writing and spot areas that may need improvement. It helps you check your text before sharing it or submitting your work.",
      cards: [
        {
          title: "All-in-One Text Check",
          description:
            "Review your writing for common grammar and spelling errors in one place. You do not need to switch between different tools to check basic writing mistakes.",
        },
        {
          title: "Sentence-Level Review",
          description:
            "Check individual sentences to see if they are written correctly and make sense. This is useful when you are unsure about a sentence or want to double-check your wording.",
        },
        {
          title: "Context-Based Suggestions",
          description:
            "Get corrections based on how words are used in a sentence. This helps the tool understand the meaning of your writing instead of looking at each word on its own.",
        },
        {
          title: "Better Word Choices",
          description:
            "Find words or phrases that may not express your ideas clearly. Review alternative suggestions to make your sentences easier to understand while keeping your original message.",
        },
        {
          title: "Support for Different Texts",
          description:
            "Use the tool for different types of writing, from short messages and emails to essays and school assignments. You can check your text whenever you want to review your work.",
        },
        {
          title: "Easy-to-Review Corrections",
          description:
            "Go through the suggested changes and decide which ones work best for your writing. Review each correction before applying it so your final text still sounds like you.",
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "Popular Use Cases of Our AI Grammar Checker" },
        {
          type: "paragraph",
          text: "Our AI Grammar Checker is useful for more than academic writing. You can use it for everyday communication and different writing tasks where correct language matters.",
        },
        {
          type: "list",
          items: [
            {
              lead: "School Essays:",
              text: "Review your essays before submission to make sure your ideas are presented clearly.",
            },
            {
              lead: "Professional Emails:",
              text: "Check work emails to make sure your message sounds clear and professional.",
            },
            {
              lead: "Online Content:",
              text: "Review website pages and blog posts before publishing them.",
            },
            {
              lead: "Business Documents:",
              text: "Check proposals and business letters for writing errors.",
            },
            {
              lead: "English Practice:",
              text: "Use grammar suggestions to learn from your mistakes and improve your English skills.",
            },
            {
              lead: "Personal Writing:",
              text: "Check letters and other personal messages before sharing them.",
            },
          ],
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "Common Grammar Rules Every Writer Should Know" },
        {
          type: "paragraph",
          text: "Understanding basic grammar rules can help you write correctly and express your ideas with confidence. Here are some important rules to keep in mind when writing.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              lead: "Subject-Verb Agreement:",
              text: "A subject and its verb must agree in number. Singular subjects require singular verbs, while plural subjects require plural verbs.",
            },
            {
              lead: "Correct Verb Tense:",
              text: "Choose verb tenses according to when an action takes place. Keep the tense consistent throughout your writing unless the timeline changes.",
            },
            {
              lead: "Proper Use of Articles:",
              text: "Use articles such as a, an, and the correctly before nouns. The right choice depends on the noun and how it is being used.",
            },
            {
              lead: "Pronoun Agreement:",
              text: "Pronouns should match the nouns they replace in number and person. This helps readers understand who or what a sentence refers to.",
            },
            {
              lead: "Correct Preposition Usage:",
              text: "Use prepositions to show relationships between words, including time, place, and direction. Choosing the right preposition helps make your sentences sound natural.",
            },
          ],
        },
      ],
    },

    {
      type: "moreTools",
      title: "Discover More Free Academic Tools",
      subtitle:
        "Explore free online tools to improve your writing, solve math problems, and make everyday study tasks easier.",
      items: [
        {
          name: "AI Math Helper",
          description: "Solve math problems and get help understanding each step.",
          href: "/tools/ai-math-helper",
        },
        {
          name: "AI Humanizer",
          description:
            "Make AI-generated text sound more natural and human while keeping your original message.",
          href: "/tools/ai-humanizer",
        },
        {
          name: "Read My Essay",
          description:
            "Convert your essays and other written content into speech and listen to your text.",
          href: "/tools/read-my-essay",
        },
        {
          name: "Plagiarism Checker",
          description:
            "Check your text for matching content and find sections that may need proper citations.",
          href: "/tools/plagiarism-checker",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Is the AI Grammar Checker free to use?",
          answer:
            "Yes, our AI Grammar Checker is free to use. You can add your text and check it for mistakes without spending money. It gives you a simple way to review your writing whenever you need it.",
        },
        {
          question: "How do I know if my sentence is grammatically correct?",
          answer:
            "Add your sentence to the Grammar Checker and click the check button. The tool will go through your sentence and point out anything that may be wrong. You can then look at the suggested changes and decide what needs to be fixed.",
        },
        {
          question: "Can the Grammar Checker find spelling mistakes?",
          answer:
            "Yes, it can find spelling mistakes as well as grammar errors. You don't have to check every word yourself. Add your text to the tool to see which words may need correction.",
        },
        {
          question: "Can I check punctuation with this tool?",
          answer:
            "Yes, you can use it to check punctuation in your writing. It can help you spot missing commas, full stops, apostrophes, and other punctuation marks. This is useful when you want to make sure your sentences are written correctly.",
        },
        {
          question: "Can I use the AI Grammar Checker for long essays?",
          answer:
            "Yes, you can use the tool to check essays, school assignments, college papers, and articles. It helps you find mistakes in your writing before you submit or publish it. Just remember to read through the suggested changes to make sure they suit your sentences.",
        },
        {
          question: "Does an AI Grammar Checker change the meaning of my sentences?",
          answer:
            "The tool suggests changes to fix mistakes while keeping your original message. However, not every suggestion will always fit what you want to say. Take a moment to read the corrected sentence before accepting any changes.",
        },
        {
          question: "What is the difference between a grammar checker and a punctuation checker?",
          answer:
            "A grammar checker looks for mistakes in the way sentences are written, including verb use and sentence structure. A punctuation checker focuses on marks such as commas, full stops, and apostrophes. Both help you write sentences that are easier to read and understand.",
        },
        {
          question: "Do I need to download anything to check my grammar?",
          answer:
            "No, you don't need to download or install anything. You can open our Grammar Checker in your browser and use it online. Simply add your text and start checking your writing.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Hand in writing you can",
      titlePill: "trust.",
      body: "Check your text free in under a minute, or ask an editor for a full proofread.",
      primary: toTool("Check my writing"),
      secondary: { label: "Talk to an editor →", href: "/contact-us" },
    },
  ],
};
