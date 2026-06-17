"use client";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import ActionButtons from "./ActionButtons";

interface EssayOutlinerFormProps {
  isSubmitting: boolean;
  onSubmit: (data: {
    topic: string;
    essay_level: string;
    essay_type: string;
    body_paragraph_count: number;
  }) => void;
}

const EssayOutlinerForm: React.FC<EssayOutlinerFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [essayTitle, setEssayTitle] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("high school");
  const [essayType, setEssayType] = useState("argumentative");
  const [bodyParagraphCount, setBodyParagraphCount] = useState(3);

  const handleClearInputs = () => {
    setEssayTitle("");
    setSchoolLevel("high school");
    setEssayType("argumentative");
    setBodyParagraphCount(3);
  };

  const handleGenerate = () => {
    // Guarantee a valid integer in [1, 10] regardless of the input's blur state.
    const safeCount = Math.min(
      10,
      Math.max(1, Math.round(Number(bodyParagraphCount) || 3)),
    );
    const formData = {
      topic: essayTitle,
      essay_level: schoolLevel,
      essay_type: essayType,
      body_paragraph_count: safeCount,
    };
    onSubmit(formData);
  };

  return (
    <div className="h-full border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
      <h2 className="bg-white dark:bg-gray-800 text-lg font-semibold text-gray-800 dark:text-gray-100 py-4 px-4 mb-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        Essay Outliner
      </h2>
      <div className="flex-1 overflow-y-auto min-h-0 border-gray-200 dark:border-gray-700 px-2 md:px-8 py-2">
        {/* Essay Title */}
        <div className="mb-4">
          <label
            htmlFor="essayTitle"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Essay title:
          </label>
          <input
            type="text"
            id="essayTitle"
            value={essayTitle}
            onChange={(e) => setEssayTitle(e.target.value)}
            placeholder="ex: Rock Music Superiority"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
          />
        </div>

        {/* School Level Dropdown */}
        <div className="mb-4 relative">
          <select
            id="schoolLevel"
            value={schoolLevel}
            onChange={(e) => setSchoolLevel(e.target.value)}
            className="w-full p-2 pr-8 text-black dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 transition-colors duration-300 appearance-none"
          >
            <option value="high school">High School</option>
            <option value="college">College</option>
            <option value="post graduate">Post Graduate</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300">
            <FaChevronDown className="w-3 h-3" />
          </span>
        </div>

        {/* Essay Type Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="essayType"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Essay type:
          </label>
          <div className="relative">
            <select
              id="essayType"
              value={essayType}
              onChange={(e) => setEssayType(e.target.value)}
              className="w-full text-black dark:text-gray-100 p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 transition-colors duration-300 appearance-none"
            >
              <option value="application">Application</option>
              <option value="scholarship">Scholarship</option>
              <option value="descriptive">Descriptive</option>
              <option value="narrative">Narrative</option>
              <option value="argumentative">Argumentative</option>
              <option value="analytical">Analytical</option>
              <option value="persuasive">Persuasive</option>
              <option value="expository">Expository</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300">
              <FaChevronDown className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="bodyParagraphCount"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Body paragraphs:
          </label>
          <input
            type="number"
            id="bodyParagraphCount"
            min={1}
            max={10}
            value={bodyParagraphCount}
            onChange={(e) => setBodyParagraphCount(Number(e.target.value))}
            onBlur={(e) =>
              setBodyParagraphCount(
                Math.min(10, Math.max(1, Number(e.target.value) || 3)),
              )
            }
            className="w-full text-black dark:text-gray-100 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 transition-colors duration-300"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 mt-auto bg-white dark:bg-gray-900 transition-colors duration-300">
        <ActionButtons
          onClear={handleClearInputs}
          onSubmit={handleGenerate}
          submitButtonText="Generate Essay Outline"
          isSubmitting={isSubmitting}
          isDisabled={!essayTitle.trim()}
        />
      </div>
    </div>
  );
};

export default EssayOutlinerForm;
