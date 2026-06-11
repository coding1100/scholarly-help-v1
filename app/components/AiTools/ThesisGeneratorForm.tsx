"use client";

import React from "react";

interface ThesisGeneratorFormProps {
  formData: {
    topic: string;
    mainIdea: string;
    supportingReason: string;
    audience: string;
  };
  setFormData: (data: ThesisGeneratorFormProps["formData"]) => void;
}

const ThesisGeneratorForm: React.FC<ThesisGeneratorFormProps> = ({
  formData,
  setFormData,
}) => {
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <h2 className="bg-white dark:bg-gray-800 text-lg font-semibold text-gray-800 dark:text-gray-100 py-4 px-4 mb-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        AI Thesis Statement Generator
      </h2>

      <div className="px-2 md:px-8 pb-4 flex-grow">
        {/* Thesis Topic */}
        <div className="mb-4">
          <label
            htmlFor="topic"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Thesis topic:
          </label>
          <input
            id="topic"
            type="text"
            placeholder="ex: Impact of consuming junk food"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            value={formData.topic}
            onChange={(e) => handleChange("topic", e.target.value)}
          />
        </div>

        {/* Main Idea */}
        <div className="mb-4">
          <label
            htmlFor="mainIdea"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Main idea about topic (optional):
          </label>
          <input
            id="mainIdea"
            type="text"
            placeholder="ex: Junk food is bad for the body"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            value={formData.mainIdea}
            onChange={(e) => handleChange("mainIdea", e.target.value)}
          />
        </div>

        {/* Supporting Reason */}
        <div className="mb-4">
          <label
            htmlFor="supportingReason"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Reason supporting main idea (optional):
          </label>
          <input
            id="supportingReason"
            type="text"
            placeholder="ex: Junk food creates health issues"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            value={formData.supportingReason}
            onChange={(e) => handleChange("supportingReason", e.target.value)}
          />
        </div>

        {/* Audience */}
        <div className="mb-4">
          <label
            htmlFor="audience"
            className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block transition-colors duration-300"
          >
            Intended audience (optional):
          </label>
          <input
            id="audience"
            type="text"
            placeholder="ex: College students"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            value={formData.audience}
            onChange={(e) => handleChange("audience", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ThesisGeneratorForm;
