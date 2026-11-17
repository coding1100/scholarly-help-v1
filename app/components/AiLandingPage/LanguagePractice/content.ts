// Copy for the /tools/ai-language-practice landing page. Layout lives in the
// shared LandingTemplate; all user-facing text for this page lives here.
import { DONE_FOR_YOU_ID } from "../Template/ui";
import type { LandingContent, LinkButton } from "../Template/types";

export const languagePracticeMeta = {
  title: "AI Language Practice Tool to Learn a New Language",
  description:
    "Learn a new language with our free AI Language Practice tool. Check your level, set goals, and practice vocabulary, grammar, conversations, and pronunciation.",
};

const TOOL_ANCHOR_ID = "language-practice-tool";
const toTool = (label: string): LinkButton => ({ label, href: `#${TOOL_ANCHOR_ID}` });

export const languagePracticeLanding: LandingContent = {
  toolName: "AI Language Practice",
  toolAnchorId: TOOL_ANCHOR_ID,
  placement: "language_practice_tool_landing",

  hero: {
    titleLead: "AI Language Practice –",
    titleAccent: "Learn and Improve Your Language Skills",
    subtitle:
      "Learn a new language with AI Language Practice. Choose your language, check your level, and set your goals. Practice new words, grammar, conversations, and pronunciation while keeping track of your progress.",
  },

  mobileBar: {
    tool: toTool("Start practicing"),
    expert: { label: "Get expert help", href: `#${DONE_FOR_YOU_ID}` },
  },

  sections: [
    {
      type: "whatIs",
      title: "What Is AI Language Practice?",
      paragraphs: [
        "AI Language Practice is an online tool that helps you learn a new language and get better at using it. You can start by choosing a language, checking your current level, and setting a few learning goals. Once you're done, you can move on to different activities to learn new words, understand grammar, practice conversations, and work on pronunciation.",
        "ScholarlyHelp's AI Language Practice tool makes it easier to work on all these skills without searching for different learning resources. For example, if you're learning Spanish for an upcoming trip, you can practice useful words, learn how to form sentences, and get familiar with everyday conversations. You can also check your progress as you go. It's a simple way to make time for language learning, whether you're studying for school, travelling, working, or just learning something new.",
      ],
      glance: [
        { label: "Price", value: "Free to use" },
        { label: "Sign-up", value: "Sign-up required" },
        {
          label: "Works for",
          value: "Students, beginners, and anyone who wants to learn or improve a language",
        },
        { label: "Language", value: "English" },
      ],
    },

    {
      type: "steps",
      title: "3 Simple Steps to Practice a Language with AI",
      subtitle:
        "Getting started with AI Language Practice is simple. Follow the guided steps to choose your language, set your learning goals, and practice different language skills.",
      steps: [
        {
          title: "Select Your Language and Complete an Assessment",
          description: "Start by choosing the language you want to learn.",
          note: {
            title: "Check Your Current Level",
            description:
              "Select your preferred language and complete the assessment. This helps you identify your current skill level before you begin practicing.",
          },
        },
        {
          title: "Set Your Goals and Practice Language Skills",
          description: "Choose what you want to achieve with your language learning.",
          note: {
            title: "Build Your Vocabulary and Grammar",
            description:
              "Set your learning goals, then move on to vocabulary and grammar practice. Learn new words, understand sentence structures, and improve your basic language skills.",
          },
        },
        {
          title: "Practice Conversations and Pronunciation",
          description: "Use what you've learned in practical language activities.",
          note: {
            title: "Improve and Track Your Progress",
            description:
              "Practice everyday conversations and work on your pronunciation. You can also check your progress to see how your language skills develop as you continue learning.",
          },
        },
      ],
    },

    {
      type: "cards",
      title: "Why Choose Our AI Language Practice Tool?",
      subtitle:
        "Learning a new language isn't always easy. You may know some words but struggle with grammar or speaking. That's why we created AI Language Practice. It gives you a simple way to work on different language skills without having to look for separate resources.",
      cards: [
        {
          title: "Everything in One Place",
          description:
            "You can practice vocabulary, grammar, conversations, and pronunciation in one tool. There's no need to switch between different learning resources.",
        },
        {
          title: "Find Out Your Language Level",
          description:
            "Not sure how much you know? Start with the assessment. It gives you an idea of your current level so you know where to begin.",
        },
        {
          title: "Learn Words and Grammar",
          description:
            "Pick up new words and learn how to use them in sentences. You can also work on grammar to understand the language better.",
        },
        {
          title: "Get Better at Everyday Conversations",
          description:
            "Want to feel more comfortable using a new language? Use the conversation stage to practice everyday communication.",
        },
        {
          title: "Work on How You Speak",
          description:
            "Knowing the words is one thing, but saying them clearly is just as important. The pronunciation stage lets you work on how you say words.",
        },
        {
          title: "Start Learning for Free",
          description:
            "You can use our AI Language Practice tool without paying anything. Just sign up, choose a language, and get started.",
        },
      ],
      button: toTool("Try AI Language Practice for Free"),
    },

    {
      type: "detailCards",
      title: "Who Can Use AI Language Practice?",
      subtitle:
        "Our AI Language speaking practice tool is useful for anyone who wants to learn a new language or improve their existing skills. Whether you're studying for school, preparing for travel, or learning for personal reasons, the guided activities can help you practice different parts of a language.",
      items: [
        {
          name: "Students and College Students",
          description:
            "Students often need to learn another language for their studies. They may understand basic words but need more practice with grammar, conversations, and pronunciation.",
          details: [
            {
              label: "Improve Your Language Skills",
              text: "Use the tool to build vocabulary, practice grammar, and become more comfortable using a new language in your studies.",
            },
          ],
        },
        {
          name: "Beginners and Language Learners",
          description:
            "Starting a new language can feel difficult when you don't know which skills to learn first. A guided learning path can make the process easier to follow.",
          details: [
            {
              label: "Learn Step by Step",
              text: "Choose your preferred language, complete the assessment, and set your learning goals. Then work through vocabulary, grammar, conversation, and pronunciation activities.",
            },
          ],
        },
        {
          name: "Travelers and Working Professionals",
          description:
            "Travelers may want to learn useful phrases before visiting another country, while professionals may want to communicate better with people who speak a different language.",
          details: [
            {
              label: "Practice Everyday Communication",
              text: "Work on common words, everyday conversations, and pronunciation to prepare for different communication situations.",
            },
          ],
        },
      ],
    },

    {
      type: "pointCards",
      tone: "check",
      title: "Key Features of Our AI Language Practice Tool",
      subtitle:
        "Our AI Language Practice tool includes different learning stages to help you work on your language skills. From checking your current level to practicing conversations, each stage gives you a way to focus on a different part of learning.",
      items: [
        {
          title: "Language Selection",
          description:
            "Choose the language you want to learn before starting your practice journey. This helps you focus on the language that matches your learning needs.",
        },
        {
          title: "Learning Level Assessment",
          description:
            "Complete an assessment to check your current language level. It gives you an idea of where to begin and helps you understand your starting point.",
        },
        {
          title: "Personalized Learning Goals",
          description:
            "Set goals based on what you want to achieve. You can use these goals to stay focused and give your language practice a clear direction.",
        },
        {
          title: "Vocabulary Practice",
          description:
            "Work on learning new words and expressions. Build your vocabulary and improve your understanding of words you may use in everyday communication.",
        },
      ],
    },

    {
      type: "comparison",
      title:
        "AI Language Practice vs Research Question Generator vs AI Math Helper vs CGPA Calculator",
      subtitle:
        "ScholarlyHelp offers different tools to support students with their learning and academic work. Each tool has a different purpose. AI Language Practice helps users learn and improve language skills, while the other tools support research planning, math problem-solving, and grade calculations.",
      columns: ["Research Question Generator", "AI Math Helper", "CGPA Calculator"],
      highlight: "AI Language Practice",
      rows: [
        {
          label: "What it does",
          values: [
            "Generates research questions based on a topic or keywords",
            "Helps solve math problems with AI",
            "Calculates cumulative GPA",
          ],
          highlight: "Guides users through language learning activities",
        },
        {
          label: "Best for",
          values: [
            "Developing research questions",
            "Understanding and solving math problems",
            "Calculating academic performance",
          ],
          highlight: "Learning a new language and improving language skills",
        },
        {
          label: "Uses",
          values: [
            "Research papers and academic projects",
            "Math questions and equations",
            "Semester grades and credit hours",
          ],
          highlight: "Vocabulary, grammar, conversations, and pronunciation practice",
        },
        {
          label: "Main benefit",
          values: [
            "Gives students direction for their research",
            "Makes math problems easier to understand",
            "Helps students track their overall academic performance",
          ],
          highlight: "Helps users practice different language skills in one place",
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
      title: "Common Mistakes to Avoid When Using AI Language Practice",
      subtitle:
        "AI Language Practice can help you build your language skills, but how you use the tool also matters. Avoid these common mistakes to make your learning experience more useful.",
      items: [
        {
          title: "Skipping the Initial Assessment",
          description:
            "Don't skip the assessment stage. It helps you understand your current language level and gives you a starting point for your practice.",
        },
        {
          title: "Setting Unclear Learning Goals",
          description:
            "Starting without clear goals can make it harder to stay focused. Decide what you want to improve, whether it's vocabulary, grammar, conversation, or pronunciation.",
        },
        {
          title: "Focusing Only on Vocabulary",
          description:
            "Learning new words is important, but language learning involves more than memorizing vocabulary. Give attention to grammar, conversations, and pronunciation as well.",
        },
        {
          title: "Avoiding Conversation Practice",
          description:
            "Knowing words and grammar rules doesn't always mean you can use them in real conversations. Make time for conversation practice to become more comfortable communicating in the language.",
        },
        {
          title: "Ignoring Pronunciation Practice",
          description:
            "Learning the correct words is only part of communication. Pay attention to pronunciation so you can work toward speaking more clearly.",
        },
        {
          title: "Practicing Without Checking Your Progress",
          description:
            "Don't forget to review your progress. It helps you see how your learning is developing and which areas may need more attention.",
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
      tag: "Start learning a new language with AI",
      titleStart:
        "Make language learning easier with our free AI language speaking practice online tool. Build your skills through guided activities and track your learning progress.",
      checks: [
        "Choose your preferred language and check your current level",
        "Practice vocabulary, grammar, and everyday conversations",
        "Improve your pronunciation and follow your progress",
      ],
      submitLabel: "Try AI Language Practice",
      note: "Free to use · Sign-up required · Guided language learning",
    },

    {
      type: "guide",
      blocks: [
        { type: "heading", text: "Why AI Language Practice Beats Traditional Language Learning" },
        {
          type: "paragraph",
          text: "Learning a new language through books and notes can take time. You may struggle to decide what to learn first or how to practice different skills. Our AI Language Practice tool makes the process easier by guiding you through language selection, assessment, goal setting, and different practice activities.",
        },
        {
          type: "list",
          items: [
            {
              lead: "Save Time on Language Learning:",
              text: "Practice vocabulary, grammar, conversations, and pronunciation in one place instead of searching for separate learning resources.",
            },
            {
              lead: "Follow a Structured Learning Path:",
              text: "Move through eight guided stages, from selecting your language and completing an assessment to practicing different skills and checking your progress.",
            },
            {
              lead: "Set Clear Learning Goals:",
              text: "Choose what you want to achieve and set learning goals based on your needs. This helps you stay focused on the language skills you want to improve.",
            },
            {
              lead: "Practice Different Language Skills:",
              text: "Work on vocabulary, grammar, conversation, and pronunciation through separate learning stages. This gives you a chance to focus on different parts of the language.",
            },
            {
              lead: "Improve Your Everyday Communication:",
              text: "Practice everyday conversations and pronunciation to become more comfortable using the language in different situations.",
            },
            {
              lead: "Keep Track of Your Learning Progress:",
              text: "Review your progress as you move through the learning stages. This helps you see how your practice is developing and which areas may need more attention.",
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
          name: "Online Exam Prep",
          description:
            "Create a personalized study schedule based on your exam date, subject, and available study time.",
          href: "/tools/ai-exam-prep",
        },
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
      ],
      button: { label: "Explore All Free Tools", href: "/tools" },
    },

    {
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What is AI Language Practice used for?",
          answer:
            "AI Language Practice helps you learn a new language or get better at a language you already know. You can work on different skills through simple learning activities.",
        },
        {
          question: "Which language skills should I learn first?",
          answer:
            "Start with vocabulary and grammar. Learn common words and how to use them in sentences. Once you feel more comfortable, move on to conversations and pronunciation.",
        },
        {
          question: "Can I use AI Language Practice to learn a language from the beginning?",
          answer:
            "Yes. You can start by selecting your preferred language, completing the assessment, and setting your learning goals before moving on to the practice activities.",
        },
        {
          question: "How can I check my language level?",
          answer:
            "You can complete the assessment in AI Language Practice online tool to get an idea of your current level. It helps you understand where you stand before you start learning.",
        },
        {
          question: "Why should I set goals when learning a new language?",
          answer:
            "Setting goals helps you stay focused. It also gives you a clear idea of what you want to learn and which language skills you want to improve.",
        },
        {
          question: "How can I get better at a new language?",
          answer:
            "Try to practice a little every day. Learn new words, work on grammar, practice conversations, and pay attention to pronunciation. Regular practice can help you improve over time.",
        },
        {
          question: "Can students use AI Language Practice to improve their language skills?",
          answer:
            "Yes. Students can use it to practice vocabulary, grammar, conversations, and pronunciation. It can also be useful for students who want to build their language skills outside the classroom.",
        },
        {
          question: "How do I know if my language skills are improving?",
          answer:
            "Check your progress as you continue learning. You can use the progress stage in the tool to follow your learning journey and see how you are moving through the different stages.",
        },
      ],
    },
  ],
};
