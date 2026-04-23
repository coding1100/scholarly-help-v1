"use client";

import React, { useState, useEffect } from "react";
import ThesisGeneratorForm from "./ThesisGeneratorForm";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import { requestTokenUsageRefresh } from "@/app/utils/tokenUsageClient";

const ThesisGenerator = () => {
  const [token, setToken] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    topic: "",
    mainIdea: "",
    supportingReason: "",
    audience: "",
  });

  const handleClear = () => {
    setFormData({
      topic: "",
      mainIdea: "",
      supportingReason: "",
      audience: "",
    });
    setResultText("");
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      alert("Topic is required");
      return;
    }

    trackToolGenerate({ toolName: "Thesis Generator Tool" });
    setSubmitting(true);
    setResultText("Generating thesis...");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/generate-thesis`,
        {
          topic: formData.topic.trim(),
          main_idea: formData.mainIdea.trim() || undefined,
          supporting_reason: formData.supportingReason.trim() || undefined,
          audience: formData.audience.trim() || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Response", response);

      setResultText(response.data?.final_thesis);
      requestTokenUsageRefresh(0);
    } catch (error: any) {
      // console.error("API Error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container overflow-y-auto h-[90vh] w-[89%] mx-auto p-4 md:px-8">
      {/* <h1 className="text-3xl md:text-5xl text-center mb-4 font-serif">
        Thesis Generator
      </h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 flex-grow border border-gray-200 dark:border-gray-700 mt-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <ThesisGeneratorForm formData={formData} setFormData={setFormData} />
          <ActionButtons
            onClear={handleClear}
            onSubmit={handleGenerate}
            submitButtonText="Generate Thesis"
            isSubmitting={isSubmitting}
            isDisabled={!formData.topic}
          />
        </div>
        <ResultDisplay resultText={resultText} title="Result" />
      </div>
      <div className="text-sm font-serif font-medium text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Finding it hard to rephrase your ideas effectively? ScholarlyHelp
          offers a powerful AI-driven paraphrasing tool designed to rewrite your
          academic content with clarity, coherence, and originality—helping you
          express your thoughts more clearly and confidently.
        </q>
      </div>
    </div>
  );
};

export default ThesisGenerator;
