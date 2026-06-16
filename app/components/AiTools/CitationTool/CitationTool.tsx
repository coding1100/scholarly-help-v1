"use client";

import React, { FC, useEffect, useState } from "react";
import { FaChevronDown, FaRegCopy } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

interface CitationToolProps {
  setFlag: (value: boolean) => void;
}

interface CitationResponse {
  status: string;
  citation_style: "APA" | "MLA" | "Chicago" | "Harvard";
  source_type: "book" | "website" | "journal" | "article";
  full_citation: string;
  in_text_citation: string | null;
  raw_output: string;
  llm_used: string;
  tokens_used: number;
}

const CitationTool: FC<CitationToolProps> = ({ setFlag }) => {
  const [token, setToken] = useState<string | null>(null);
  const [citationStyle, setCitationStyle] = useState<
    "APA" | "MLA" | "Chicago" | "Harvard"
  >("APA");
  const [sourceType, setSourceType] = useState<
    "book" | "website" | "journal" | "article"
  >("book");
  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [publisher, setPublisher] = useState<string>("");
  const [publicationName, setPublicationName] = useState<string>("");
  const [journalName, setJournalName] = useState<string>("");
  const [websiteName, setWebsiteName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [issue, setIssue] = useState<string>("");
  const [pages, setPages] = useState<string>("");
  const [doi, setDoi] = useState<string>("");
  const [accessDate, setAccessDate] = useState<string>("");
  const [includeInText, setIncludeInText] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<CitationResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  const handleClear = () => {
    setCitationStyle("APA");
    setSourceType("book");
    setAuthor("");
    setTitle("");
    setPublisher("");
    setPublicationName("");
    setJournalName("");
    setWebsiteName("");
    setUrl("");
    setYear("");
    setCity("");
    setVolume("");
    setIssue("");
    setPages("");
    setDoi("");
    setAccessDate("");
    setIncludeInText(true);
    setResult(null);
    setError("");
  };

  const handleGenerate = async () => {
    // Validation: At least title or author is required
    if (!title.trim() && !author.trim()) {
      setError("At least title or author is required.");
      toast.error("At least title or author is required.");
      return;
    }

    trackToolGenerate({ toolName: "Citation Tool" });
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const payload: {
        citation_style: "APA" | "MLA" | "Chicago" | "Harvard";
        source_type: "book" | "website" | "journal" | "article";
        author?: string;
        title?: string;
        publisher?: string;
        publication_name?: string;
        journal_name?: string;
        website_name?: string;
        url?: string;
        year?: number;
        city?: string;
        volume?: string;
        issue?: string;
        pages?: string;
        doi?: string;
        access_date?: string;
        include_in_text?: boolean;
      } = {
        citation_style: citationStyle,
        source_type: sourceType,
        include_in_text: includeInText,
      };

      if (author.trim()) payload.author = author.trim();
      if (title.trim()) payload.title = title.trim();
      if (publisher.trim()) payload.publisher = publisher.trim();
      if (publicationName.trim())
        payload.publication_name = publicationName.trim();
      if (journalName.trim()) payload.journal_name = journalName.trim();
      if (websiteName.trim()) payload.website_name = websiteName.trim();
      if (url.trim()) payload.url = url.trim();
      if (year.trim()) {
        const yearNum = parseInt(year.trim());
        if (!isNaN(yearNum)) payload.year = yearNum;
      }
      if (city.trim()) payload.city = city.trim();
      if (volume.trim()) payload.volume = volume.trim();
      if (issue.trim()) payload.issue = issue.trim();
      if (pages.trim()) payload.pages = pages.trim();
      if (doi.trim()) payload.doi = doi.trim();
      if (accessDate.trim()) payload.access_date = accessDate.trim();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_NGROX_URL}/tools/citation-generator`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Response:", response.data);

      // Backend wraps responses as { success, message, data }
      const responsePayload = response.data?.data ?? response.data;

      if (responsePayload.status === "success") {
        setResult(responsePayload);
        setFlag(true);
        toast.success("Citation generated successfully!");
      } else {
        setError("Failed to generate citation. Please try again.");
        toast.error("Failed to generate citation.");
      }
    } catch (error: any) {
      console.error("Error generating citation:", error);
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.message)
          ? error.response.data.message.join(", ")
          : error?.message) ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy.");
    }
  };

  return (
    <div className="container relative overflow-y-auto h-[calc(100vh-8vh)] mx-auto max-w-[840px] px-4 md:px-8 md:pt-8 2xl:max-w-6xl">
      <ToolsApiLoader show={isSubmitting} />
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Main Overview Section */}
        <div className="pt-6 ">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300 text-center">
            Citation Generator Tool
          </h2>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="space-y-4">
            {/* Style and Source Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Citation Style */}
              <div>
                <label
                  htmlFor="citation_style"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Citation Style: <span className="text-[#fb2c36]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="citation_style"
                    value={citationStyle}
                    onChange={(e) =>
                      setCitationStyle(
                        e.target.value as "APA" | "MLA" | "Chicago" | "Harvard",
                      )
                    }
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="APA">APA</option>
                    <option value="MLA">MLA</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Harvard">Harvard</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Source Type */}
              <div>
                <label
                  htmlFor="source_type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Source Type: <span className="text-[#fb2c36]">*</span>
                </label>
                <div className="relative">
                  <select
                    id="source_type"
                    value={sourceType}
                    onChange={(e) =>
                      setSourceType(
                        e.target.value as
                          | "book"
                          | "website"
                          | "journal"
                          | "article",
                      )
                    }
                    className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] dark:focus:ring-[#51a2ff] hover:cursor-pointer transition-colors duration-300 appearance-none"
                  >
                    <option value="book">Book</option>
                    <option value="website">Website</option>
                    <option value="journal">Journal</option>
                    <option value="article">Article</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 dark:text-gray-300">
                    <FaChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author */}
              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Author:
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Smith, J. A., & Johnson, M. B."
                  className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                >
                  Title: <span className="text-[#fb2c36]">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                />
              </div>
            </div>

            {/* Note */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors duration-300">
              Note: At least title or author is required.
            </p>

            {/* Conditional Fields Based on Source Type */}
            {sourceType === "book" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="publisher"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Publisher:
                    </label>
                    <input
                      id="publisher"
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g., Academic Press"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      City:
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., New York"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="pages_book"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    Pages:
                  </label>
                  <input
                    id="pages_book"
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="e.g., 45-67"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
              </>
            )}

            {sourceType === "journal" && (
              <>
                <div>
                  <label
                    htmlFor="journal_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    Journal Name:
                  </label>
                  <input
                    id="journal_name"
                    type="text"
                    value={journalName}
                    onChange={(e) => setJournalName(e.target.value)}
                    placeholder="e.g., Journal of Digital Psychology"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="volume"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Volume:
                    </label>
                    <input
                      id="volume"
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="e.g., 15"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="issue"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Issue:
                    </label>
                    <input
                      id="issue"
                      type="text"
                      value={issue}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pages_journal"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Pages:
                    </label>
                    <input
                      id="pages_journal"
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="e.g., 123-145"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="doi"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    DOI:
                  </label>
                  <input
                    id="doi"
                    type="text"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="e.g., 10.1234/jdp.2023.15.3.123"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
              </>
            )}

            {sourceType === "website" && (
              <>
                <div>
                  <label
                    htmlFor="website_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    Website Name:
                  </label>
                  <input
                    id="website_name"
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g., NIH Health Information"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="url"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      URL:
                    </label>
                    <input
                      id="url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="access_date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                    >
                      Access Date:
                    </label>
                    <input
                      id="access_date"
                      type="date"
                      value={accessDate}
                      onChange={(e) => setAccessDate(e.target.value)}
                      className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    />
                  </div>
                </div>
              </>
            )}

            {sourceType === "article" && (
              <>
                <div>
                  <label
                    htmlFor="publication_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    Publication Name:
                  </label>
                  <input
                    id="publication_name"
                    type="text"
                    value={publicationName}
                    onChange={(e) => setPublicationName(e.target.value)}
                    placeholder="e.g., Environmental Science Today"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="url_article"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                  >
                    URL:
                  </label>
                  <input
                    id="url_article"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div>
              <label
                htmlFor="year"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
              >
                Year:
              </label>
              <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2023"
                min="1000"
                max="9999"
                className="w-full p-3 rounded-md focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
              />
            </div>

            {/* Include In-Text Citation */}
            <div className="flex items-center gap-2">
              <input
                id="include_in_text"
                type="checkbox"
                checked={includeInText}
                onChange={(e) => setIncludeInText(e.target.checked)}
                className="w-4 h-4 text-[#155dfc] border-gray-300 rounded focus:ring-[#2b7fff] dark:focus:ring-[#155dfc] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="include_in_text"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
              >
                Include in-text citation
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={isSubmitting || (!title.trim() && !author.trim())}
                className={`px-6 py-2.5 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 ${
                  isSubmitting || (!title.trim() && !author.trim())
                    ? "bg-[#565add] dark:bg-[#565add] cursor-not-allowed"
                    : "bg-[#565add] hover:bg-[#656aff] dark:bg-[#565add] dark:hover:bg-[#565add]"
                }`}
              >
                {isSubmitting ? "Generating..." : "Generate Citation"}
              </button>

              <button
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b7fff] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="p-6 space-y-4">
            {/* Full Citation */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                  Full Citation ({result.citation_style} - {result.source_type}
                  ):
                </h3>
                <button
                  onClick={() => handleCopy(result.full_citation)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                  title="Copy citation"
                >
                  <FaRegCopy />
                  Copy
                </button>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap transition-colors duration-300">
                  {result.full_citation}
                </p>
              </div>
            </div>

            {/* In-Text Citation */}
            {result.in_text_citation && (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    In-Text Citation:
                  </h3>
                  <button
                    onClick={() => handleCopy(result.in_text_citation!)}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7fff] transition-colors duration-300"
                    title="Copy in-text citation"
                  >
                    <FaRegCopy />
                    Copy
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                  <p className="text-gray-800 dark:text-gray-100 transition-colors duration-300">
                    {result.in_text_citation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Quote */}
      <div className="text-sm font-serif text-center pt-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <q>
          Create perfect academic citations effortlessly with ScholarlyHelp&apos;s
          Citation Generator. Generate properly formatted citations in APA, MLA,
          Chicago, or Harvard style for books, websites, journals, and
          articles—all with in-text citation support.
        </q>
      </div>
    </div>
  );
};

export default CitationTool;
