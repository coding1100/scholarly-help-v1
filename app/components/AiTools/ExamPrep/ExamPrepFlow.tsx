"use client";

import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useState } from "react";
import toast from "react-hot-toast";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { ChatResponse, sendAgentTask } from "@/app/utilities/api";
import { usePersistentState } from "@/app/lib/client/toolOptimization";

export default function ExamPrepFlow() {
    const [saved, setSaved] = usePersistentState<{ currentStep: number; formData: {
        examType: string;
        subject: string;
        examDate: string;
        knowledgeLevel: string;
        targetScore: string;
        hoursPerDay: number;
        apiResponse: ChatResponse;
    } | null; examResponse: ChatResponse | null }>("sh_exam_prep_v2", { currentStep: 1, formData: null, examResponse: null });
    const currentStep = saved.currentStep;
    const formData = saved.formData;
    const examResponse = saved.examResponse;
    const setCurrentStep = (step: number) => setSaved((value) => ({ ...value, currentStep: step }));
    const setFormData = (data: NonNullable<typeof formData>) => setSaved((value) => ({ ...value, formData: data }));
    const setExamResponse = (response: ChatResponse) => setSaved((value) => ({ ...value, examResponse: response }));
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
            const response = await sendAgentTask({
                task: "create_practice_exam",
                parameters: { exam_type: formData.examType, subject: formData.subject, num_questions: 20, time_limit: 60, difficulty: currentLevel },
            }, conversationId);
            setExamResponse(response);
            setCurrentStep(3);
        } catch (error: any) {
            console.error("Failed to generate practice exam:", error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to generate practice exam. Please try again.",
            );
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
