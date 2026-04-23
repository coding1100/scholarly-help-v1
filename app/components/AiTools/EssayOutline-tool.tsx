"use client";
import React, { useState, useEffect } from "react";
import EssayOutlinerForm from "./EssayOutlineForm";
import axios from "axios";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";

type OutlineItem = {
  section: string;
  subsections: string[];
};
const EssayOutlinetool = () => {
  const [token, setToken] = useState<string | null>(null);
  const [outlineData, setOutlineData] = useState<OutlineItem[]>([]);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const handleSubmit = async (formData: {
    topic: string;
    essay_level: string;
    essay_type: string;
  }) => {
    const { topic, essay_level, essay_type } = formData;
    trackToolGenerate({ toolName: "Essay Outline Tool" });
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/essay-outline`,
        {
          topic,
          essay_level,
          essay_type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      // console.log("response essay outline", response.data.data.outline);
      setOutlineData(response.data.data.outline || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container w-[89%] mx-auto h-[90vh] p-4 md:p-8">
      {/* <h1 className="text-2xl md:text-5xl text-center mb-4 font-serif">
        Essay Outliner Generator
      </h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {/* Left Column */}
        <EssayOutlinerForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="p-[9px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
            <h2 className="text-xl font-normal text-gray-800 dark:text-gray-100">
              Result
            </h2>
            <button
              // onClick={handleCopyToClipboard}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 relative transition-colors duration-300"
            >
              <FaRegCopy />
              <span>Copy</span>
            </button>
          </div>
          <div className="max-h-[500px] overflow-auto p-4">
            {isSubmitting ? (
              <p className="text-gray-700 dark:text-gray-200">
                Generating Essay...
              </p>
            ) : (
              <>
                {outlineData.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No outline generated yet.
                  </p>
                ) : (
                  outlineData.map((item, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-lg text-[#1447e6] dark:text-[#51a2ff]">
                        {item.section}
                      </h3>
                      <ul className="list-disc list-inside pl-4 text-gray-700 dark:text-gray-200">
                        {item.subsections.map((sub, subIndex) => (
                          <li key={subIndex}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm font-serif font-medium text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
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

export default EssayOutlinetool;
