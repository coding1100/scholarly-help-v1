"use client";

import React, { FC, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import TextSummarizerInput from "./TextSummarizerInput";
import ResultDisplay from "./ResultDisplay";
import ActionButtons from "./ActionButtons";
import axios from "axios";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

type ResData = {
  data: {
    client: string;
    error: any;
    llm_used: string;
    original_text: string;
    paraphrased_text: string;
    status: string;
    style: string;
  };
};

interface AIParaphraserProp {
  setFlag: (value: boolean) => void;
}

const AIParaphraser: FC<AIParaphraserProp> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [style, setStyle] = useState("Standard");
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [isPdfProcessed, setIsPdfProcessed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [wordLimitExceeded, setWordLimitExceeded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);
  const [resData, setResData] = useState<ResData>({
    data: {
      client: "",
      error: null,
      llm_used: "",
      original_text: "",
      paraphrased_text: "",
      status: "",
      style: "",
    },
  });
  /* ---------- handlers ---------- */
  const handleClear = () => {
    setInputText("");
    setResultText("");
    // here are change inam
    setPdfData(null);
    setFile(null);
  };

  const processinput = async () => {
    if (!inputText || !inputText.trim()) return;

    if (isPdfProcessed) {
      setIsPdfProcessed(false);
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/paraphrase`,
        {
          text: inputText,
          style: style,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("response: ", response.data);

      setResultText(response.data.paraphrased_text);
      setFlag(true);
    } catch (error: any) {
      setResultText(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-process PDF when selected
  useEffect(() => {
    const processPdf = async () => {
      if (!file) return;
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/parse-document`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = response.data;
        console.log("result: ", result);
        setInputText(result);
      } catch (err: any) {
        setResultText(
          err?.response?.data?.message || "Failed to extract text from PDF.",
        );
      } finally {
        setSubmitting(false);
      }
    };

    processPdf();
  }, [file, token]);
  const handleParaphrase = async () => {
    if (wordLimitExceeded) {
      setResultText("Text exceeds 200-word limit. Please shorten your input.");
      return;
    }
    trackToolGenerate({ toolName: "Paraphraser Tool" });
    await processinput();
  };

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isSubmitting} />
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* ---------- main two‑column layout ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* --- left column : input --- */}

          <div className="border-r dark:border-gray-700">
            <TextSummarizerInput
              title="AI Paraphraser"
              initialText={inputText}
              onTextChange={setInputText}
              onPdfUpload={setFile}
              onWordLimitExceeded={setWordLimitExceeded}
            />

            <div className="px-2 md:px-4 py-4 flex items-center justify-between space-x-3 border-b dark:border-gray-700">
              <label
                htmlFor="style"
                className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                Paraphrase Style:
              </label>
              <div className="relative w-[50%]">
                <select
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="p-1 pr-7 border w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                >
                  <option>Standard</option>
                  <option>Creative</option>
                  <option>Formal</option>
                  <option>Casual</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                  <FaChevronDown className="w-3 h-3" />
                </span>
              </div>
            </div>
            {/* reusable action buttons */}
            <ActionButtons
              submitButtonText="Paraphrase"
              onSubmit={handleParaphrase}
              onClear={handleClear}
              isSubmitting={isSubmitting}
              isDisabled={!inputText.trim() || wordLimitExceeded}
            />
          </div>

          {/* --- right column : result --- */}
          <ResultDisplay
            resultText={resultText}
            title="Result"
            onCopy={(txt) => navigator.clipboard.writeText(txt)}
            loading={isSubmitting}
          />
        </div>
      </div>
      <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Finding it hard to rephrase your ideas effectively? ScholarlyHelp
          offers a powerful AI-driven paraphrasing tool designed to rewrite your
          academic content with clarity, coherence, and originality—helping you
          express your thoughts more clearly and confidently.{" "}
        </q>
      </div>
    </div>
  );
};

export default AIParaphraser;
