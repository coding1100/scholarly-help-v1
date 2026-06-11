import React, { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import toast from "react-hot-toast";

interface ResultDisplayProps {
  resultText: string;
  title?: string;
  onCopy?: (textToCopy: string) => void;
  loading?: boolean;
  customBody?: React.ReactNode;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  resultText,
  title = "Result",
  onCopy,
  loading = false,
  customBody,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  const handleCopyToClipboard = async () => {
    if (onCopy) {
      onCopy(resultText);
      setCopyFeedback("Copied!");
    } else {
      try {
        await navigator.clipboard.writeText(resultText);
        toast.success("Copied to clipboard!");
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 1500);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy.");
        setCopyFeedback("Failed to copy!");
        setTimeout(() => setCopyFeedback(""), 1500);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-[9px] border-b border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors duration-300">
        <h2 className="text-xl font-normal text-gray-800 dark:text-gray-100 transition-colors duration-300">
          {title}
        </h2>
        <button
          onClick={handleCopyToClipboard}
          disabled={!resultText}
          className={`px-4 py-2 border rounded-md flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 relative transition-colors duration-300 ${
            !resultText
              ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <FaRegCopy />
          <span>Copy</span>
          {/* <span>{copyFeedback === "Copied!" ? "Copied" : "Copy"}</span> */}
          {/* {copyFeedback && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#00c951] text-white text-xs rounded-md whitespace-nowrap">
              {copyFeedback}
            </span>
          )} */}
        </button>
      </div>

      {/* Result Area */}
      <div className="p-4 min-h-48">
        {customBody ? (
          <div className="w-full h-full">{customBody}</div>
        ) : (
          <textarea
            readOnly
            className="w-full min-h-48 text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none resize-none transition-colors duration-300"
            value={loading ? "In process..." : resultText}
            placeholder="Result will appear here..."
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
