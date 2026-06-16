import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { FaRegFileAlt, FaFileUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface TextSummarizerInputProps {
  onTextChange: (text: string) => void;
  onPdfUpload?: (file: File) => void;
  onFileUpload?: (file: File) => void;
  initialText?: string;
  placeholder?: string;
  title: string;
  onWordLimitExceeded?: (exceeded: boolean) => void;
  maxWords?: number;
  accept?: string;
  uploadButtonText?: string;
  showWordLimit?: boolean;
}

const TextSummarizerInput: React.FC<TextSummarizerInputProps> = ({
  title,
  onTextChange,
  onPdfUpload,
  onFileUpload,
  initialText = "",
  placeholder = "Start typing or paste text here...",
  onWordLimitExceeded,
  maxWords = 200,
  accept = ".pdf",
  uploadButtonText = "Upload Document",
  showWordLimit = true,
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countWords = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  useEffect(() => {
    setInputText(initialText);
  }, [initialText]);
  useEffect(() => {
    const wordCount = countWords(inputText);

    if (onWordLimitExceeded && showWordLimit) {
      const isExceeded = wordCount > maxWords;
      onWordLimitExceeded(isExceeded);
    } else if (onWordLimitExceeded) {
      onWordLimitExceeded(false);
    }
  }, [inputText, maxWords, onWordLimitExceeded, showWordLimit]);

  const wordCount = countWords(inputText);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    onTextChange(newText);
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // Separate pasted content from existing text so words don't run together.
      const newText = inputText ? `${inputText}\n${text}` : text;
      setInputText(newText);
      onTextChange(newText);
    } catch (err) {
      toast.error(
        "Failed to paste text. Please use Ctrl+V or ⌘+V to paste manually.",
      );
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExts = accept
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const fileExt = (file.name.split(".").pop() || "").toLowerCase();
    const allowedByExt =
      allowedExts.length === 0
        ? true
        : allowedExts.some(
            (ext) => ext.replace(".", "").toLowerCase() === fileExt,
          );

    if (!allowedByExt) {
      toast.error(`Please upload one of the following: ${allowedExts.join(", ")}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    onFileUpload?.(file);
    onPdfUpload?.(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white dark:bg-gray-900 w-full transition-colors duration-300">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-xl font-normal text-gray-800 dark:text-gray-100 transition-colors duration-300">
          {title}
        </h2>
      </div>

      {/* Textarea */}
      <div className="relative px-4 pt-5 pb-8 border-b border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 ">
        <textarea
          className="w-full h-48 p-3 py-4 rounded-md focus:outline-none resize-none overflow-hidden scrollbar-hide text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          placeholder={placeholder}
          value={inputText}
          onChange={handleInputChange}
        />

        {/* Buttons shown only when no text is entered */}
        {inputText.trim() === "" && (
          <div className="w-full absolute top-[110px] left-1/2 transform -translate-x-1/2 flex space-x-3 justify-center">
            <button
              onClick={handlePasteText}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 text-gray-800 dark:text-gray-100 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300"
            >
              <FaRegFileAlt />
              <span>Paste Text</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={accept}
              className="hidden"
            />
            <button
              onClick={handleUploadButtonClick}
              className="flex items-center space-x-2 px-2 md:px-4 py-2 text-gray-800 dark:text-gray-100 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300"
            >
              <FaFileUpload />
              <span>{uploadButtonText}</span>
            </button>
          </div>
        )}

        {/* Word count in bottom right */}
        {showWordLimit ? (
          <div
            className={`absolute bottom-2 right-4 text-sm ${
              wordCount > maxWords
                ? "text-[#fb2c36] dark:text-red-400 font-semibold"
                : "text-gray-500 dark:text-gray-400"
            } transition-colors duration-300`}
          >
            Word Count: {wordCount}
          </div>
        ) : (
          <div className="absolute bottom-2 right-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Word Count: {wordCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextSummarizerInput;
