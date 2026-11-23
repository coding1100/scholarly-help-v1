// Copy for the /tools/ai-detector landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const aiDetectorMeta = {
  title: "Check AI-Generated Text with Our Free AI Detector",
  description:
    "Use our free AI Detector to check if your text was written by ChatGPT or other AI tools. Get quick results and review your writing with ease.",
};

const TOOL_ANCHOR_ID = "ai-detector-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const aiDetectorLanding: LandingContent = {
  toolName: "AI Detector",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "ai_detector_tool_landing",

  hero: {
    titleLead: "Free AI Detector –",
    titleAccent: "Give Your Paper an AI Check Before You Submit",
    subtitle:
      "Use our free AI Detector to check if your text may have been written by ChatGPT or other AI tools. See the results, review your writing, and make changes where needed before submitting or sharing your content.",
  },

  mobileBar: {
    tool: toTool("Try AI Detector"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is an AI Detector?",
      paragraphs: [
        "An AI detector is an online tool that checks whether your text may have been written by AI. It looks for certain writing patterns that are often found in content created by tools like ChatGPT, Google Gemini, and Claude. You just need to copy your text, paste it into the tool, and click the check button to see the results.",
        "Students, teachers, researchers, and writers can use an AI detector to check their essays, assignments, research papers, and articles. The results help you see which parts of your writing may look like AI-generated content and need a closer look. However, AI detectors aren't always accurate. They may sometimes mark human-written text as AI-generated or fail to detect content written by AI. So, it's better to use the results as a guide rather than treating them as proof of who wrote the text.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign Up", value: "No sign-up required" },
        {
          label: "Works For",
          value:
            "Checking essays, assignments, research papers, articles, blog posts, and other written content for possible AI-generated text.",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "How to Use Our AI Detector to Verify Your Paper",
      subtitle:
        "It's quite easy to use the AI detector to verify your writing. All you need to do is to follow the next three simple steps to check your paper in a matter of seconds.",
      steps: [
        {
          title: "Upload the Text",
          description: "The first thing you should do is to find the text you would like to analyze.",
          note: {
            title: "Copy and Paste the Text",
            description:
              "Have an essay, article, assignment, or research paper? Simply copy your text and paste it in the AI detector window. There's no need to do anything else before proceeding to the next step.",
          },
        },
        {
          title: "Press the Check Button",
          description: "After adding your text, you can proceed to the next step.",
          note: {
            title: "Let the AI Detector work",
            description:
              "Press the check button and let the tool review your text. The AI detector analyzes the sentences and style used in order to detect common features of content written by ChatGPT and other AI tools.",
          },
        },
        {
          title: "Go Over the Results",
          description: "When the analysis is done, you can move on to reviewing your results.",
          note: {
            title: "Review the results",
            description:
              "Review your results and pay attention to the sentences. Keep in mind that AI detectors aren't always right, so a result doesn't prove that your content was written by AI.",
          },
        },
      ],
    },

    {
      type: "detailCards",
      title: "Who Can Use an AI Detector?",
      subtitle:
        "Anyone who wants to check their writing for signs of AI-generated content can use our AI Detector. It's useful for students, teachers, and writers who want to check their work and get a better idea of how it may appear to AI detection tools.",
      items: [
        {
          name: "High School and College Students",
          description:
            "Students have to write essays, complete class assignments, and work on research papers. An AI Detector can help them check their writing before submitting it and see if any parts may look like AI-generated content.",
          details: [
            {
              label: "Check Your School or College Work",
              text: "Simply paste your essay, assignment, or research paper into the tool and check the results. This gives you a chance to look at your writing again and make changes wherever needed before handing in your work.",
            },
          ],
        },
        {
          name: "Teachers and Professors",
          description:
            "Teachers and professors can use an AI Detector when checking student assignments and academic papers. It gives them another way to review written work and notice patterns that may be linked to AI-generated content.",
          details: [
            {
              label: "Check Student Assignments",
              text: "Paste student essays, research papers, or other assignments into the tool to review the results. Teachers can use these results as one part of their assessment, but they shouldn't treat them as the only proof that a student has used AI.",
            },
          ],
        },
        {
          name: "Writers and Bloggers",
          description:
            "Writers and bloggers spend time creating articles, blog posts, and website content for different audiences. They can use an AI Detector to review their writing before publishing it and see how their content may appear to AI detection tools.",
          details: [
            {
              label: "Check Your Articles and Blog Posts",
              text: "Paste your articles, blog posts, or website content into the tool to check the results. Take a closer look at the sections that may need improvement and make changes where needed to keep your writing clear and easy to read.",
            },
          ],
        },
      ],
    },

    {
      type: "cards",
      title: "Key Features of Our AI Detector",
      subtitle:
        "Our AI checker comes with simple features that make it easy to check your written content. Whether you want to check an essay, an assignment, or a blog post, the tool helps you review your text and understand the results.",
      cards: [
        {
          title: "AI Content Detection",
          description:
            "Check your text for patterns commonly found in AI-generated writing. The tool helps you see whether your content may have been created using AI writing tools.",
        },
        {
          title: "ChatGPT Content Checking",
          description:
            "Wondering if your text looks like something written by ChatGPT? Use the AI Detector to check for patterns often found in ChatGPT-generated content.",
        },
        {
          title: "Simple Text Checking",
          description:
            "You don't need to follow complicated steps to check your writing. Just copy your text, paste it into the tool, and start the detection process.",
        },
        {
          title: "Easy-to-Read Results",
          description:
            "Once the check is complete, review the results to understand what the tool found. Use the analysis to identify sections that may need a closer look or further editing.",
        },
      ],
    },

    {
      type: "comparison",
      title: "AI Detector vs Research Question Generator vs AI Math Helper vs CGPA Calculator",
      subtitle:
        "ScholarlyHelp offers different tools to support students with their academic work. Each tool has a different purpose. The AI content Detector checks written content for possible AI-generated text, while the other tools help with research planning, math problems, and grade calculations.",
      columns: ["RQ Generator", "AI Math Helper", "CGPA Calculator"],
      highlight: "AI Detector",
      rows: [
        {
          label: "What it does",
          values: [
            "Generates research questions based on a topic or keywords",
            "Helps solve math problems with AI",
            "Calculates cumulative GPA",
          ],
          highlight: "Checks text for patterns commonly found in AI-generated content",
        },
        {
          label: "Best for",
          values: [
            "Creating research questions",
            "Understanding and solving math problems",
            "Calculating academic performance",
          ],
          highlight: "Checking essays, assignments, and other written content",
        },
        {
          label: "Uses",
          values: [
            "Research papers and academic projects",
            "Math questions and equations",
            "Semester grades and credit hours",
          ],
          highlight: "AI content detection and writing review",
        },
        {
          label: "Main benefit",
          values: [
            "Gives students ideas and direction for research",
            "Makes math problems easier to understand",
            "Helps students track their overall academic performance",
          ],
          highlight: "Helps users review their writing for possible AI-generated text",
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
      title: "Common Mistakes to Avoid When Using an AI Detector",
      subtitle:
        "An AI Detector makes it easy to check your writing, but there are a few things to keep in mind when using it. Avoid these common mistakes to get more useful results.",
      items: [
        {
          title: "Believing Every Result Is Correct",
          description:
            "Don't think the results are always right. Sometimes, the tool may mark human-written text as AI-generated or fail to find AI-written text. Use the results only as a guide.",
        },
        {
          title: "Checking Too Little Text",
          description:
            "Don't check just a few words or one sentence. Add a longer piece of writing so the tool has more text to check.",
        },
        {
          title: "Focusing Only on the Score",
          description:
            "Don't look at the score and ignore everything else. Read the results to see which parts of your writing may need another look.",
        },
        {
          title: "Skipping the Marked Sections",
          description:
            "If the tool marks any part of your text, take a moment to read it. Check if the wording is clear and whether it needs any changes.",
        },
        {
          title: "Rewriting Your Whole Essay",
          description:
            "You don't need to rewrite your entire essay just because the tool marks some parts. Check those sections first and change them only if needed.",
        },
        {
          title: "Using Only One AI Detector",
          description:
            "Different AI detectors may show different results for the same text. If you're not sure about the results, try another tool and compare them. No AI detector can tell for certain who wrote the content.",
        },
      ],
      note: {
        before: "Want to improve your academic writing too? Try our free ",
        link: { label: "AI Essay Generator", href: "/tools/ai-essay-generator" },
        after: " to get help creating essay drafts, outlines, and thesis statements.",
      },
    },

    {
      type: "ctaBand",
      tag: "CHECK YOUR WRITING WITH OUR FREE AI DETECTOR",
      titleStart:
        "Want to know if your text may look AI-generated? Use our free AI text Detector to check your essays, assignments, research papers, and other written content. Review your results and see which parts may need more attention.",
      checks: [
        "Check text for patterns commonly found in AI-generated content",
        "Review writing that may have been created using ChatGPT or other AI tools",
        "Understand your results and find sections that may need another look",
      ],
      submitLabel: "Try Our Free AI Detector",
      note: "Free to use · No sign-up required · Easy text checking",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How Can an AI Detector Help Students and Writers?" },
        {
          type: "paragraph",
          text: "Whether you're writing a school assignment, working on a blog, or creating content for your job, you may want to know how your writing looks to an AI detector. Our AI Detector free makes it easy to check your text and see if any parts of it show patterns commonly found in AI-written content.",
        },
        { type: "subheading", text: "Support Academic Reviews" },
        {
          type: "paragraph",
          text: "Teachers and professors can use AI detection results to get another view of student assignments. These results can be considered along with other factors when reviewing academic work.",
        },
        { type: "subheading", text: "Check Different Types of Content" },
        {
          type: "paragraph",
          text: "You can check all kinds of written content in one place, from school assignments and personal essays to blog posts and website content. There's no need to use a different tool for every type of writing.",
        },
        { type: "subheading", text: "Make Better Editing Decisions" },
        {
          type: "paragraph",
          text: "If some parts of your writing don't sound clear or natural, the results can help you decide what needs to be improved. You can then work on those sentences or paragraphs to make your content easier to read.",
        },
        { type: "subheading", text: "Build Awareness of AI Writing" },
        {
          type: "paragraph",
          text: "Get familiar with the writing patterns that AI content detectors look for. This can help you understand what makes AI-written text different and how these patterns may appear in different types of content.",
        },
        { type: "subheading", text: "Review Content Before Sharing" },
        {
          type: "paragraph",
          text: "Before you submit an assignment, send your work, or publish content online, run it through an AI detector. It's a simple way to see how your writing may appear to AI detection tools before sharing it with others.",
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
          question: "What is an AI Detector?",
          answer:
            "AI detector is a tool which will help you to know whether your text is written by AI or not. In this way, the detector searches the patterns in the text which are used mostly in ChatGPT and other artificial intelligence.",
        },
        {
          question: "How does an AI checker work?",
          answer:
            "AI detector scans your text and finds out all its elements such as words, sentences, and style of writing. Then it analyses these elements and determines whether your text is created by AI or human.",
        },
        {
          question: "Can an AI Detector detect ChatGPT?",
          answer:
            "Yes, the AI detector can determine whether your text contains patterns which are typical for ChatGPT writing. At the same time, the results of scanning might not be completely true.",
        },
        {
          question: "Is this AI detector free to use?",
          answer:
            "Yes, it is free to use this AI Detector. There is no payment required to check your written text.",
        },
        {
          question: "Do I have to sign up in order to use this AI Detector?",
          answer:
            "There is no need to create an account in order to use this AI Detector. You just have to open the tool, copy your text and check it out.",
        },
        {
          question: "Can an AI Detector give wrong results?",
          answer:
            "Yes, AI Detectors can give false results. They may wrongly detect human-written text as AI-generated and vice versa.",
        },
        {
          question: "Is it possible to use an AI Detector for my essays and assignments?",
          answer:
            "Yes, you can use it to detect your essays, homework, assignments, and research papers. These results can give you clues about which part of your text you should pay extra attention to.",
        },
        {
          question: "Will an AI Detector rewrite the AI-generated text?",
          answer:
            "No, the AI Detector detects whether there is any sign of AI in your text but does not rewrite or edit anything in your text.",
        },
      ],
    },
  ],
};
