// Copy for the /tools/read-my-essay landing page. Layout lives in the shared
// LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const metaContent = {
  title: "Read My Essay to Me Online for Free",
  description:
    "Read My Essay to Me is a text-to-speech online tool that aims to help you listen to your essays. It’s free and easy to use.",
};

const TOOL_ANCHOR_ID = "read-my-essay-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });
const CGPA_CALCULATOR = "/tools/cumulative-gpa-calculator";

export const readMyEssayLanding: LandingContent = {
  toolName: "Read My Essay",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "read_my_essay_landing",

  hero: {
    titleLead: "Read My Essay to Me:",
    titleAccent: "FREE Text-to-Speech Tool",
    subtitle:
      "Our free online text-to-speech tool converts your essays, assignments, and other written content into spoken audio in just a few clicks. Simply paste your text and listen to it aloud anytime.",
  },

  mobileBar: {
    tool: toTool("Read my essay"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What is Read My Essay to Me?",
      paragraphs: [
        "Read My Essay to Me is an online text-to-speech tool that converts written text into spoken words. It allows students to listen to their essays instead of reading them on a screen. Users can paste or enter their written content into the tool and have it read aloud. This makes it easier to listen to assignments, articles, research papers, and other written work. It can also help students review their writing while doing other tasks.",
        "Listening to your essay can help you notice things you might miss when reading silently. You may identify awkward sentences, repeated words, unclear phrases, or parts that do not flow naturally. Read My Essay can also make reviewing long assignments more convenient, especially for students who prefer listening to written content. It provides another way to check your work and understand how your writing sounds when spoken aloud.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "No sign-up required" },
        {
          label: "Works for",
          value: "Converting essays, assignments, articles, and other written text into speech.",
        },
        { label: "Language", value: "Multiple languages" },
      ],
    },

    {
      type: "steps",
      title: "How to Use Read My Essay in 3 Easy Steps",
      subtitle:
        "Convert your written content into speech in three simple steps. Listen to your essay and review how it sounds.",
      steps: [
        {
          title: "Enter Your Essay Text",
          description:
            "Copy your essay, assignment, or any written content and paste it into the text box.",
          note: {
            title: "Add Your Content",
            description: "Make sure your text is complete before starting.",
          },
        },
        {
          title: "Convert Text into Speech",
          description:
            "Click the available read or play option to turn your written text into spoken words.",
          note: {
            title: "Listen to Your Text",
            description: "Follow along as the tool reads your content aloud.",
          },
        },
        {
          title: "Review Your Essay",
          description:
            "Listen to the complete text and notice any sentences or words that may need improvement.",
          note: {
            title: "Make Changes",
            description: "Edit unclear sentences and improve your writing where needed.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Benefits of Using Read My Essay",
      subtitle:
        "Read My Essay makes it simple to turn written content into speech. It gives students an easier way to work with essays, assignments, and other written material.",
      cards: [
        {
          title: "Check How Your Essay Sounds",
          description:
            "Listen to your essay from start to finish and see if your sentences sound clear and natural when spoken aloud.",
        },
        {
          title: "Learn Correct Pronunciation",
          description:
            "Listening to written words can help you become more familiar with how different words are spoken.",
        },
        {
          title: "Reduce Screen Time",
          description:
            "Give your eyes a break from reading long paragraphs by listening to your written content instead.",
        },
        {
          title: "Stay Focused on Your Work",
          description:
            "Listen to your text while following along with the words to keep track of your ideas and understand the content.",
        },
        {
          title: "Make Learning More Flexible",
          description:
            "Choose to listen to your study notes, essays, or reading materials when you prefer audio over reading.",
        },
        {
          title: "Access Your Content Easily",
          description:
            "Convert your written material into speech whenever you need another way to read and review your content.",
        },
      ],
      button: toTool("Try It for Free"),
    },

    {
      type: "detailCards",
      title: "Who Can Use Read My Essay?",
      subtitle:
        "Read My Essay to Me is useful for anyone who wants to listen to written content instead of reading it.",
      items: [
        {
          name: "Students",
          description:
            "Students can listen to essays, homework, study notes, and research papers to review their written work.",
          details: [
            {
              label: "Study Support",
              text: "Listen to your study materials and review assignments more easily.",
            },
          ],
        },
        {
          name: "Teachers",
          description:
            "Teachers can listen to lesson plans, written instructions, and educational materials before sharing them with students.",
          details: [
            {
              label: "Lesson Preparation",
              text: "Check how your learning materials sound when read aloud.",
            },
          ],
        },
        {
          name: "Writers",
          description:
            "Writers can listen to articles, stories, and drafts to check sentence flow and find unclear wording.",
          details: [
            {
              label: "Writing Review",
              text: "Hear your content aloud and find areas that need improvement.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Why Use Our Read My Essay Tool?",
      items: [
        {
          title: "Easy to Use",
          description:
            "Paste your essay or any written text and convert it into speech with a few simple clicks.",
        },
        {
          title: "Quick Listening",
          description:
            "Turn your written content into audio quickly without reading every line yourself.",
        },
        {
          title: "Better Writing Review",
          description:
            "Listen to your text aloud to check sentence flow, unclear words, and repeated phrases.",
        },
        {
          title: "Free to Use",
          description:
            "Convert your written text into speech without paying any fees or creating an account.",
        },
      ],
    },

    {
      type: "comparison",
      title: "Read My Essay vs Paraphrasing Tool vs Grammar Checker vs CGPA Calculator",
      subtitle:
        "Each tool serves a different purpose and helps students with a specific part of their academic work. Here's how these tools compare and what you can use each one for.",
      columns: ["Paraphrasing Tool", "Grammar Checker", "CGPA Calculator"],
      highlight: "Read My Essay",
      rows: [
        {
          label: "What it does",
          values: [
            "Rewrites text in different words",
            "Fixes spelling, grammar, and punctuation",
            "Calculates cumulative grade point average",
          ],
          highlight: "Converts written text into spoken audio",
        },
        {
          label: "Best for",
          values: [
            "Rewording sentences and paragraphs",
            "Proofreading assignments",
            "Checking overall academic results",
          ],
          highlight: "Listening to essays and written content",
        },
        {
          label: "Uses",
          values: ["Existing text", "Written content", "Grades, GPA, and credit hours"],
          highlight: "Essays, articles, and assignments",
        },
        {
          label: "Main benefit",
          values: [
            "Helps express ideas differently",
            "Helps improve writing quality",
            "Helps track academic performance",
          ],
          highlight: "Makes written content easier to listen to",
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
      title: "Common Mistakes to Avoid When Using Read My Essay",
      subtitle:
        "Read My Essay makes it easy to listen to your written content. However, a few common mistakes can affect your listening experience. Keep these points in mind when using the tool.",
      items: [
        {
          title: "Pasting Incomplete Text",
          description:
            "Make sure your essay or document is complete before adding it to the tool.",
        },
        {
          title: "Ignoring Spelling Mistakes",
          description:
            "Check your text for spelling errors and missing words before converting it into speech.",
        },
        {
          title: "Skipping Parts of Your Essay",
          description:
            "Listen to your complete content to understand how your sentences sound from beginning to end.",
        },
        {
          title: "Relying Only on Audio",
          description:
            "Use listening as an extra way to review your writing, not as a replacement for proofreading.",
        },
      ],
      note: {
        before: "Want to track your academic progress? Try the free ",
        link: { label: "CGPA Calculator", href: CGPA_CALCULATOR },
        after: " to calculate your cumulative GPA.",
      },
    },

    {
      type: "ctaBand",
      tag: "Listen to your essay in seconds",
      titleStart: "Turn your written words into speech and listen to your content with ease.",
      checks: [
        "Convert essays and assignments into speech",
        "Listen to your text instead of reading it on screen",
        "Review how your sentences sound when spoken aloud",
      ],
      submitLabel: "Read My Essay Aloud",
      note: "Free to use · No sign-up required · Easy text-to-speech",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "When is Listening to Your Essay Helpful?" },
        {
          type: "paragraph",
          text: "Listening to your essay can be useful at different stages of your studies. You can use Read My Essay to Me when reviewing an assignment, studying for an exam, or working with long documents. It gives you another way to go through written content without reading every word on a screen.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Before Submitting an Assignment:",
              text: "Listen to your completed essay before submitting it. Hearing your sentences aloud can help you notice parts that may sound confusing or incomplete.",
            },
            {
              lead: "During Exam Preparation:",
              text: "Turn your study notes and written materials into speech. Listening to them can give you another way to review topics before an exam.",
            },
            {
              lead: "While Reading Long Documents:",
              text: "Long articles and research papers can take time to read. Use text-to-speech to listen to written content when you want a break from the screen.",
            },
            {
              lead: "When Reviewing Your Own Writing:",
              text: "Sometimes, reading your own work silently makes it harder to notice certain issues. Listening to it can help you hear how your ideas connect.",
            },
          ],
        },

        { type: "heading", text: "Types of Content You Can Convert into Speech" },
        {
          type: "paragraph",
          text: "Read My Essay is not limited to essays. You can use it to listen to different types of written content. Simply add your text to the tool and convert it into speech.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Assignments:",
              text: "Listen to completed assignments before submitting your work.",
            },
            {
              lead: "Study Notes:",
              text: "Convert your class notes and revision materials into spoken words.",
            },
            {
              lead: "Research Papers:",
              text: "Listen to research content and review your written information.",
            },
            {
              lead: "Articles and Blog Posts:",
              text: "Turn online articles, blog posts, and other written content into speech.",
            },
            {
              lead: "Written Instructions:",
              text: "Listen to assignment guidelines, project details, and other written instructions.",
            },
          ],
        },

        { type: "heading", text: "How Do Essay Readers Work?" },
        {
          type: "paragraph",
          text: "Essay readers use text-to-speech technology to change written words into audio. This technology analyzes the text and uses a computer-generated voice to speak the content. It follows the structure of the text to make the spoken version easier to understand.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            {
              lead: "Text Recognition:",
              text: "The technology first identifies the words and sentences in the provided text. It recognizes letters, words, and punctuation to understand how the content is written.",
            },
            {
              lead: "Language Processing:",
              text: "The system analyzes the text to understand sentence structure and word placement. It uses this information to determine how the words should sound when spoken.",
            },
            {
              lead: "Voice Generation:",
              text: "The text-to-speech system creates speech using a digital voice. It converts written words into audio while applying pronunciation, pauses, and sentence patterns.",
            },
            {
              lead: "Audio Playback:",
              text: "The generated speech is played through your device's audio output. You can hear the written content as spoken language rather than reading it silently.",
            },
          ],
        },
      ],
    },

    {
      type: "cards",
      title: "Key Features of Our Read My Essay Tool",
      cards: [
        {
          title: "Multiple Voice Options",
          description:
            "Choose from available voice options to listen to your essays and other written content in a voice that suits your preference.",
        },
        {
          title: "Adjustable Speed & Pitch",
          description:
            "Adjust the reading speed and pitch to make listening more comfortable and follow the spoken content at your preferred pace.",
        },
        {
          title: "Multi-Language Support",
          description:
            "Listen to written content in different languages, making it easier to work with text beyond English.",
        },
        {
          title: "Complete Privacy",
          description:
            "Keep your written content private while using the tool. Your essays and documents should remain protected during the text-to-speech process.",
        },
      ],
    },

    {
      type: "moreTools",
      title: "Explore Our Free Academic Tools",
      subtitle:
        "Get access to useful study tools in one free dashboard and make your academic work easier.",
      items: [
        {
          name: "CGPA Calculator",
          description:
            "Calculate your cumulative grade point average and check your overall academic performance.",
          href: CGPA_CALCULATOR,
        },
        {
          name: "Grammar Checker",
          description: "Check your writing for grammar, spelling, and punctuation mistakes.",
          href: "/tools/ai-grammar-check",
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
          question: "How can I read my essay out loud?",
          answer:
            "You can use our Read My Essay tool to listen to your writing. Simply paste your essay into the text box and click the play button. The tool will read your essay aloud so you can hear how your sentences sound.",
        },
        {
          question: "Is there a free tool that can Read My Essay to Me?",
          answer:
            "Yes, you can use Read My Essay to Me free with our text-to-speech tool. Paste your content, click play, and listen to your essay without paying or creating an account.",
        },
        {
          question: "Are there any limits when using a free essay reader?",
          answer:
            "Read My Essay supports up to 1,200 characters per play session. A daily usage limit also applies. You can contact support if you need a higher limit.",
        },
        {
          question: "How can I read my paper aloud while following the text?",
          answer:
            "Paste your paper into the tool and start the audio. You can follow the words on your screen as they are spoken. This makes it easier to keep track of your content and hear how your writing flows.",
        },
        {
          question: "Can listening to my essay help me find writing mistakes?",
          answer:
            "Definitely, when you Read My Essay aloud using a text-to-speech tool, you may notice repeated words, awkward sentences, or unclear phrases. However, listening does not replace a proper spelling and grammar check.",
        },
        {
          question: "How do I change the voice when I Read My Essay out loud?",
          answer:
            "The available voices depend on your browser and device. You may find different voice options, including male and female voices. The choices can also vary by language.",
        },
        {
          question: "Can I control the speed when reading my essay aloud?",
          answer:
            "Yes! You can adjust the reading speed from 0.5x to 2.0x. Choose a slower speed to follow the words more easily or increase it to finish listening sooner.",
        },
        {
          question: "How do I read aloud my essay in another language?",
          answer:
            "You can listen to text in other languages if your browser or device supports the required speech voices.",
        },
      ],
    },

    {
      type: "finalCta",
      titleStart: "Ready to Hear Your",
      titlePill: "Essay?",
      body: "Paste your text and listen to how your writing sounds when it is read aloud.",
      primary: toTool("Read My Essay Aloud"),
    },
  ],
};
