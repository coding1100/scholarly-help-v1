import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { FaRegFileAlt, FaFileUpload } from "react-icons/fa";

interface TextSummarizerInputProps {
  onTextChange: (text: string) => void;
  onPdfUpload?: (file: File) => void;
  initialText?: string;
  placeholder?: string;
  title: string;
  onWordLimitExceeded?: (exceeded: boolean) => void;
}

const TextSummarizerInput: React.FC<TextSummarizerInputProps> = ({
  title,
  onTextChange,
  onPdfUpload,
  initialText = "",
  placeholder = "Start typing or paste text here...",
  onWordLimitExceeded,
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputText(initialText);
  }, [initialText]);
  useEffect(() => {
    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

    if (onWordLimitExceeded) {
      const isExceeded = wordCount > 200;
      onWordLimitExceeded(isExceeded);
    }
  }, [inputText, onWordLimitExceeded]);

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    onTextChange(newText);
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const newText = inputText + text;
      setInputText(newText);
      onTextChange(newText);
    } catch (err) {
      alert(
        "Failed to paste text. Please use Ctrl+V or ⌘+V to paste text manually."
      );
      console.error("Clipboard error:", err);
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onPdfUpload?.(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white w-full">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-xl font-normal text-gray-800">{title}</h2>
      </div>

      {/* Textarea */}
      <div className="relative px-4 pb-10 border-b border-t">
        <textarea
          className="w-full h-48 p-3 py-4 rounded-md focus:outline-none  resize-none text-gray-800 placeholder:text-gray-400"
          placeholder={placeholder}
          value={inputText}
          onChange={handleInputChange}
        />

        {/* Buttons shown only when no text is entered */}
        {inputText.trim() === "" && (
          <div className="w-full absolute top-[110px] left-1/2 transform -translate-x-1/2 flex space-x-3 justify-center">
            <button
              onClick={handlePasteText}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 text-gray-800 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <FaRegFileAlt />
              <span>Paste Text</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={handleUploadButtonClick}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 text-gray-800 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <FaFileUpload />
              <span>Upload Document</span>
            </button>
          </div>
        )}

        {/* Word count in bottom right */}
        <div
          className={`absolute bottom-2 right-4 text-sm ${
            wordCount > 200 ? "text-red-500 font-semibold" : "text-gray-500"
          }`}
        >
          Word Count: {wordCount}
        </div>
      </div>
    </div>
  );
};

export default TextSummarizerInput;
