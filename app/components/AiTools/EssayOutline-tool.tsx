"use client";
import React, { useState, useEffect, useMemo } from "react";
import EssayOutlinerForm from "./EssayOutlineForm";
import axios from "axios";
import {
  FaDownload,
  FaFolderOpen,
  FaFolderPlus,
  FaRegCopy,
  FaRegFileWord,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";

type OutlineItem = {
  section: string;
  subsections: string[];
};
type Folder = {
  _id: string;
  name: string;
};
type SavedDocument = {
  _id: string;
  title: string;
  folder_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState("");
  const [lastFormData, setLastFormData] = useState<OutlineFormData | null>(null);
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [isFetchingDocuments, setIsFetchingDocuments] = useState(false);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();
  const baseUrl =
    process.env.NEXT_PUBLIC_NGROX_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

  const selectedFolder = useMemo(
    () => folders.find((f) => f._id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  );

  const folderDocuments = useMemo(
    () => documents.filter((d) => d.folder_id === selectedFolderId),
    [documents, selectedFolderId],
  );

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

  const persistDisplayedOutline = async (): Promise<string> => {
    if (savedDocumentId) return savedDocumentId;
    const title = `Outline - ${lastFormData?.topic || "Essay"}`;
    const response = await axios.post(
      `${baseUrl}/documents`,
      {
        title,
        content: outlineToHtml(outlineData),
        source_tool: ESSAY_OUTLINE_SOURCE_TOOL,
        folder_id: selectedFolderId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const id = response.data?.data?._id;
    if (!id) throw new Error("Could not save the outline.");
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

  // Reset saved doc id when the user switches folder so re-saving goes to the new folder
  useEffect(() => {
    setSavedDocumentId("");
  }, [selectedFolderId]);

  // Fetch documents whenever the selected folder changes (and a folder is chosen)
  useEffect(() => {
    if (selectedFolderId && token) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolderId, token]);

  const fetchDocuments = async () => {
    if (!token) return;
    setIsFetchingDocuments(true);
    try {
      const response = await axios.get(`${baseUrl}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { source_tool: ESSAY_OUTLINE_SOURCE_TOOL },
      });
      setDocuments(response.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load saved documents.");
    } finally {
      setIsFetchingDocuments(false);
    }
  };

  const downloadDocument = async (documentId: string, fileName = "essay-outline.docx") => {
    try {
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
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to download document.");
    }
  };

  const downloadFolder = async () => {
    if (!folderDocuments.length) {
      toast.error("No outlines in this folder to download.");
      return;
    }
    const folderName = selectedFolder?.name || "folder";
    toast.success(`Downloading ${folderDocuments.length} outline(s)…`);
    for (const doc of folderDocuments) {
      const safeName = `${(doc.title || "outline").replace(/[^a-z0-9_\-\s]/gi, "_")}.docx`;
      await downloadDocument(doc._id, safeName);
    }
  };

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
      setShowCreateFolder(false);
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
        { topic, essay_level, essay_type, body_paragraph_count },
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
    // Guests get a small number of free AI actions across all tools; the gate
    // opens instead of calling the AI once the allowance is used up.
    guardAiClick(async () => {
      await submitOutlineRequest(formData);
    });
  };

  const handleSaveToFolder = async () => {
    if (!outlineData.length) {
      toast.error("Generate an outline first.");
      return;
    }
    if (!selectedFolderId) {
      toast.error("Please select or create a folder first.");
      return;
    }
    setSubmitting(true);
    try {
      await persistDisplayedOutline();
      toast.success(`Outline saved to "${selectedFolder?.name}".`);
      await fetchDocuments();
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
    <div className="w-[89%] mx-auto h-[calc(100vh-8vh)] p-4 md:p-8 flex flex-col overflow-hidden">
      <ToolsApiLoader show={isSubmitting} />
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 transition-colors duration-300 overflow-hidden">
        {/* Left Column */}
        <EssayOutlinerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        {/* Right Column */}
        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-colors duration-300 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-[9px] border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 transition-colors duration-300">

            {/* Top row: title + action buttons */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-normal text-gray-800 dark:text-gray-100">
                Result
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyOutline}
                  disabled={!outlineData.length}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaRegCopy />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleSaveToFolder}
                  disabled={!outlineData.length || isSubmitting}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFolderPlus />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleExportWord}
                  disabled={!outlineData.length || isSubmitting}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2b7fff] focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaRegFileWord />
                  <span>Word</span>
                </button>
              </div>
            </div>

            {/* Folder selector row */}
            <div className="flex gap-2 items-center">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                <option value="">Select a folder</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCreateFolder((v) => !v)}
                title={showCreateFolder ? "Cancel" : "New folder"}
                className="shrink-0 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-1.5 transition-colors"
              >
                {showCreateFolder ? <FaTimes className="h-3 w-3" /> : <FaFolderPlus className="h-3.5 w-3.5" />}
                <span>{showCreateFolder ? "Cancel" : "New folder"}</span>
              </button>
            </div>

            {/* Create folder inline form */}
            {showCreateFolder && (
              <div className="flex gap-2">
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  placeholder="Folder name"
                  autoFocus
                  className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-600 p-2 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2b7fff]"
                />
                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="shrink-0 px-4 py-2 bg-[#2b7fff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            )}

            {/* Folder document panel — only shown when a folder is selected */}
            {selectedFolderId && selectedFolder && (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Folder header */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <FaFolderOpen className="text-[#2b7fff]" />
                    {selectedFolder.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchDocuments}
                      disabled={isFetchingDocuments}
                      title="Refresh"
                      className="rounded-md border border-gray-300 dark:border-gray-600 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <FaSyncAlt className={`h-3 w-3 ${isFetchingDocuments ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={downloadFolder}
                      title="Download all outlines in this folder"
                      className="rounded-md border border-gray-300 dark:border-gray-600 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaDownload className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Document list */}
                <div className="max-h-44 overflow-y-auto scrollbar-hide">
                  {isFetchingDocuments ? (
                    <p className="p-3 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
                  ) : folderDocuments.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                      No saved outlines in this folder yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {folderDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {doc.title || "Untitled outline"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.updatedAt
                                ? new Date(doc.updatedAt).toLocaleString()
                                : "Saved outline"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              downloadDocument(
                                doc._id,
                                `${(doc.title || "outline").replace(/[^a-z0-9_\-\s]/gi, "_")}.docx`,
                              )
                            }
                            title="Download DOCX"
                            className="shrink-0 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FaDownload className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Outline content — scrolls independently */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4">
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
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};

export default EssayOutlinetool;
