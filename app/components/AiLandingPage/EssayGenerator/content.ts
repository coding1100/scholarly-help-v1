// Copy for the /tools/ai-essay-generator landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const essayGeneratorMeta = {
  title: "Free AI Essay Generator for Students",
  description:
    "Try our free AI essay generator to create well-structured essays from your topic or instructions. Get writing ideas and start your next assignment with ease.",
};

const TOOL_ANCHOR_ID = "essay-generator-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const essayGeneratorLanding: LandingContent = {
  toolName: "AI Essay Generator",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "essay_generator_tool_landing",

  hero: {
    titleLead: "AI Essay Generator –",
    titleAccent: "Create Essays Online for Free",
    subtitle:
      "Use an AI Essay Generator to create an essay using AI. Get help with every stage of essay writing. Create a complete essay, make an outline, or find ideas for your thesis and title.",
  },

  mobileBar: {
    tool: toTool("Write my essay"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is an AI Essay Generator?",
      paragraphs: [
        "An AI Essay Generator is an online tool that helps you write essays using artificial intelligence. You can enter a topic, paste your assignment instructions, or upload a file to get started. It uses the information you provide to create an essay based on your requirements. Instead of spending time wondering how to begin, you can get a first draft and work on improving it.",
        "ScholarlyHelp's Essay Generator makes it easier to get started with your writing. Simply enter your topic or add your assignment instructions, and the tool will help you create an essay. If you don't need a complete essay, you can also use it to create an outline, explore thesis statement ideas, or find a suitable title. Whether you're working on a class assignment, a research topic, or a college essay, it gives you a starting point to organize your thoughts and develop your writing. You can then review the content, make changes, and add your own ideas before submitting your work.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Students, college students, and anyone who needs help writing essays",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Create an Essay with AI",
      subtitle:
        "Writing an essay is easier when you know where to start. Add your topic or assignment details, choose what you want to create, and let the AI Essay Generator help you with the rest.",
      steps: [
        {
          title: "Enter Your Topic or Assignment",
          description: "Start by providing the details of your essay.",
          note: {
            title: "Add Your Instructions",
            description:
              "Type your essay topic, paste your assignment instructions, or upload a file with the details you want to use.",
          },
        },
        {
          title: "Choose What You Want to Create",
          description: "Decide which part of the essay you need help with.",
          note: {
            title: "Select Your Writing Task",
            description:
              "Generate a complete essay, create an outline, develop a thesis statement, or come up with a suitable title.",
          },
        },
        {
          title: "Generate Your Essay",
          description: "Once you've added the details, start the generation process.",
          note: {
            title: "Review Your Results",
            description:
              "Get your essay or selected content, read through it, and make any changes you need. You can add your own ideas and edit the draft before using it.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our AI Essay Generator?",
      subtitle:
        "Writing an essay can take time. Sometimes the hardest part is knowing where to begin. Our AI Essay Generator gives you a starting point when you're stuck. Enter your topic or assignment details and get help with your writing. You can create a complete essay or work on one part at a time.",
      cards: [
        {
          title: "Save Time on Essay Writing",
          description:
            "Starting from a blank page can be difficult. Enter your topic and let the tool create a first draft. You can then spend more time reviewing your work instead of writing every sentence from scratch.",
        },
        {
          title: "Organize Your Ideas",
          description:
            "Not sure how to structure your essay? Use the tool to create an outline. It helps you arrange your main points and decide what to cover in each section.",
        },
        {
          title: "Get Help with Your Thesis Statement",
          description:
            "A thesis statement tells readers what your essay is about. If you're struggling to write one, enter your topic and get a starting idea. You can then adjust it to match your main argument.",
        },
        {
          title: "Find a Suitable Essay Title",
          description:
            "Sometimes finding a good title is harder than writing the essay itself. Enter your topic and get title suggestions that match your subject. Pick one that fits your work.",
        },
        {
          title: "Start Without a Complicated Process",
          description:
            "You don't need to go through a lengthy setup. Just enter your essay topic or paste your assignment instructions. You can also upload a file to get started.",
        },
        {
          title: "Get Help at Different Stages",
          description:
            "You may need help with the whole essay or just one section. Use the generator to create a draft when you're starting out. You can also work on your outline or thesis statement separately.",
        },
      ],
      button: toTool("Try Free AI Essay Generator"),
    },

    {
      type: "detailCards",
      title: "Who Can Use an AI Essay Generator?",
      subtitle:
        "Our AI Essay Generator is useful for anyone who needs help getting started with an essay. It can make the writing process easier by giving you a first draft or helping you plan your ideas. Here are three groups who can benefit from using it.",
      items: [
        {
          name: "Students and College Students",
          description:
            "Students often have essays to write for their classes. Sometimes they know the topic but aren't sure how to put their ideas together.",
          details: [
            {
              label: "Get Help with Assignments",
              text: "Enter your assignment topic to generate a first draft. You can also create an outline to plan your essay before writing.",
            },
          ],
        },
        {
          name: "Researchers and Academics",
          description:
            "Research writing takes careful planning. Researchers can use the tool to explore a topic and organize their thoughts before developing a paper.",
          details: [
            {
              label: "Plan Your Research Writing",
              text: "Add your research topic to get a starting draft. You can also generate a thesis statement to help shape your main argument.",
            },
          ],
        },
        {
          name: "Teachers and Educators",
          description:
            "Teachers can use the tool to prepare sample essays for classroom activities. It can also help them explain how different parts of an essay fit together.",
          details: [
            {
              label: "Create Writing Examples",
              text: "Generate a sample essay or outline to use as a teaching example. You can review and edit the content to match your lesson.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Key Features of Our AI Essay Generator",
      subtitle:
        "Our AI Essay Generator comes with useful features to make essay writing easier. It helps you get started and gives you a clear direction for your work.",
      items: [
        {
          title: "Quick Essay Generation",
          description:
            "The tool creates a first draft based on your topic or assignment instructions, so you can get started without writing everything from scratch.",
        },
        {
          title: "Multiple Thesis and Title Ideas",
          description:
            "Get three options for your thesis statement or essay title. Compare the suggestions and choose the one that fits your topic.",
        },
        {
          title: "Understands Assignment Requirements",
          description:
            "Paste your full assignment instructions and the tool can pick up important details. These include the required word count and citation style.",
        },
        {
          title: "Better Grammar and Sentence Structure",
          description:
            "Get a draft with clear sentences and proper grammar. Review the wording and make changes to ensure your essay reads well.",
        },
      ],
    },

    {
      type: "comparison",
      title: "AI Essay Generator vs Research Question Generator vs AI Math Helper vs CGPA Calculator",
      subtitle:
        "ScholarlyHelp offers different tools to help students with their academic work. Each tool serves a different purpose. The AI Essay Generator helps with essay writing, while the other tools support research planning, math problems, and grade calculations.",
      columns: ["Research Question Generator", "AI Math Helper", "CGPA Calculator"],
      highlight: "AI Essay Generator",
      rows: [
        {
          label: "What it does",
          values: [
            "Generates research questions based on a topic or keywords",
            "Helps solve math problems with AI",
            "Calculates cumulative GPA",
          ],
          highlight: "Creates essays from topics or assignment instructions",
        },
        {
          label: "Best for",
          values: [
            "Developing research questions",
            "Understanding and solving math problems",
            "Calculating academic performance",
          ],
          highlight: "Getting help with essay writing",
        },
        {
          label: "Uses",
          values: [
            "Research papers and academic projects",
            "Math questions and equations",
            "Semester grades and credit hours",
          ],
          highlight: "School assignments and college essays",
        },
        {
          label: "Main benefit",
          values: [
            "Gives students direction for their research",
            "Makes math problems easier to understand",
            "Helps students track their overall academic performance",
          ],
          highlight: "Helps students get started with their essays",
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
      title: "Common Mistakes to Avoid When Using an AI Essay Generator",
      subtitle:
        "An AI Essay Generator can make essay writing easier. However, the results still need your attention. Keep these common mistakes in mind when using the tool.",
      items: [
        {
          title: "Using the Essay Without Reviewing It",
          description:
            "Always read the generated essay before using it. Check whether the content answers your assignment question and covers the main topic.",
        },
        {
          title: "Ignoring Your Assignment Instructions",
          description:
            "Make sure the essay follows the requirements given by your teacher. Check the word count and citation style before using the draft.",
        },
        {
          title: "Accepting Every Suggestion Without Checking",
          description:
            "AI-generated content may not always fit your topic. Review the information and make sure the ideas are relevant to your assignment.",
        },
        {
          title: "Relying Completely on AI",
          description:
            "Don't depend on the generated essay as your final work. Add your own ideas and make changes to reflect your understanding of the subject.",
        },
      ],
      note: {
        before: "Want to keep track of your academic performance? Try our free ",
        link: { label: "CGPA Calculator", href: "/tools/cumulative-gpa-calculator" },
        after: " to calculate your cumulative GPA and check your overall academic progress.",
      },
    },

    {
      type: "ctaBand",
      tag: "Start writing your essay with AI",
      titleStart:
        "Make essay writing easier with our free AI Essay Generator. Get help with your assignments and organize your ideas.",
      checks: [
        "Generate essays from your topic or assignment instructions",
        "Create an outline to plan your essay",
        "Get thesis statement and title suggestions",
      ],
      submitLabel: "Try AI Essay Generator",
      note: "Free to use · No sign-up required · AI-powered essay writing",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "How an AI Essay Generator Can Help with Academic Writing" },
        {
          type: "paragraph",
          text: "Writing an essay is not just about putting words together. You also need to understand your topic and organize your ideas. An AI Essay Generator can help you get started and make different parts of the writing process easier.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Explore Your Ideas:",
              text: "Not sure what to write about? Enter your topic to get a starting point. Use the suggestions to explore your subject and develop your own ideas.",
            },
            {
              lead: "Understand Essay Structure:",
              text: "A well-organized essay is easier to follow. Generate an outline to see how your introduction, body paragraphs, and conclusion can fit together.",
            },
            {
              lead: "Spend Less Time Getting Started:",
              text: "Starting an essay can take longer than expected. Use the generator to create a first draft so you have something to work with.",
            },
            {
              lead: "Improve Your Writing:",
              text: "Review the generated essay to see how sentences and paragraphs are put together. Use it as a reference when working on your own writing.",
            },
            {
              lead: "Develop Your Main Idea:",
              text: "A clear thesis statement gives your essay direction. Generate thesis ideas based on your topic and use them to shape your main argument.",
            },
          ],
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
          description:
            "Make AI-generated text sound more natural while keeping your original meaning.",
          href: "/tools/ai-humanizer",
        },
        {
          name: "Read My Essay",
          description:
            "Listen to your essays and study materials instead of reading everything on screen.",
          href: "/tools/read-my-essay",
        },
        {
          name: "Research Question Generator",
          description:
            "Generate research questions from your topic to help plan your academic work.",
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
      title: "Frequently Asked Questions About AI Essay Generators",
      items: [
        {
          question: "Is ScholarlyHelp's AI Essay Generator free to use?",
          answer:
            "Yes, ScholarlyHelp offers a free essay generator. You can use it to create essay drafts and get help with your writing without paying for the tool.",
        },
        {
          question: "Do I need to sign up to use the AI Essay Generator?",
          answer:
            "No, you don't need to create an account to get started. Simply open the tool, enter your topic or assignment details, and start using the essay generator.",
        },
        {
          question: "How does free Essay Generator work?",
          answer:
            "An AI Essay Generator uses artificial intelligence to understand the topic or instructions you provide. It then creates written content based on your input. You can use the result as a starting draft and make changes to it.",
        },
        {
          question: "Can an AI Essay Generator write different types of essays?",
          answer:
            "Yes. An essay generator AI can help create different types of essays, including argumentative, descriptive, narrative, persuasive, and expository essays. The results depend on the topic and instructions you provide.",
        },
        {
          question: "What is the difference between an AI Essay Generator and an AI Essay Writer?",
          answer:
            "Both terms generally refer to tools that use artificial intelligence to create essay content. An AI Essay Generator creates a draft based on your input, while AI Essay Writer is another common term for a tool with a similar purpose.",
        },
        {
          question: "Can an AI Essay Generator help with college application essays?",
          answer:
            "Yes, you can use an AI essay generator to explore ideas and prepare an initial draft for a college application essay. Your personal experiences and goals should guide the final version so it reflects your own voice.",
        },
        {
          question: "Can an AI Essay Generator help improve my essay writing skills?",
          answer:
            "Yes. You can learn from the generated drafts by looking at how ideas are presented and how paragraphs are connected. Use them as examples to develop your own writing skills.",
        },
        {
          question: "Can I use a free essay generator AI for academic assignments?",
          answer:
            "Yes, a free essay generator can help you prepare a draft for academic assignments. Use the generated content as a reference, check the information, and follow your school's guidelines for AI-assisted writing.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Start Your Essay Without Any",
      titlePill: "Stress",
      body: "No sign-up, no payments, no pressure. Just type a topic or upload your draft and let the AI Essay Generator help you write a full, clean, and well-structured essay in seconds.",
      primary: toTool("Start AI Essay Generator"),
      secondary: toTool("Try It for Free"),
    },
  ],
};
