"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step7 from "./Step7";
import Step8 from "./Step8";
import { useChat } from "@/app/context/ChatContext";
import { ParsedQuestion } from "@/app/utilities/api";
import FloatingChat from "../FloatingChat/FloatingChat";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import { requestTokenUsageRefresh } from "@/app/utils/tokenUsageClient";

export default function TutorFlow() {
  const { sendMessage, isLoading } = useChat();
  const [currentStep, setCurrentStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [subject, setSubject] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [topics, setTopics] = useState<{ id: string; emoji: string; name: string }[]>([]);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<{
    level: number;
    difficulty: string;
    descriptor: string;
  } | null>(null);

  const handleStep1Continue = async (name: string) => {
    setChildName(name);
    try {
      await sendMessage(`My name is ${name}.`);
      setCurrentStep(2);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleStep2Continue = async (subj: string) => {
    setSubject(subj);
    try {
      trackToolGenerate({ toolName: "Tutor Tool" });
      await sendMessage(
        `The student ${childName} wants to learn "${subj}". \n\nPlease validate if this is a valid educational subject. \n\nIf it's valid, respond with:\n**VALID_SUBJECT:** [subject name]\n\nIf it's not a valid subject, respond with:\n**INVALID_SUBJECT:** Please enter a valid educational subject. Examples include: Mathematics, Science, English, History, Geography, Physics, Chemistry, Biology, Literature, Art, Music, etc.`
      );
      requestTokenUsageRefresh(0);
      setCurrentStep(3);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleStep3Continue = async (subj: string, skillLevelValue: string) => {
    setSkillLevel(skillLevelValue);
    try {
      const response = await sendMessage(
        `I need you to generate a list of ${subj.toLowerCase()} learning topics suitable for a ${skillLevelValue.toLowerCase()} level student named ${childName}.\n\nIMPORTANT: Please provide the topics in this EXACT format (one topic per line):\n**Topic 1:** [Topic Name] [Emoji]\n**Topic 2:** [Topic Name] [Emoji]\n**Topic 3:** [Topic Name] [Emoji]\n...continue for 8-12 topics...\n\nCRITICAL FORMATTING RULES:\n- Start IMMEDIATELY with **Topic 1:** - NO introductory text before it\n- Each topic must be on its own line\n- Each line must start with **Topic N:** where N is the number\n- Include an appropriate emoji for each topic\n- Generate 8-12 topics total\n- NO other text, explanations, or conversational content - ONLY the topic list`
      );
      requestTokenUsageRefresh(0);

      // Parse topics from response
      const topicRegex = /\*\*Topic (\d+):\*\*\s*(.+?)(?=\n\*\*Topic|$)/g;
      const parsedTopics: { id: string; emoji: string; name: string }[] = [];
      let match;

      while ((match = topicRegex.exec(response)) !== null) {
        const topicText = match[2].trim();
        // Extract emoji (usually at the end) and topic name
        // Using a more compatible emoji regex pattern
        const emojiMatch = topicText.match(/([\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u26FF]|[\u2700-\u27BF])/);
        const emoji = emojiMatch ? emojiMatch[0] : "📚";
        const name = topicText.replace(emoji, "").trim();

        parsedTopics.push({
          id: match[1],
          emoji: emoji,
          name: name,
        });
      }

      if (parsedTopics.length > 0) {
        setTopics(parsedTopics);
        setCurrentStep(4);
      } else {
        toast.error("Could not parse topics. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleStep4Continue = (selectedTopic: string) => {
    setTopic(selectedTopic);
    // No API call here, just move to next step
    setCurrentStep(5);
  };

  const handleStep5Continue = async (
    levelNum: number,
    difficulty: string,
    descriptor: string
  ) => {
    setLevel({ level: levelNum, difficulty, descriptor });
    try {
      // Map difficulty descriptor to API format
      const difficultyMap: { [key: string]: string } = {
        Easy: "easy",
        Medium: "medium",
        Hard: "hard",
      };
      const apiDifficulty = difficultyMap[descriptor] || difficulty.toLowerCase();

      const response = await sendMessage(
        `Generate a quiz about ${topic} (${subject.toLowerCase()} subject) with exactly 5 multiple choice questions at ${apiDifficulty} difficulty level. \n\nIMPORTANT: \n- The quiz must be specifically about "${topic}" in ${subject.toLowerCase()}\n- Use the generate_quiz tool\n- Generate exactly 5 questions\n- Difficulty level: ${apiDifficulty}`
      );
      requestTokenUsageRefresh(0);

      // Parse quiz from response
      const parsedQuestions = parseQuizFromResponse(response);
      if (parsedQuestions.length > 0) {
        setQuizQuestions(parsedQuestions);
        setCurrentStep(6);
      } else {
        toast.error("Could not parse quiz questions. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to generate quiz. Please try again.");
    }
  };

  // Helper function to parse quiz from API response
  const parseQuizFromResponse = (quizText: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = [];

    // Split by question markers
    const questionBlocks = quizText.split(/\*\*Question \d+:\*\*/).filter(
      (block) => block.trim().length > 0
    );

    questionBlocks.forEach((block, idx) => {
      // Extract question number from the original text
      const questionNumMatch = quizText.match(new RegExp(`\\*\\*Question ${idx + 1}:\\*\\*`));
      if (!questionNumMatch) return;

      // Find the answer for this question block
      const answerMatch = block.match(/\*\*Answer:\*\*\s*([A-D])/);
      if (!answerMatch) return;

      const answer = answerMatch[1];

      // Extract question text (everything before options)
      const questionText = block
        .split(/\n[A-D]\)/)[0]
        .replace(/\*\*/g, "")
        .trim();

      // Extract options
      const options: { letter: string; text: string }[] = [];
      const optionRegex = /^([A-D])\)\s*(.+)$/gm;
      let optionMatch;

      while ((optionMatch = optionRegex.exec(block)) !== null) {
        options.push({
          letter: optionMatch[1],
          text: optionMatch[2].trim(),
        });
      }

      if (questionText && options.length >= 2 && answer) {
        questions.push({
          number: idx + 1,
          question: questionText,
          options: options,
          answer: answer,
        });
      }
    });

    return questions;
  };

  const [quizQuestions, setQuizQuestions] = useState<ParsedQuestion[]>([]);

  const [quizResult, setQuizResult] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    incorrectQuestionNumbers: number[];
  } | null>(null);

  const handleStep7Complete = (result: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectQuestionNumbers: number[];
  }) => {
    setQuizResult(result);
    setCurrentStep(8);
  };

  const handlePracticeMore = () => {
    // Go back to Step 5 (difficulty selection) to regenerate quiz
    setCurrentStep(5);
    setQuizQuestions([]);
    setQuizResult(null);
  };

  const handleChooseAnotherTopic = () => {
    // Go back to Step4 to choose a new topic
    setCurrentStep(4);
  };

  return (
    <>
      {currentStep === 1 && (
        <Step1 onContinue={handleStep1Continue} isLoading={isLoading} />
      )}
      {currentStep === 2 && (
        <Step2 onContinue={handleStep2Continue} isLoading={isLoading} />
      )}
      {currentStep === 3 && (
        <Step3 
          subject={subject}
          onContinue={handleStep3Continue}
          isLoading={isLoading}
        />
      )}
      {currentStep === 4 && (
        <Step4
          subject={subject}
          topics={topics}
          onContinue={handleStep4Continue}
        />
      )}
      {currentStep === 5 && (
        <Step5
          topic={topic}
          onContinue={handleStep5Continue}
          isLoading={isLoading}
        />
      )}
      {currentStep === 6 && level && quizQuestions.length > 0 && (
        <Step6
          childName={childName}
          topic={topic}
          difficulty={level.difficulty}
          questions={quizQuestions}
          onContinue={() => setCurrentStep(7)}
        />
      )}
      {currentStep === 7 && level && quizQuestions.length > 0 && (
        <Step7
          topic={topic}
          difficulty={level.difficulty}
          questions={quizQuestions}
          onComplete={handleStep7Complete}
        />
      )}
      {currentStep === 8 && quizResult && (
        <Step8
          totalQuestions={quizResult.totalQuestions}
          correctAnswers={quizResult.correctAnswers}
          incorrectQuestionNumbers={quizResult.incorrectQuestionNumbers}
          onPracticeMore={handlePracticeMore}
          onChooseAnotherTopic={handleChooseAnotherTopic}
        />
      )}
      {/* Floating Chat - visible on all steps except Step 1 */}
      {currentStep !== 1 && <FloatingChat />}
    </>
  );
}
