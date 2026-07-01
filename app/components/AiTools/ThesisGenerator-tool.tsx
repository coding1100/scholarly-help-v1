"use client";

import React, { useState, useEffect } from "react";
import ThesisGeneratorForm from "./ThesisGeneratorForm";
import ActionButtons from "./ActionButtons";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegCopy } from "react-icons/fa";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

type ThesisEntry = { type: string; thesis: string };

const TYPE_DESCRIPTIONS: Record<string, string> = {
  Analytical:
    "Breaks the topic into components and presents what the analysis reveals.",
  Argumentative:
    "Makes a debatable claim supported by reasoning or evidence.",
  Comparative:
    "Compares two subjects and draws a meaningful conclusion from the comparison.",
};

function ThesisCard({ entry }: { entry: ThesisEntry }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.thesis);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 mb-1">
            {entry.type}
          </span>
          {TYPE_DESCRIPTIONS[entry.type] && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {TYPE_DESCRIPTIONS[entry.type]}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 p-2 rounded-md border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          title="Copy thesis"
        >
          <FaRegCopy className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
        &ldquo;{entry.thesis}&rdquo;
      </p>
    </div>
  );
}

const ThesisGenerator = () => {
  const [token, setToken] = useState<string | null>(null);
  const [theses, setTheses] = useState<ThesisEntry[]>([]);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const [formData, setFormData] = useState({
    topic: "",
    mainIdea: "",
    supportingReason: "",
    audience: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const handleClear = () => {
    setFormData({ topic: "", mainIdea: "", supportingReason: "", audience: "" });
    setTheses([]);
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error("Topic is required.");
      return;
    }

    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      trackToolGenerate({ toolName: "AI Thesis Statement Generator" });
      setSubmitting(true);
      setTheses([]);

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

        // Backend wraps responses as { success, message, data }
        const data = response.data?.data ?? response.data;
        if (Array.isArray(data?.theses) && data.theses.length > 0) {
          setTheses(data.theses);
          toast.success("Thesis statements generated successfully!");
        } else {
          toast.error("No thesis statements returned. Please try again.");
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] w-[89%] mx-auto p-4 md:px-8">
      <ToolsApiLoader show={isSubmitting} />
      <div className="grid grid-cols-1 md:grid-cols-2 flex-grow border border-gray-200 dark:border-gray-700 mt-4 transition-colors duration-300">
        {/* Left — form */}
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

        {/* Right — results */}
        <div className="bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
          <div className="p-[9px] border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Result
            </h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {isSubmitting ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                Generating thesis statements...
              </div>
            ) : theses.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">
                Your thesis statements will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {theses.map((entry, i) => (
                  <ThesisCard key={i} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm font-serif font-medium text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Finding it hard to rephrase your ideas effectively? ScholarlyHelp
          offers a powerful AI-driven paraphrasing tool designed to rewrite your
          academic content with clarity, coherence, and originality—helping you
          express your thoughts more clearly and confidently.
        </q>
      </div>

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default ThesisGenerator;
