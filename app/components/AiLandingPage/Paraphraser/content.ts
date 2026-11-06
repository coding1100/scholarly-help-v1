// Copy for the /tools/ai-paraphraser landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const paraphraserMeta = {
  title: "Free AI Paraphraser Tool – Rewrite Text Easily",
  description:
    "Need to rewrite something? Use our free AI paraphrasing tool to change words, rewrite sentences, and keep the same meaning.",
};

const TOOL_ANCHOR_ID = "paraphraser-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const paraphraserLanding: LandingContent = {
  toolName: "AI Paraphraser",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "paraphraser_tool_landing",

  hero: {
    titleLead: "Free AI Paraphraser -",
    titleAccent: "Reword Any Text in Your Style Within Seconds",
    subtitle:
      "Reword any text with our Free AI Paraphraser while keeping its original meaning clear and intact. Choose your preferred writing style and get natural, easy-to-read results within seconds.",
  },

  mobileBar: {
    tool: toTool("Paraphrase my text"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is an AI Paraphraser?",
      paragraphs: [
        "An AI Paraphraser is an online tool that rewrites text using artificial intelligence. It changes words and sentences while keeping the original meaning. It helps you say the same thing in a different way, improve your sentences, and make your writing easier to read. You can use it when you want to change the wording but don't want to lose your main idea.",
        "ScholarlyHelp's AI Paraphraser makes rewriting simple. Just paste your text into the tool, choose a writing style, and get a new version. You can use it for assignments, research papers, articles, emails, and other types of writing. It can help you change difficult sentences, avoid using the same words again and again, and make your content easier to understand.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Students, researchers, teachers, writers, and professionals",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Paraphrase Your Text",
      subtitle:
        "Rewriting text doesn't have to be difficult. Just add your text, choose a style, and let our AI Paraphraser do the work.",
      steps: [
        {
          title: "Add Your Text",
          description:
            "Copy the text you want to rewrite and paste it into the box. You can also type it there.",
          note: {
            title: "Enter Your Text",
            description: "You can add a sentence, paragraph, essay, assignment, or article.",
          },
        },
        {
          title: "Choose a Style",
          description: "Select how you want your rewritten text to sound.",
          note: {
            title: "Pick the Style",
            description:
              "Choose a simple, natural, formal, or professional style depending on what you're writing.",
          },
        },
        {
          title: "Click the Paraphrase Button",
          description:
            "Once your text is ready, click the Paraphrase button. The tool will rewrite it using different words.",
          note: {
            title: "Copy Your New Text",
            description:
              "Read the rewritten version. If you want to change anything, edit it before copying the final text.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our AI Paraphrasing Tool?",
      subtitle:
        "Rewriting content doesn't have to take a lot of time. Our AI Paraphrasing Tool helps you reword sentences and paragraphs while keeping the original meaning. Whether you're improving an assignment, rewriting notes, or making your writing easier to understand, it offers a simple way to express your ideas differently.",
      cards: [
        {
          title: "Save Time on Rewriting",
          description:
            "Skip the effort of changing every sentence manually. Enter your text and paraphrase it with one click, whether you need to rewrite a short sentence or a longer passage.",
        },
        {
          title: "Make Your Writing Clearer",
          description:
            "Improve the way your ideas are expressed with reworded sentences that are easy to read and understand. Make your content clearer without losing your main message.",
        },
        {
          title: "Preserve the Original Meaning",
          description:
            "Your message matters. The tool is designed to rephrase your text while keeping its original meaning and key ideas intact.",
        },
        {
          title: "Enjoy an Ad-Free Experience",
          description:
            "Focus on your writing without unnecessary distractions. Our AI Paraphrasing Tool offers an ad-free experience, making it easier to work on your content.",
        },
        {
          title: "Get Started Without Signing Up",
          description:
            "You don't need to create an account or go through a lengthy registration process. Simply enter your text and start paraphrasing.",
        },
        {
          title: "Paraphrase for Free",
          description:
            "Rewrite your text without worrying about hidden fees or subscription costs. Our AI paraphraser tool is free to use whenever you need help rewording your content.",
        },
      ],
      button: toTool("Try Our Free AI Paraphrasing Tool"),
    },

    {
      type: "detailCards",
      title: "Who Can Use AI Paraphraser?",
      subtitle:
        "Our AI Paraphrasing Tool is designed for anyone who wants to rewrite content, improve sentence structure, or make their writing easier to understand.",
      items: [
        {
          name: "Students and Researchers",
          description:
            "Students and researchers can use the tool to improve essays, assignments, research papers, and academic content.",
          details: [
            {
              label: "Improve Academic Writing",
              text: "Paraphrase complex sentences to make academic writing clearer while keeping the original meaning.",
            },
          ],
        },
        {
          name: "Teachers and Educators",
          description:
            "Teachers can use the tool to prepare lesson plans, worksheets, presentations, and other educational materials.",
          details: [
            {
              label: "Create Better Learning Materials",
              text: "Rewrite teaching content in simple language to make lessons easier for students to understand.",
            },
          ],
        },
        {
          name: "Writers, Bloggers, and Marketers",
          description:
            "Writers, bloggers, and marketers can use the tool to refresh articles, website content, and promotional materials.",
          details: [
            {
              label: "Create Fresh Content",
              text: "Rephrase existing content to improve readability and make it suitable for different audiences.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Key Features of Our AI Paraphrasing Tool",
      items: [
        {
          title: "Keeps the Same Meaning",
          description:
            "The tool changes your words and sentences but keeps the main idea of your text the same.",
        },
        {
          title: "Free to Use",
          description: "Rewrite your text without paying any fees or signing up for a subscription.",
        },
        {
          title: "Quick Results",
          description:
            "Get your rewritten text in seconds. Just paste your content and click the button.",
        },
        {
          title: "Different Writing Modes",
          description:
            "Choose the style you need. You can use Standard, Fluency, Formal, Academic, or Shorten mode to rewrite your text.",
        },
      ],
    },

    {
      type: "comparison",
      title: "AI Paraphraser vs Research Question Generator vs AI Math Helper vs CGPA Calculator",
      subtitle:
        "ScholarlyHelp offers different tools to support students with their academic tasks. From rewriting content and developing research questions to solving math problems and calculating grades, each tool serves a specific purpose.",
      columns: ["Research Question Generator", "AI Math Helper", "CGPA Calculator"],
      highlight: "AI Paraphraser",
      rows: [
        {
          label: "What it does",
          values: [
            "Generates research questions based on a topic or keywords",
            "Helps solve math problems with AI",
            "Calculates cumulative GPA",
          ],
          highlight: "Rewrites text while keeping its original meaning",
        },
        {
          label: "Best for",
          values: [
            "Developing research questions",
            "Understanding and solving math problems",
            "Calculating academic performance",
          ],
          highlight: "Rewording sentences and paragraphs",
        },
        {
          label: "Uses",
          values: [
            "Research papers, proposals, and academic projects",
            "Math questions and equations",
            "Semester grades and credit hours",
          ],
          highlight: "Essays, articles, and assignments",
        },
        {
          label: "Main benefit",
          values: [
            "Helps students find a clear direction for research",
            "Makes math problems easier to understand",
            "Helps students track their overall academic performance",
          ],
          highlight: "Helps express ideas in different words",
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
      title: "Common Mistakes to Avoid When Using an AI Paraphrasing Tool",
      subtitle:
        "An AI Paraphrasing Tool makes rewriting content easier, but a few common mistakes can affect the quality of your results. Keep these points in mind when using the tool.",
      items: [
        {
          title: "Changing Too Much of the Original Text",
          description:
            "Avoid changing important details or ideas that are necessary to keep your original message clear.",
        },
        {
          title: "Ignoring the Original Meaning",
          description:
            "Check that the paraphrased version keeps the main ideas and intended message of your original text.",
        },
        {
          title: "Choosing Words That Don't Fit the Context",
          description:
            "Review the rewritten words and sentences to make sure they fit your topic and communicate your ideas naturally.",
        },
        {
          title: "Relying Completely on AI",
          description:
            "Use the paraphrased text as a starting point and make any necessary changes to match your writing style.",
        },
      ],
      note: {
        before: "Want to make studying easier? Try our free ",
        link: { label: "AI Study Workspace", href: "/tools/ai-study-workspace" },
        after: " to organize your study materials, create notes, and get help with your learning.",
      },
    },

    {
      type: "ctaBand",
      tag: "Rewrite your content in seconds",
      titleStart: "Make your writing clearer and easier to understand with our AI Paraphrasing Tool.",
      checks: [
        "Rephrase sentences and paragraphs while keeping the original meaning",
        "Improve sentence structure and readability",
        "Choose a paraphrasing mode that suits your writing needs",
      ],
      submitLabel: "Try AI Paraphraser",
      note: "Free to use · No sign-up required · AI-powered paraphrasing",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "What is the Difference Between Paraphrasing and Rephrasing?" },
        {
          type: "paragraph",
          text: "Paraphrasing and rephrasing both involve rewriting text, but they serve slightly different purposes. Here's a quick comparison to help you understand the difference.",
        },
        {
          type: "table",
          head: ["", "Paraphrasing", "Rephrasing"],
          rows: [
            [
              "Meaning",
              "Rewrites text using different words and sentence structures.",
              "Changes specific words or sentences to improve how they sound.",
            ],
            [
              "Focus",
              "Focuses on complete sentences, paragraphs, or longer passages.",
              "Focuses on individual sentences or specific expressions.",
            ],
            [
              "Purpose",
              "Presents information in a different way while keeping the original meaning.",
              "Helps improve sentence structure and make the text more natural.",
            ],
            [
              "Changes",
              "May change sentence structure, vocabulary, and wording.",
              "Usually makes smaller changes to the original wording.",
            ],
            [
              "Best for",
              "Essays, research papers, articles, and longer content.",
              "Improving sentences, fixing awkward wording, and refining drafts.",
            ],
          ],
        },

        { type: "heading", text: "How Does AI Paraphraser Work?" },
        {
          type: "paragraph",
          text: "Our free Paraphrasing Tool uses artificial intelligence to understand your text and rewrite it using different words and sentence structures. It looks at the context of your sentences to create a new version while keeping the original message intact.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              lead: "Understands Your Text:",
              text: "AI analyzes the words, sentences, and context of your content to understand the main idea before rewriting it.",
            },
            {
              lead: "Finds Alternative Words:",
              text: "The tool identifies suitable words and phrases that can replace the original wording without changing the intended message.",
            },
            {
              lead: "Rewrites Sentence Structure:",
              text: "It adjusts sentence structure and word order to make your content sound different while keeping the same key information.",
            },
            {
              lead: "Generates Paraphrased Content:",
              text: "After processing your text, the AI generates a rewritten version that aims to sound clear, natural, and easy to understand.",
            },
            {
              lead: "Review and Edit Your Text:",
              text: "Read the paraphrased version and make any changes needed to match your writing style, context, and intended meaning.",
            },
          ],
        },

        { type: "heading", text: "How Can an AI Paraphraser Help Working Professionals?" },
        {
          type: "paragraph",
          text: "Working professionals often need to write emails, reports, business documents, and other workplace content. Our AI Paraphraser helps make writing easier by improving clarity, adjusting tone, and making information easier to understand.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Improve Professional Communication:",
              text: "Rewrite emails, messages, and workplace communication to make them clearer, more professional, and easier to understand.",
            },
            {
              lead: "Simplify Technical Language:",
              text: "Rephrase complex technical terms and explanations into simpler language that different audiences can understand.",
            },
            {
              lead: "Edit Reports and Memos:",
              text: "Rewrite long reports and memos to improve their flow, readability, and overall structure.",
            },
            {
              lead: "Adjust Content Length:",
              text: "Expand or shorten sentences and paragraphs to make your documents more suitable for their intended purpose.",
            },
            {
              lead: "Maintain Consistent Writing:",
              text: "Improve the wording and flow of your content to maintain a consistent tone across business documents and professional communication.",
            },
            {
              lead: "Save Time on Daily Writing Tasks:",
              text: "Rephrase existing content instead of rewriting everything from scratch, helping you complete everyday writing tasks more efficiently.",
            },
          ],
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
          name: "Online Exam Prep",
          description:
            "Create a personalized study schedule based on your exam date, subject, and available study time.",
          href: "/tools/ai-exam-prep",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "Is the AI Paraphrasing Tool free to use?",
          answer:
            "Yes, our free AI paraphrasing tool lets you rewrite your text without paying any fees. You can use it to improve your sentences and make your writing clearer.",
        },
        {
          question: "Can I paraphrase a full paragraph?",
          answer:
            "Yes, you can enter a complete paragraph into the AI paraphraser and get a rewritten version in seconds. It keeps your main ideas while changing the wording.",
        },
        {
          question: "Does AI paraphrasing change the original meaning?",
          answer:
            "No, the tool is designed to keep your original meaning while changing the words and sentence structure. However, always review the results to make sure they match your message.",
        },
        {
          question: "Who can use an AI Paraphrasing Tool?",
          answer:
            "Students, teachers, researchers, bloggers, and working professionals can use AI paraphrasing to improve assignments, reports, articles, emails, and other written content.",
        },
        {
          question: "Can I use a paraphraser for academic assignments?",
          answer:
            "Yes, a paraphraser AI can help you improve essays, assignments, and research papers. Just remember to cite your sources when using information from other writers.",
        },
        {
          question: "How does AI paraphrasing improve my writing?",
          answer:
            "AI paraphrasing helps you find better ways to express your ideas. It can improve sentence flow, replace repeated words, and make your content easier to read.",
        },
        {
          question: "Can I use a free AI paraphrasing tool for professional writing?",
          answer:
            "Yes, you can use an AI paraphraser to rewrite work emails, business reports, website content, and other professional documents.",
        },
        {
          question: "Does paraphrased content count as plagiarism?",
          answer:
            "Not automatically. Paraphrasing changes the wording, but if you use ideas or information from another source, you still need to give proper credit to the original author.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Ready to rewrite your next",
      titlePill: "paragraph?",
      body: "A better version of your draft is only one step away. Use ScholarlyHelp’s AI paraphraser to make your writing clearer, smoother, and easier to review.",
      primary: toTool("Paraphrase My Text"),
      secondary: toTool("Try AI Paraphraser Free"),
    },
  ],
};
