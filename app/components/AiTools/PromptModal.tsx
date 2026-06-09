"use client";

import React, { useState } from "react";
import PopModal from "./PopModal";
import DocumentSettingsModalContent from "./DocumentSettingsModal";
import { TbSettings } from "react-icons/tb";
import { LiaFileAltSolid } from "react-icons/lia";
import { generateEssayOutline } from "./MainTool/academicResearchApi";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWriting: () => void; // New prop to handle the action
  setOutlineResponse?: React.Dispatch<React.SetStateAction<string[]>>;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onStartWriting,
  setOutlineResponse,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState("standard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState("");
  const wordCount = input.trim().split(/\s+/).filter(Boolean).length;
  const progress = Math.min(wordCount * 10, 100);

  let title = "";
  let description = "";
  let progressBarColor = "";

  if (wordCount <= 5) {
    title = "Weak prompt:";
    description = " add more context for higher quality generations";
    progressBarColor = "bg-[#fb2c36]";
  } else if (wordCount <= 10) {
    title = "Average prompt:";
    description = " consider including important keywords";
    progressBarColor = "bg-yellow-400";
  } else {
    title = "Great prompt:";
    description = " Jenni will reference this when generating text";
    progressBarColor = "bg-[#00c951]";
  }

  const handleRadioChange = (value: string) => {
    setSelectedOutline(value);
  };

  // const handleStartWritingButtonClick = async () => {
  //   const headingType =
  //     selectedOutline === "standard"
  //       ? "descriptive"
  //       : selectedOutline === "smart"
  //       ? "descriptive"
  //       : "not_provided";
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/essay-outline`,
  //       {
  //         topic: input,
  //         essay_type: headingType,
  //         essay_level: "post graduate",
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     // Only store sections, not subsections
  //     const sectionsOnly = response.data.data.outline.filter(
  //       (item: any) => item.type === "section"
  //     );
  //     if (!sectionsOnly || sectionsOnly.length === 0) {
  //       console.warn(
  //         "Essay outline response is empty:",
  //         response.data.data.outline
  //       );
  //     }
  //     setOutlineResponse(sectionsOnly);
  //     console.log("response essay outline", outlineResponse);
  //   } catch (error) {
  //     // Silently ignore for now as per request: no extra changes
  //   } finally {
  //     onClose();
  //     onStartWriting();
  //     setIsLoading(false);
  //   }
  // };
  const handleStartWritingButtonClick = async () => {
    const headingType =
      selectedOutline === "none" ? "not_provided" : "descriptive";
    setIsLoading(true);

    try {
      const response = await generateEssayOutline({
        topic: input,
        essay_type: headingType,
        essay_level: "post graduate",
      });

      // Extract the section titles (strings) based on your image structure
      const sectionTitles = (response.outline || []).map(
        (item: any) =>
          typeof item === "string" ? item : item.section || item.title,
      );

      if (!sectionTitles || sectionTitles.length === 0) {
        console.warn("No sections found in the response");
      }

      // Update state only if setOutlineResponse is provided
      setOutlineResponse?.(sectionTitles);

      // Log the local constant to see immediate results
      console.log("Sections captured:", sectionTitles);
    } catch (error) {
      console.error("Error fetching outline:", error);
    } finally {
      onClose();
      onStartWriting();
      setIsLoading(false);
    }
  };
  const handleToggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  // Conditionally render content based on isSettingsOpen
  const renderModalContent = () => {
    if (isSettingsOpen) {
      // Pass a function to go back to the prompt view
      return <DocumentSettingsModalContent onBack={handleToggleSettings} />;
    }

    return (
      <>
        {/* Main Prompt View */}
        <h2 className="text-lg font-medium mb-4 text-[#09090b]">
          What are you writing today?
        </h2>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Jenni research questions..."
          className="w-full h-28 p-3 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] text-gray-900"
        />

        {/* Progress Feedback */}
        <div className="w-full">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${progressBarColor}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            <span className="text-black font-medium">{title}</span>
            {description}
          </p>
        </div>

        {/* Outline Options */}
        <div className="space-y-2 mt-4">
          <div className="text-black text-base font-medium">
            Generate outline
          </div>
          {["standard", "smart", "none"].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-2 p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                selectedOutline === type
                  ? "border-2 border-[#2b7fff]"
                  : "border border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="outline"
                value={type}
                checked={selectedOutline === type}
                onChange={() => handleRadioChange(type)}
                className="text-[#155dfc]"
              />
              <div className="flex items-center gap-2">
                <LiaFileAltSolid className="text-gray-400" size={32} />
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {type === "standard"
                      ? "Standard headings"
                      : type === "smart"
                        ? "Smart headings"
                        : "No headings"}
                  </p>
                  {/* <p className="text-xs text-gray-500">
                    {type === "standard"
                      ? "Add standard headings (Introduction, Methods, Results etc.)"
                      : type === "smart"
                      ? "AI will generate headings based on your document prompt"
                      : "Start with a blank document"}
                  </p> */}
                </div>
              </div>
            </label>
          ))}
        </div>
      </>
    );
  };

  const renderModalFooter = () => (
    <div className="mt-6 flex items-center justify-between">
      <div
        className="flex items-center cursor-pointer gap-2 text-gray-500 text-base hover:bg-gray-200 rounded-md p-2"
        onClick={handleToggleSettings}
      >
        {isSettingsOpen ? <LiaFileAltSolid /> : <TbSettings />}
        <span>{isSettingsOpen ? "Write prompt" : "Additional settings"}</span>
      </div>
      {isLoading ? (
        <button
          className="py-2 px-4 bg-gray-200 text-gray-900 rounded font-medium flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
          disabled
        >
          <svg
            className="animate-spin h-5 w-5 text-[#2b7fff]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Loading...
        </button>
      ) : (
        <button
          className="py-2 px-4 bg-gray-200 text-gray-900 rounded font-medium hover:bg-gray-300"
          onClick={handleStartWritingButtonClick}
        >
          Start Writing
        </button>
      )}
    </div>
  );

  return (
    <PopModal isOpen={isOpen} onClose={onClose}>
      {renderModalContent()}
      {renderModalFooter()}
    </PopModal>
  );
};

export default PromptModal;
