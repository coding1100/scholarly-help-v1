"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import TextSummarizerInput from "./TextSummarizerInput";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import axios from "axios";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
type SummarizeData = {
  format: string;
  length: string;
  original_text: string;
  status: string;
  summary: string;
  error: any;
};

const SummarizerTool: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<string>("Medium");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);
  const [currentInputText, setCurrentInputText] = useState<string>("");
  const [summarizedResult, setSummarizedResult] =
    useState<SummarizeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wordLimitExceeded, setWordLimitExceeded] = useState(false);
  const [summaryStyle, setSummaryStyle] = useState<
    "Paragraph" | "Bullet Points"
  >("Paragraph");
  // const [summaryLength, setSummaryLength] = useState<number>(3);
  const lengthOptions = ["Short", "Medium", "Medium", "Medium", "Long"];

  const getLengthIndex = (label: string) => {
    return lengthOptions.findIndex((val) => val === label);
  };

  const handleTextChange = (text: string) => {
    setCurrentInputText(text);
  };

  const handlePdfUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (!token) throw new Error("Token not found");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const result = response.data;
      setCurrentInputText(result);
    } catch (error: any) {
      setSummarizedResult(
        error?.data?.message || "Failed to extract text from PDF.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!currentInputText.trim()) {
      alert("Please enter some text to summarize.");
      return;
    }

    trackToolGenerate({ toolName: "Summarizer Tool" });
    setIsLoading(true);

    try {
      if (!token) throw new Error("Access token not found");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/summarizer`,
        {
          text: currentInputText,
          format: summaryStyle,
          length: summaryLength,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = response;
      console.log("Response Summ", result.data);
      setSummarizedResult(result.data.summary);
    } catch (error: any) {
      console.error("Summarization failed:", error);
      setSummarizedResult(
        error?.response?.data?.message || "Failed to summarize the text.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllInputs = () => {
    setCurrentInputText("");
    setSummarizedResult(null);
  };

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      {/* <h1 className="text-2xl md:text-5xl text-center mb-4 font-serif">
        AI Summarizer Generator
      </h1> */}
      <ToolsApiLoader show={isLoading} />
      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ alignItems: "stretch" }}
      >
        {/* Input Component */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col transition-colors duration-300">
          <TextSummarizerInput
            title="AI Summarizer"
            onTextChange={handleTextChange}
            onPdfUpload={handlePdfUpload}
            initialText={currentInputText}
            onWordLimitExceeded={setWordLimitExceeded}
            placeholder="Enter text or upload PDF for summarization..."
          />
          {/* ───── Summary Style & Length controls ───── */}
          <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 p-2 transition-colors duration-300">
            {/* ===== Summary Style ===== */}
            <div className="flex justify-between items-center">
              <label
                htmlFor="summaryStyle"
                className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100 transition-colors duration-300"
              >
                Summary Style:
              </label>
              <div className="relative w-[50%]">
                <select
                  id="summaryStyle"
                  value={summaryStyle}
                  onChange={(e) =>
                    setSummaryStyle(
                      e.target.value as "Paragraph" | "Bullet Points",
                    )
                  }
                  className="w-full rounded-md border border-gray-200 text-black dark:border-gray-600 p-1 pr-7 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 appearance-none"
                >
                  <option value="Paragraph">Paragraph</option>
                  <option value="Bullet Points">Bullet Points</option>
                  <option value="Numbered List">Numbered List</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                  <FaChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* ===== Summary Length ===== */}
            <div className="flex space-x-4 justify-between items-center">
              <label className="block text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100 transition-colors duration-300">
                Summary Length:
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Short
                </span>
                <input
                  type="range"
                  min={0}
                  max={4}
                  value={getLengthIndex(summaryLength)}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setSummaryLength(lengthOptions[newValue]);
                  }}
                  className="flex-1 appearance-none h-2 rounded-full bg-gray-300/70 dark:bg-gray-700 accent-indigo-600 cursor-pointer transition-colors duration-300"
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Long
                </span>
              </div>
            </div>
          </div>

          <ActionButtons
            onClear={handleClearAllInputs}
            onSubmit={handleSummarize}
            submitButtonText="Summarize"
            isSubmitting={isLoading}
            isDisabled={!currentInputText.trim()}
          />
        </div>

        {/* Result Component */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 h-auto flex flex-col justify-between transition-colors duration-300">
          {/* <ResultDisplay
            resultText={isLoading ? "Generating summary..." : summarizedResult}
          /> */}
          <ResultDisplay
            resultText={
              isLoading
                ? "Generating summary..."
                : typeof summarizedResult === "string"
                  ? summarizedResult
                  : ""
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SummarizerTool;
