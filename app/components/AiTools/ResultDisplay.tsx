import React, { useState } from "react";
import { FaRegCopy } from "react-icons/fa";

interface ResultDisplayProps {
  resultText: string;
  title?: string;
  onCopy?: (textToCopy: string) => void;
  loading?: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  resultText,
  title = "Result",
  onCopy,
  loading = false,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  const handleCopyToClipboard = async () => {
    if (onCopy) {
      onCopy(resultText);

      setCopyFeedback("Copied!");
    } else {
      try {
        await navigator.clipboard.writeText(resultText);
        setTimeout(() => setCopyFeedback(""), 1500);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        setCopyFeedback("Failed to copy!");
        setTimeout(() => setCopyFeedback(""), 1500);
      }
    }
  };

  return (
    <div className="bg-white  overflow-hidden ">
      {/* Header */}
      <div className="p-[9px] border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-normal text-gray-800">{title}</h2>
        <button
          onClick={handleCopyToClipboard}
          disabled={!resultText}
          className={`px-4 py-2 border border-gray-300 rounded-md flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 relative ${
            !resultText
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <FaRegCopy />
          <span>Copy</span>
          {/* <span>{copyFeedback === "Copied!" ? "Copied" : "Copy"}</span> */}
          {/* {copyFeedback && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded-md whitespace-nowrap">
              {copyFeedback}
            </span>
          )} */}
        </button>
      </div>

      {/* Result Area */}
      <div className="p-4 h-96">
        <textarea
          readOnly
          className="w-full h-full  text-gray-800 focus:outline-none resize-none"
          value={loading ? "In process..." : resultText}
          placeholder="Result will appear here..."
        ></textarea>
      </div>
    </div>
  );
};

export default ResultDisplay;
