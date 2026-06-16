"use client";
import React, { useState, useEffect } from "react";
import EssayOutlinerForm from "./EssayOutlineForm";
import axios from "axios";
import { FaFolderPlus, FaRegCopy, FaRegFileWord } from "react-icons/fa";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

type OutlineItem = {
  section: string;
  subsections: string[];
};
type Folder = {
  _id: string;
  name: string;
};
const ESSAY_OUTLINE_SOURCE_TOOL = "essay-outline";

type OutlineFormData = {
  topic: string;
  essay_level: string;
  essay_type: string;
  body_paragraph_count: number;
};
const EssayOutlinetool = () => {
  const [token, setToken] = useState<string | null>(null);
  const [outlineData, setOutlineData] = useState<OutlineItem[]>([]);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [savedDocumentId, setSavedDocumentId] = useState("");
  const [lastFormData, setLastFormData] = useState<OutlineFormData | null>(null);
  const baseUrl =
    process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

  const handleCopyOutline = async () => {
    if (!outlineData.length) return;
    const text = outlineData
      .map(
        (item) =>
          `${item.section}\n${item.subsections.map((s) => `  - ${s}`).join("\n")}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Outline copied to clipboard!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const outlineToHtml = (items: OutlineItem[]) =>
    items
      .map((item) => {
        const subs = item.subsections
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("");
        return `<h2>${escapeHtml(item.section)}</h2><ul>${subs}</ul>`;
      })
      .join("\n");

  // Persist the CURRENTLY DISPLAYED outline as a document (no regeneration).
  // Returns the saved document id. Reuses an existing saved doc id if present
  // so repeated Save/Word clicks don't create duplicates.
  const persistDisplayedOutline = async (): Promise<string> => {
    if (savedDocumentId) return savedDocumentId;
    const title = `Outline - ${lastFormData?.topic || "Essay"}`;
    const response = await axios.post(
      `${baseUrl}/documents`,
      {
        title,
        content: outlineToHtml(outlineData),
        source_tool: ESSAY_OUTLINE_SOURCE_TOOL,
        ...(selectedFolderId ? { folder_id: selectedFolderId } : {}),
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const id = response.data?.data?._id;
    if (!id) {
      throw new Error("Could not save the outline.");
    }
    setSavedDocumentId(id);
    return id;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${baseUrl}/documents/folders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { source_tool: ESSAY_OUTLINE_SOURCE_TOOL },
      })
      .then((response) => setFolders(response.data?.data || []))
      .catch(() => toast.error("Failed to load folders."));
  }, [baseUrl, token]);

  const createFolder = async () => {
    if (!newFolderName.trim() || !token) return;
    try {
      const response = await axios.post(
        `${baseUrl}/documents/folders`,
        { name: newFolderName.trim(), source_tool: ESSAY_OUTLINE_SOURCE_TOOL },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const folder = response.data?.data;
      if (folder?._id) {
        setFolders((current) => [folder, ...current]);
        setSelectedFolderId(folder._id);
      }
      setNewFolderName("");
      toast.success("Folder created.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create folder.");
    }
  };

  const submitOutlineRequest = async (formData: OutlineFormData) => {
    const { topic, essay_level, essay_type, body_paragraph_count } = formData;
    trackToolGenerate({ toolName: "Essay Outline Tool" });
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${baseUrl}/tools/essay-outline`,
        {
          topic,
          essay_level,
          essay_type,
          body_paragraph_count,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const outline = response.data?.data?.outline;
      if (!Array.isArray(outline) || outline.length === 0) {
        throw new Error("No outline was returned.");
      }
      setOutlineData(outline);
      toast.success("Essay outline generated successfully!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to generate outline. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (formData: OutlineFormData) => {
    setLastFormData(formData);
    setSavedDocumentId("");
    await submitOutlineRequest(formData);
  };

  const handleSaveToFolder = async () => {
    if (!outlineData.length) {
      toast.error("Generate an outline first.");
      return;
    }
    setSubmitting(true);
    try {
      await persistDisplayedOutline();
      toast.success(
        selectedFolderId ? "Outline saved to your folder." : "Outline saved.",
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save the outline.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportWord = async () => {
    if (!outlineData.length) {
      toast.error("Generate an outline first.");
      return;
    }
    try {
      // Save the displayed outline first if it isn't persisted yet, so Word
      // export works straight after generating (no separate Save step needed).
      const documentId = await persistDisplayedOutline();
      const response = await axios.get(
        `${baseUrl}/documents/${documentId}/export?format=docx`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "essay-outline.docx";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Word document downloaded.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to export Word document.");
    }
  };

  return (
    <div className="container relative w-[89%] mx-auto h-[calc(100vh-8vh)] p-4 md:p-8">
      {/* <h1 className="text-2xl md:text-5xl text-center mb-4 font-serif">
        Essay Outliner Generator
      </h1> */}
      <ToolsApiLoader show={isSubmitting} />
      <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {/* Left Column */}
        <EssayOutlinerForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="p-[9px] border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 transition-colors duration-300">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal text-gray-800 dark:text-gray-100">
              Result
            </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyOutline}
                  disabled={!outlineData.length}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 relative transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaRegCopy />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleSaveToFolder}
                  disabled={!outlineData.length || isSubmitting}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 relative transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFolderPlus />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleExportWord}
                  disabled={!outlineData.length || isSubmitting}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 relative transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaRegFileWord />
                  <span>Word</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
                className="rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
          <div className="p-4">
            {!isSubmitting && (
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
