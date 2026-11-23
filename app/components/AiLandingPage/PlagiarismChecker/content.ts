// Copy for the /tools/ai-plagiarism-checker landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const plagiarismCheckerMeta = {
  title: "Free Plagiarism Checker – Check Your Writing Online",
  description:
    "Looking for an easy way to check your work? Use our free plagiarism checker to find matching content and review your writing before submitting.",
};

const TOOL_ANCHOR_ID = "ai-plagiarism-checker-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const plagiarismCheckerLanding: LandingContent = {
  toolName: "AI Plagiarism Checker",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "plagiarism_checker_tool_landing",

  hero: {
    titleLead: "Free AI Plagiarism Checker –",
    titleAccent: "Make Your Writing Plagiarism-Free",
    subtitle:
      "Check your content with our free AI plagiarism checker to find copied text, spot duplicate content, and make sure your writing is original. Get quick results and improve your content before submitting or publishing it.",
  },

  mobileBar: {
    tool: toTool("Check plagiarism"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is a Plagiarism Checker?",
      paragraphs: [
        "A plagiarism checker is an online tool that checks your writing for copied or matching content. You can upload a DOCX, PDF, TXT, or RTF file or paste your text directly into the tool. It scans your content against websites and academic sources to find matching words, sentences, or paragraphs.",
        "A plagiarism checker helps students review their essays, assignments, and research papers before submitting them. It highlights matching content so you can check the sources and make changes where needed. You can also adjust scan settings to exclude quotes and bibliographies or compare your text with past scans. This makes it easier to review your work and improve its originality.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign Up", value: "No sign-up required" },
        {
          label: "Works For",
          value: "Essays, assignments, research papers, and other academic documents",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Check Your Content for Plagiarism",
      subtitle:
        "Checking your writing for copied content is easy. Upload your document or paste your text, adjust the scan settings, and let the AI Plagiarism Checker scan your work against online and academic sources.",
      steps: [
        {
          title: "Upload Your Document or Paste Your Text",
          description: "Start by adding the content you want to check.",
          note: {
            title: "Add Your Content",
            description:
              "Upload a DOCX, PDF, TXT, or RTF file from your computer, or copy and paste your essay, assignment, or research paper into the text box.",
          },
        },
        {
          title: "Adjust Your Scan Settings",
          description: "Choose how you want the tool to check your content.",
          note: {
            title: "Set Your Scan Preferences",
            description:
              "Open the scan settings to choose whether to exclude your bibliography and quoted text. You can also compare your content with past scans to review previous matches.",
          },
        },
        {
          title: "Check Your Content for Plagiarism",
          description: "Once your content is ready, start the plagiarism check.",
          note: {
            title: "Review Your Results",
            description:
              "Click the Check for Plagiarism button to scan your text against the open web and academic sources. Review the results to find matching content, check the sources, and make changes where needed.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our Plagiarism Checker?",
      subtitle:
        "Checking your work for copied content is an important part of academic writing. Sometimes, you may use words or ideas from other sources without realizing how closely they match the original. Our AI Plagiarism Checker helps you find similar content in your essays, assignments, and research papers. Add your text or upload a document to review matching content and make changes where needed.",
      cards: [
        {
          title: "Find Matching Content",
          description:
            "Not sure if your writing contains copied text? Use the tool to scan your content against online and academic sources. It helps you find matching words, sentences, and paragraphs that may need a closer look.",
        },
        {
          title: "Check Different Document Types",
          description:
            "You don't have to copy and paste your entire assignment. Upload your document directly from your computer. The tool supports DOCX, PDF, TXT, and RTF files, making it easier to check different types of academic work.",
        },
        {
          title: "Exclude Quotes and Bibliographies",
          description:
            "Quoted text and reference lists can also contain matching words. Use the scan settings to exclude your bibliography and quoted content from the check. This helps you focus on the main text of your document.",
        },
        {
          title: "Compare Your Past Scans",
          description:
            "Want to review content you've checked before? The tool includes an option to compare your current text with past scans. This makes it easier to check your writing again after making changes.",
        },
        {
          title: "Upload or Paste Your Text",
          description:
            "Choose the way you want to check your work. You can upload a supported file or paste your essay, assignment, or research paper directly into the text box. Just add your content and get started.",
        },
        {
          title: "Check Academic and Online Sources",
          description:
            "Your writing may contain text that matches information from different sources. The Plagiarism Checker scans your content against the open web and academic sources to help you identify similar text and review it before submission.",
        },
      ],
      button: toTool("Try Free Plagiarism Checker"),
    },

    {
      type: "detailCards",
      title: "Who Can Use a Plagiarism Checker?",
      subtitle:
        "Our Plagiarism Checker is useful for anyone who wants to check their writing for copied or matching content. It helps you review your work, find similar text, and make changes before sharing or submitting a document. Here are three groups who can benefit from using it.",
      items: [
        {
          name: "Students and College Students",
          description:
            "Students write essays, assignments, and research papers for their classes. Sometimes, they use information from different sources and may not realize that some sentences are too close to the original text.",
          details: [
            {
              label: "Check Your Assignments",
              text: "Upload your assignment or paste your text into the tool. Check for matching content, review the sources, and make changes where needed before submitting your work.",
            },
          ],
        },
        {
          name: "Researchers and Academics",
          description:
            "Researchers often use information from books, journals, and online publications when preparing academic papers. Checking their writing helps them find similar content and review how they have used information from other sources.",
          details: [
            {
              label: "Review Your Research Papers",
              text: "Add your research paper to the tool to find matching text. Review the highlighted sections, check your references, and make sure you have given proper credit to the original sources.",
            },
          ],
        },
        {
          name: "Teachers and Educators",
          description:
            "Teachers can use a plagiarism checker to review student assignments and academic documents. It helps them find matching content and identify sections that may need further review.",
          details: [
            {
              label: "Check Student Work",
              text: "Upload a student's assignment or paste the text to scan it against online and academic sources. Review the matching content to support discussions about original writing and proper citations.",
            },
          ],
        },
      ],
    },

    {
      type: "cards",
      title: "Key Features of Our Plagiarism Checker",
      subtitle:
        "Our best Plagiarism Checker offers simple features to help you check your writing without any complicated steps. Whether you're reviewing an assignment or a research paper, you can use the tool without paying or creating an account.",
      cards: [
        {
          title: "Free to Use",
          description:
            "You can check your content without worrying about subscription fees. The tool is free to use, making it easier for students to review their academic work.",
        },
        {
          title: "No Sign-Up Required",
          description:
            "You don't need to create an account or share your personal details to get started. Open the tool, add your content, and begin your plagiarism check.",
        },
        {
          title: "Easy-to-Use Interface",
          description:
            "The tool has a simple layout that makes checking your writing straightforward. You can find the options you need and start a scan without going through a complicated process.",
        },
        {
          title: "Simple Scan Process",
          description:
            "You don’t need any technical knowledge to check your content. Add your text, choose your scan preferences, and start the process to review your writing.",
        },
      ],
    },

    {
      type: "comparison",
      title: "AI Plagiarism Checker vs AI Essay Generator vs Research Question Generator vs AI Math Helper",
      subtitle:
        "ScholarlyHelp offers different tools to support students with their academic work. Each tool has a different purpose. The AI Plagiarism Checker helps students find matching content in their writing, while the other tools support essay writing, research planning, and solving math problems.",
      columns: ["AI Essay Generator", "Research Question Generator", "AI Math Helper"],
      highlight: "AI Plagiarism Checker",
      rows: [
        {
          label: "What it does",
          values: [
            "Creates essays from topics or assignment instructions",
            "Generates research questions based on topics or keywords",
            "Helps solve math problems with AI",
          ],
          highlight: "Checks writing for copied or matching content",
        },
        {
          label: "Best for",
          values: [
            "Getting help with essay writing",
            "Developing research questions",
            "Understanding and solving math problems",
          ],
          highlight: "Checking written work for similar content",
        },
        {
          label: "Uses",
          values: [
            "School assignments and college essays",
            "Research papers and academic projects",
            "Math questions and equations",
          ],
          highlight: "Essays, assignments, and research papers",
        },
        {
          label: "Main benefit",
          values: [
            "Helps students get started with essays",
            "Gives students direction for their research",
            "Makes math problems easier to understand",
          ],
          highlight: "Helps students review their writing and improve originality",
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
      title: "Common Mistakes to Avoid When Using a Plagiarism Checker",
      subtitle:
        "A Plagiarism Checker helps you find copied or similar content in your writing. But checking your text is not enough. You also need to understand the results and fix any problems. Here are some common mistakes to avoid when using the tool.",
      items: [
        {
          title: "Thinking Every Match Is Plagiarism",
          description:
            "Not every highlighted sentence means you have copied something. Common words, quotes, and properly cited information can also show up as matches. Always check the highlighted text before making changes.",
        },
        {
          title: "Not Checking the Original Sources",
          description:
            "Don't ignore the sources shown in your results. Open them and see why your text matches. This helps you decide if you need to change a sentence or add a reference.",
        },
        {
          title: "Depending Only on Plagiarism Score",
          description:
            "A low similarity score does not always mean your work is completely original. Read your content carefully and make sure you have given credit to the sources you used.",
        },
        {
          title: "Changing Only a Few Words",
          description:
            "Replacing a few words in a copied sentence does not make it your own work. First, understand the idea and then explain it in your own words. Remember to add a citation when using someone else's ideas.",
        },
      ],
      note: {
        before: "Want to keep track of your academic progress? Try our free ",
        link: { label: "CGPA Calculator", href: "/tools/cumulative-gpa-calculator" },
        after: " to calculate your cumulative GPA and see how you're doing in your studies.",
      },
    },

    {
      type: "ctaBand",
      tag: "CHECK YOUR WORK WITH OUR FREE PLAGIARISM CHECKER",
      titleStart:
        "Make your academic writing more original with our free online Plagiarism Checker. Find matching content in your assignments, essays, and research papers before submitting them.",
      checks: [
        "Check your writing against online and academic sources",
        "Find matching words, sentences, and paragraphs",
        "Review scan results and make changes where needed",
      ],
      submitLabel: "Try Plagiarism Checker",
      note: "Free to use · No sign-up required · Easy plagiarism checking",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How a Plagiarism Checker Can Help with Academic Writing" },
        {
          type: "paragraph",
          text: "When you're writing an essay or research paper, you may use information from different websites, books, and other sources. Sometimes, it's hard to tell if your sentences are too close to the original text. AI Plagiarism Checker helps you find similar content so you can review your work and make changes before submitting it.",
        },
        { type: "subheading", text: "Find Similar Text" },
        {
          type: "paragraph",
          text: "You may not always notice when your writing matches another source. The tool highlights similar words, sentences, and paragraphs so you can see which parts need a closer look.",
        },
        { type: "subheading", text: "Check Your References" },
        {
          type: "paragraph",
          text: "When you use information from other sources, it's important to give credit to the original authors. Check the matching sources to see where you may need to add a citation or reference.",
        },
        { type: "subheading", text: "Make Your Writing More Original" },
        {
          type: "paragraph",
          text: "If some sentences are too close to the original source, try explaining the same ideas in your own words. Use the results as a guide to improve your writing.",
        },
        { type: "subheading", text: "Review Your Work Before Submitting" },
        {
          type: "paragraph",
          text: "Before turning in an assignment or research paper, run a plagiarism check. This gives you time to look at matching text, fix mistakes, and make any needed changes.",
        },
        { type: "subheading", text: "Learn to Use Sources Properly" },
        {
          type: "paragraph",
          text: "Checking your writing can help you become more careful when using information from other sources. Over time, you can learn how to add citations, use quotes, and explain ideas in your own words.",
        },
      ],
    },

    {
      type: "moreTools",
      title: "Discover More Free Academic Tools",
      subtitle:
        "Explore more free ScholarlyHelp tools to support your studies and make everyday academic tasks easier.",
      items: [
        {
          name: "AI Humanizer",
          description: "Make AI-generated text sound more natural while keeping your original meaning.",
          href: "/tools/ai-humanizer",
        },
        {
          name: "Read My Essay",
          description: "Listen to your essays and study materials instead of reading everything on screen.",
          href: "/tools/read-my-essay",
        },
        {
          name: "Research Question Generator",
          description: "Generate research questions from your topic to help plan your academic work.",
          href: "/tools/research-question-generator",
        },
        {
          name: "AI Math Helper",
          description: "Get help solving math problems and understanding the steps involved.",
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
          question: "What is a plagiarism checker?",
          answer:
            "A plagiarism checker is an online tool that checks your writing for copied or similar content. It compares your text with online and academic sources to find matching words, sentences, or paragraphs.",
        },
        {
          question: "How does a free plagiarism checker work?",
          answer:
            "A free plagiarism checker scans your uploaded document or pasted text and compares it with available online and academic sources. It highlights matching content so you can review the results and make changes where needed.",
        },
        {
          question: "Is this plagiarism checker free to use?",
          answer:
            "Yes, our plagiarism checker is free to use. You can upload your document or paste your text to check for matching content without paying or creating an account.",
        },
        {
          question: "Is this a free online plagiarism checker for students?",
          answer:
            "Yes, students can use this free online plagiarism checker to review essays, assignments, research papers, and other academic documents. It helps them find similar content before submitting their work.",
        },
        {
          question: "Why should students use a plagiarism checker?",
          answer:
            "Students can use a plagiarism checker to review their essays, assignments, and research papers before submission. It helps them find matching content, check their references, and make changes to improve their writing.",
        },
        {
          question: "Can I check my research paper with a free plagiarism checker?",
          answer:
            "Yes, you can use a free plagiarism checker to review your research paper. Simply upload your document or paste your text to find matching content and check whether any citations or changes are needed.",
        },
        {
          question: "Does a plagiarism checker find copied sentences and paragraphs?",
          answer:
            "Yes, AI plagiarism checker can highlight words, sentences, and paragraphs that match available sources. You can review these matches, check the original sources, and decide whether to rewrite the text or add proper citations.",
        },
        {
          question: "What should I look for in the best plagiarism checker?",
          answer:
            "The best plagiarism checker should compare writing with relevant sources, clearly highlight matching content, and make results easy to review. For academic work, choose a tool that helps you identify similarities and check where citations or changes may be needed.",
        },
      ],
    },
  ],
};
