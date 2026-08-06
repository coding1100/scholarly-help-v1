"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import { usePersistentState } from "@/app/lib/client/toolOptimization";

const Step1 = dynamic(() => import("./Step1"));
const Step2 = dynamic(() => import("./Step2"));
const Step3 = dynamic(() => import("./Step3"));
const Step4 = dynamic(() => import("./Step4"));
const Step5 = dynamic(() => import("./Step5"));
const Step6 = dynamic(() => import("./Step6"));
const Step9 = dynamic(() => import("./Step9"));
const Step10 = dynamic(() => import("./Step10"));
const Step11 = dynamic(() => import("./Step11"));

type LearningProgress = { dayStreak: number; bestStreak: number; lessonsCompleted: number; minutesLearned: number; topicsExplored: string[]; lastCompletedDate?: string };

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
    const [progress, setProgress] = usePersistentState<LearningProgress>("sh_micro_learning_progress_v2", {
        dayStreak: 0, bestStreak: 0, lessonsCompleted: 0, minutesLearned: 0, topicsExplored: [],
    });

    useEffect(() => {
        if (selectedTopics.length === 0) return;
        setProgress((current) => ({ ...current, topicsExplored: [...new Set([...current.topicsExplored, ...selectedTopics])] }));
    }, [selectedTopics, setProgress]);

    const completeLesson = () => {
        const today = new Date().toISOString().slice(0, 10);
        setProgress((current) => {
            const previous = current.lastCompletedDate ? new Date(`${current.lastCompletedDate}T00:00:00`) : null;
            const days = previous ? Math.round((Date.now() - previous.getTime()) / 86_400_000) : null;
            const streak = current.lastCompletedDate === today ? current.dayStreak : days === 1 ? current.dayStreak + 1 : 1;
            return { ...current, dayStreak: streak, bestStreak: Math.max(current.bestStreak, streak), lessonsCompleted: current.lessonsCompleted + 1, minutesLearned: current.minutesLearned + lessonDuration, lastCompletedDate: today };
        });
        setCurrentStep(6);
        toast.success("Lesson complete. Nice work!", { id: "ml-complete" });
    };

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
                    dayStreak={progress.dayStreak}
                    bestStreak={progress.bestStreak}
                    lessonsCompleted={progress.lessonsCompleted}
                    hoursLearned={Math.round((progress.minutesLearned / 60) * 10) / 10}
                    topicsExplored={progress.topicsExplored.length}
                    todayLessonMinutes={minutesPerDay}
                    selectedTopic={selectedTopics[0] || "Science"}
                    onStartLesson={(duration, topic) => {
                        setLessonDuration(duration);
                        setLessonTopic(topic);
                        setCurrentStep(9);
                    }}
                    onReviewFlashcards={() => {
                        // Start a lesson session for the current topic so the
                        // flashcard/lesson flow is reachable from this button.
                        setLessonDuration(minutesPerDay);
                        setLessonTopic(selectedTopics[0] || "Science");
                        setCurrentStep(9);
                    }}
                    onViewProgress={() => {
                        toast(`You have completed ${progress.lessonsCompleted} lessons across ${progress.topicsExplored.length} topics.`, {
                            id: "ml-progress",
                        });
                    }}
                    onStartNow={() => {
                        setLessonDuration(minutesPerDay);
                        setLessonTopic(selectedTopics[0] || "Science");
                        setCurrentStep(9);
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
                    onCompleteLesson={completeLesson}
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
