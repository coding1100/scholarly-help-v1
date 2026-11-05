// Copy for the /tools/research-question-generator landing page. Layout lives in
// the shared LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const researchQuestionMeta = {
  title: "Research Question Generator – Create Free Questions",
  description:
    "Create clear research questions from your topic or keywords with our free AI Research Question Generator. Get ideas for your academic work in seconds.",
};

const TOOL_ANCHOR_ID = "research-question-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const researchQuestionLanding: LandingContent = {
  toolName: "Research Question Generator",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "research_question_tool_landing",

  hero: {
    titleLead: "Research Question Generator:",
    titleAccent: "Free Online Tool for Students",
    subtitle:
      "Create clear and useful research questions from your topic or keywords in seconds. Get ideas, save time, and make your research easier with AI.",
  },

  mobileBar: {
    tool: toTool("Generate questions"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is a Research Question Generator?",
      paragraphs: [
        "A Research Question Generator is an AI tool that helps you come up with research questions based on your topic, description, or keywords. You simply enter what you want to study, and the tool suggests questions related to your topic. It can help you create questions for different academic projects.",
        "Sometimes, choosing the right research question is not easy. You may have a topic in mind but still feel unsure about what to ask or where to begin. A Research Question Generator makes this process easier by giving you ideas to work with. You can read through the suggested questions, choose the ones that fit your research, and make changes whenever needed. This gives you a clearer starting point and helps you spend more time working on your research instead of getting stuck on the first step.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Students, researchers, teachers, and academic writers",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "How to Use the Research Question Generator in 3 Easy Steps",
      subtitle:
        "Creating research questions does not have to be difficult. Follow these three simple steps to get question ideas for your academic work.",
      steps: [
        {
          title: "Enter Your Topic",
          description:
            "Start by typing your research topic, a short description, or some related keywords in the input box.",
          note: {
            title: "Share Your Research Idea",
            description:
              "Add a few details about what you want to study. This helps the AI understand your topic and create questions that match it.",
          },
        },
        {
          title: "Select Your Preferences",
          description:
            "Choose your preferred language and word length, if these options are available.",
          note: {
            title: "Choose What You Need",
            description:
              "Set your preferences according to your research needs. This helps you get questions that are more suitable for your topic.",
          },
        },
        {
          title: "Generate Research Questions",
          description:
            "Click the Generate button to get questions based on the information you provided.",
          note: {
            title: "Check Your Results",
            description:
              "Read the questions carefully and pick the ones that match your research. You can also edit them to make them clearer and more suitable for your work.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Benefits of Using the Research Question Generator",
      subtitle:
        "Choosing a research question is not always easy. You may have a topic in mind but still struggle to decide what to ask. Our Research Question Generator gives you ideas and helps you get started.",
      cards: [
        {
          title: "Save Time",
          description:
            "Get question ideas in minutes instead of spending hours trying to think of them yourself.",
        },
        {
          title: "Get Related Questions",
          description:
            "Enter your topic or keywords and get questions that match what you want to study.",
        },
        {
          title: "Explore More Ideas",
          description:
            "Get different question ideas for the same topic. This gives you more options when planning your research.",
        },
        {
          title: "Find Where to Start",
          description:
            "Not sure how to begin? Use the suggested questions to decide what part of your topic you want to study.",
        },
        {
          title: "Pick the Questions You Like",
          description:
            "Read through the suggestions and choose the ones that fit your topic. You can also change them to suit your research.",
        },
        {
          title: "Start Your Research Easily",
          description:
            "Use the questions to get started with your essays, assignments, research papers, or thesis. They can help you plan what to work on next.",
        },
      ],
      button: toTool("Try Research Question Generator for Free!"),
    },

    {
      type: "detailCards",
      title: "Who Can Use the Research Question Generator?",
      subtitle:
        "The Research Topic Question Generator is useful for students who need help developing research questions and finding a clear direction for their academic work.",
      items: [
        {
          name: "Thesis Students",
          description:
            "Bachelor's, master's, and PhD students can use the tool to develop research questions and narrow down their thesis topics.",
          details: [
            {
              label: "Thesis Planning",
              text: "Find a clear starting point for your thesis and keep your research focused.",
            },
          ],
        },
        {
          name: "Research Proposal Writers",
          description:
            "Students preparing a research proposal or synopsis can generate question ideas based on their chosen topic.",
          details: [
            {
              label: "Proposal Development",
              text: "Get ideas to help organize your research goals and prepare your proposal.",
            },
          ],
        },
        {
          name: "First-Time Researchers",
          description:
            "Students new to academic research can use the tool to turn broad topics into focused questions and plan what they want to investigate.",
          details: [
            {
              label: "Research Guidance",
              text: "Move from topic selection to a clear research direction and a more organized research plan.",
            },
          ],
        },
      ],
    },

    {
      type: "cards",
      title: "Key Features of Our Research Question Generator",
      cards: [
        {
          title: "AI-Powered Generation",
          description:
            "Get research question ideas based on your topic, description, or keywords.",
        },
        {
          title: "Quick Results",
          description:
            "Generate research questions in seconds without spending hours brainstorming.",
        },
        {
          title: "Multiple Language Support",
          description:
            "Create research questions in different languages to match your preferences.",
        },
        {
          title: "Free Access",
          description:
            "Use the research paper question generator to generate question ideas without paying any fees.",
        },
      ],
    },

    {
      type: "comparison",
      title:
        "Research Question Generator vs Paraphrasing Tool vs Grammar Checker vs AI Math Helper",
      subtitle:
        "Each tool is designed to help with a different academic task. Whether you need to develop research questions, rewrite content, check grammar, or solve math problems, ScholarlyHelp offers free tools to make your academic work easier.",
      columns: ["Paraphrasing Tool", "Grammar Checker", "AI Math Helper"],
      highlight: "Research Question Generator",
      rows: [
        {
          label: "What it does",
          values: [
            "Rewrites text in different words",
            "Checks spelling, grammar, and punctuation",
            "Helps solve math problems with AI",
          ],
          highlight: "Generates research questions based on a topic or keywords",
        },
        {
          label: "Best for",
          values: [
            "Rewording sentences and paragraphs",
            "Proofreading assignments",
            "Understanding and solving math problems",
          ],
          highlight: "Developing research questions",
        },
        {
          label: "Uses",
          values: [
            "Essays, articles, and assignments",
            "Written academic content",
            "Math questions and equations",
          ],
          highlight: "Research papers, proposals, and academic projects",
        },
        {
          label: "Main benefit",
          values: [
            "Helps express ideas in different words",
            "Helps improve writing quality",
            "Makes math problems easier to understand",
          ],
          highlight: "Helps students find a clear direction for research",
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
      title: "Common Mistakes to Avoid When Using a Research Question Generator",
      subtitle:
        "A Research Question Generator makes it easier to develop research ideas. However, a few common mistakes can affect the quality of your results. Keep these points in mind when using the tool.",
      items: [
        {
          title: "Entering a Broad Topic",
          description:
            "Use a specific research topic instead of a general subject to get more focused question ideas.",
        },
        {
          title: "Providing Incomplete Information",
          description:
            "Add relevant details and keywords so the tool can better understand your research topic.",
        },
        {
          title: "Choosing Questions That Are Too Broad",
          description:
            "Select clear and specific questions that you can explore within your research scope.",
        },
        {
          title: "Relying Only on AI Suggestions",
          description:
            "Use generative research questions as a starting point. Review and improve them before using them.",
        },
      ],
      note: {
        before: "Want to make studying easier? Try our free ",
        link: { label: "AI Study Workspace", href: "/tools/ai-study-workspace" },
        after:
          " to organize your study materials, create notes, and get help with your learning.",
      },
    },

    {
      type: "ctaBand",
      tag: "Create research questions in seconds",
      titleStart:
        "Turn your research topic or keywords into clear and relevant research questions with ease.",
      checks: [
        "Generate research questions from your topic or description",
        "Get ideas to guide your academic research",
        "Choose questions that match your research goals",
      ],
      submitLabel: "Generate Research Questions",
      note: "Free to use · No sign-up required · AI-powered suggestions",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "What Makes a Research Question Strong?" },
        {
          type: "paragraph",
          text: "A good research question is clear, specific, and easy to understand. It should focus on one main idea and help you decide what to study. Here are some important features of a good research question:",
        },
        {
          type: "list",
          items: [
            {
              lead: "Clarity:",
              text: "Use simple and clear words so readers can easily understand what you want to research.",
            },
            {
              lead: "Specificity:",
              text: "Focus on one particular part of your topic instead of asking a very broad question.",
            },
            {
              lead: "Relevance:",
              text: "Make sure your question is related to your research topic and has a clear purpose.",
            },
            {
              lead: "Feasibility:",
              text: "Choose a question you can answer with the time, information, and resources you have.",
            },
            {
              lead: "Originality:",
              text: "Explore an idea from a fresh angle or offer a new point of view.",
            },
            {
              lead: "Focus:",
              text: "Keep your question centered on one main research goal to make your study easier to manage.",
            },
            {
              lead: "Researchability:",
              text: "Make sure you can find enough information to answer your question.",
            },
          ],
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How AI Can Support Your Research Planning" },
        {
          type: "paragraph",
          text: "Starting your research can be challenging, especially when you are unsure what questions to ask. AI can help you turn your topic into clear research questions and give you ideas to move forward. By sharing a few details about your study, you can get suggestions that match your academic needs.",
        },
        { type: "subheading", text: "Share Your Research Details" },
        {
          type: "paragraph",
          text: "Start by providing some basic information about your study. This helps AI understand your topic and suggest relevant research questions. You can include:",
        },
        {
          type: "list",
          items: [
            { lead: "Your Research Topic:", text: "Enter the subject you want to study." },
            {
              lead: "Your Field of Study:",
              text: "Mention your academic subject or area.",
            },
            {
              lead: "Your Study Level:",
              text: "Select your level, such as bachelor's, master's, or PhD.",
            },
            {
              lead: "Your Research Method:",
              text: "Choose how you plan to conduct your research.",
            },
            {
              lead: "Your Requirements:",
              text: "Add any instructions or limits for your research questions.",
            },
          ],
        },
        { type: "subheading", text: "Get Research Ideas" },
        {
          type: "paragraph",
          text: "After reviewing your details, the research question AI generator can suggest different ideas to help you plan your study. These may include:",
        },
        {
          type: "list",
          items: [
            {
              lead: "Main Research Questions:",
              text: "Clear questions based on your topic.",
            },
            {
              lead: "Related Questions:",
              text: "Smaller questions that help you explore your subject.",
            },
            {
              lead: "New Research Ideas:",
              text: "Different ways to approach your topic.",
            },
            {
              lead: "Key Research Areas:",
              text: "Important points you may want to study.",
            },
            {
              lead: "Question Suggestions:",
              text: "Different options you can review and improve.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Review the suggestions carefully and choose the questions that best match your research goals. You can also edit them to make sure they fit your study requirements.",
        },
      ],
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "Tips for Strong Research Questions" },
        {
          type: "paragraph",
          text: "Good research questions help you stay focused and understand what you want to study. Follow these simple tips to make your questions clear and useful.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Focus on One Main Idea:",
              text: "Keep each main question about one topic or idea. This makes your research easier to understand and manage.",
            },
            {
              lead: "Keep Your Research Possible:",
              text: "Choose questions that you can answer within your available time and with the people or information you can access.",
            },
            {
              lead: "Match Questions With Your Research Method:",
              text: "Make sure your research questions match the methods you plan to use. This helps you collect the right information for your study.",
            },
            {
              lead: "Avoid Simple Yes or No Questions:",
              text: "Try to write questions that need more than a yes or no answer. This gives you more room to explore your topic in detail.",
            },
            {
              lead: "Review Your Questions With Your Supervisor:",
              text: "Share your research questions with your academic supervisor before submitting your work. Their feedback can help you improve and make your questions clearer.",
            },
          ],
        },
      ],
    },

    {
      type: "moreTools",
      title: "Explore Our Free Academic Tools",
      subtitle:
        "Take some stress out of your academic work with free tools that support your everyday study needs. Find simple ways to write better, understand math, and manage your studies.",
      items: [
        {
          name: "CGPA Calculator",
          description:
            "Calculate your CGPA and keep track of your overall academic performance.",
          href: "/tools/cumulative-gpa-calculator",
        },
        {
          name: "Grammar Checker",
          description:
            "Find and fix grammar, spelling, and punctuation mistakes in your writing.",
          href: "/tools/ai-grammar-check",
        },
        {
          name: "Read My Essay",
          description: "Listen to your essays and study materials with text-to-speech.",
          href: "/tools/read-my-essay",
        },
        {
          name: "AI Math Helper",
          description: "Get help solving math problems and understanding difficult concepts.",
          href: "/tools/ai-math-helper",
        },
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "How does AI for research questions help with thesis writing?",
          answer:
            "AI helps you turn your thesis topic into clear and focused research questions. It gives you ideas to help plan your study and decide what you want to explore.",
        },
        {
          question: "Does the tool generate both qualitative and quantitative research questions?",
          answer:
            "Our free online research question generator helps you create research question ideas based on your topic. You can use these suggestions to develop questions for different types of research.",
        },
        {
          question: "Can I export the research questions for my proposal?",
          answer:
            "You can copy the generated questions and add them to your research proposal or outline. Review them before using them in your academic work.",
        },
        {
          question: "Are the generated research questions ready for submission?",
          answer:
            "AI-generated questions are a starting point, not a final answer. Review and improve them to make sure they meet your research requirements.",
        },
        {
          question: "Can I specify my academic level and field of study?",
          answer:
            "You can include your academic level and field of study in your input to help generate a research question that matches your topic and research needs.",
        },
        {
          question: "Is AI Research Question Generator free to use?",
          answer:
            "Yes, our AI Research Question Generator is free to use. You can create research question ideas without paying any fees.",
        },
        {
          question: "How does this AI generate research questions?",
          answer:
            "The AI reviews your topic and keywords to understand what you want to study. It then creates research question suggestions based on the information you provide.",
        },
        {
          question: "How do I get the best results?",
          answer:
            "Enter a clear and specific research topic. Add relevant details and keywords so the AI can better understand your needs and generate useful questions.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Make Your Research Easier With AI",
      body: "Turn your research topic into a clear outline in just a few clicks. Get ideas, organize your points, and improve your outline as you go.",
      primary: toTool("Create My Outline"),
      secondary: toTool("Try It for Free"),
    },
  ],
};
