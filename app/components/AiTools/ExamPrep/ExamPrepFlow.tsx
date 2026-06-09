"use client";

import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { ChatResponse, sendChatMessage } from "@/app/utilities/api";

export default function ExamPrepFlow() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<{
        examType: string;
        subject: string;
        examDate: string;
        knowledgeLevel: string;
        targetScore: string;
        hoursPerDay: number;
        apiResponse: ChatResponse;
    } | null>(null);
    const [examResponse, setExamResponse] = useState<ChatResponse | null>(null);
    const [isLoadingExam, setIsLoadingExam] = useState(false);
    const [examResults, setExamResults] = useState<{
        totalQuestions: number;
        correctAnswers: number;
        score: number;
        answers: Map<number, string>;
    } | null>(null);

    const handleStep1Continue = (data: {
        examType: string;
        subject: string;
        examDate: string;
        knowledgeLevel: string;
        targetScore: string;
        hoursPerDay: number;
        apiResponse: ChatResponse;
    }) => {
        setFormData(data);
        setCurrentStep(2);
    };

    const handleStep2Back = () => {
        setCurrentStep(1);
    };

    const handleStartPractice = async (conversationId: string) => {
        if (!formData) return;

        setIsLoadingExam(true);
        try {
            const currentLevel = formData.knowledgeLevel.toLowerCase();
            const message = `Generate a practice exam for ${formData.examType} in ${formData.subject}. \nUse the create_practice_exam tool with:\n- exam_type: "${formData.examType}"\n- subject: "${formData.subject}"\n- num_questions: 20\n- time_limit: 60\n- difficulty: "${currentLevel}"`;

            const response = await sendChatMessage(message, conversationId);
            setExamResponse(response);
            setCurrentStep(3);
        } catch (error) {
            console.error("Failed to generate practice exam:", error);
            // TODO: Show error message to user
        } finally {
            setIsLoadingExam(false);
        }
    };

    return (
        <div className="relative">
            <ToolsApiLoader show={isLoadingExam} />
            {currentStep === 1 && (
                <Step1 onContinue={handleStep1Continue} />
            )}
            {currentStep === 2 && formData && (
                <Step2
                    examDate={formData.examDate}
                    apiResponse={formData.apiResponse}
                    examType={formData.examType}
                    subject={formData.subject}
                    knowledgeLevel={formData.knowledgeLevel}
                    onBack={handleStep2Back}
                    onStartPractice={handleStartPractice}
                    isLoading={isLoadingExam}
                />
            )}
            {currentStep === 3 && formData && examResponse && (
                <Step3
                    examType={formData.examType}
                    subject={formData.subject}
                    apiResponse={examResponse}
                    onComplete={(results) => {
                        setExamResults(results);
                        setCurrentStep(4);
                    }}
                />
            )}
            {currentStep === 4 && formData && examResults && (
                <Step4
                    examType={formData.examType}
                    subject={formData.subject}
                    examResults={examResults}
                    onBackToSchedule={() => setCurrentStep(2)}
                    onTakePracticeExam={() => {
                        if (examResponse) {
                            handleStartPractice(examResponse.conversation_id);
                        }
                    }}
                />
            )}
        </div>
    );
}
