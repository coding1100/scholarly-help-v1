"use client";

import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import Step9 from "./Step9";
import Step10 from "./Step10";
import Step11 from "./Step11";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

export default function MicroLearningFlow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [minutesPerDay, setMinutesPerDay] = useState<number>(15);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [lessonDuration, setLessonDuration] = useState<number>(15);
    const [lessonTopic, setLessonTopic] = useState<string>("Science");
    const [quizConversationId, setQuizConversationId] = useState<string>("");
    const [quizResults, setQuizResults] = useState<{
        totalQuestions: number;
        correctAnswers: number;
        incorrectQuestionNumbers: number[];
    } | null>(null);

    return (
        <> 
            {currentStep === 1 && <Step1 onContinue={() => setCurrentStep(2)} />}
            {currentStep === 2 && (
                <Step2
                    onBack={() => setCurrentStep(1)}
                    onContinue={(goals) => {
                        trackToolGenerate({ toolName: "Micro Learning" });
                        setSelectedGoals(goals);
                        setCurrentStep(3);
                    }}
                />
            )}
            {currentStep === 3 && (
                <Step3
                    onBack={() => setCurrentStep(2)}
                    onContinue={(minutes) => {
                        setMinutesPerDay(minutes);
                        setCurrentStep(4);
                    }}
                />
            )}
            {currentStep === 4 && (
                <Step4
                    onBack={() => setCurrentStep(3)}
                    onContinue={(topics) => {
                        setSelectedTopics(topics);
                        setCurrentStep(5);
                    }}
                />
            )}
            {currentStep === 5 && (
                <Step5
                    goals={selectedGoals}
                    minutesPerDay={minutesPerDay}
                    topics={selectedTopics}
                    onStart={() => setCurrentStep(6)}
                />
            )}
            {currentStep === 6 && (
                <Step6
                    dayStreak={0}
                    bestStreak={0}
                    lessonsCompleted={0}
                    hoursLearned={0}
                    topicsExplored={selectedTopics.length}
                    todayLessonMinutes={minutesPerDay}
                    selectedTopic={selectedTopics[0] || "Science"}
                    onStartLesson={(duration, topic) => {
                        setLessonDuration(duration);
                        setLessonTopic(topic);
                        setCurrentStep(9);
                    }}
                    onReviewFlashcards={() => {
                        // Handle review flashcards
                        console.log("Review flashcards");
                    }}
                    onViewProgress={() => {
                        // Handle view progress
                        console.log("View progress");
                    }}
                    onStartNow={() => {
                        // Handle start now
                        console.log("Start now");
                    }}
                />
            )}
            {currentStep === 9 && (
                <Step9
                    duration={lessonDuration}
                    topic={lessonTopic}
                    onBack={() => setCurrentStep(6)}
                    onTestUnderstanding={(conversationId) => {
                        setQuizConversationId(conversationId);
                        setCurrentStep(10);
                    }}
                    onCompleteLesson={() => {
                        // Handle complete lesson
                        console.log("Complete lesson");
                    }}
                />
            )}
            {currentStep === 10 && (
                <Step10
                    conversationId={quizConversationId}
                    onBack={() => setCurrentStep(9)}
                    onComplete={(results) => {
                        setQuizResults(results);
                        setCurrentStep(11);
                    }}
                />
            )}
            {currentStep === 11 && quizResults && (
                <Step11
                    totalQuestions={quizResults.totalQuestions}
                    correctAnswers={quizResults.correctAnswers}
                    incorrectQuestionNumbers={quizResults.incorrectQuestionNumbers}
                    onStartOver={() => setCurrentStep(1)}
                />
            )}
        </>
    );
}
