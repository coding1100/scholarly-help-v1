"use client";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiMiniPlus } from "react-icons/hi2";
import {
  getAcademicErrorMessage,
  listDocuments,
  type DocumentRecord,
} from "./academicResearchApi";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";

export interface DocumentItem {
  id: string | number;
  _id?: string | number;
  title: string;
  updatedAt?: string | number | Date; // ISO, timestamp, or Date
  updated_at?: string | number | Date;
}

interface DocumentsSidebarProps {
  documents?: DocumentItem[];
  onNew?: () => void;
  onSelect?: (id: DocumentItem["id"]) => void;
  className?: string;
}

const formatRelative = (dateLike: string | number | Date) => {
  const date = new Date(dateLike);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) return `${minutes || 1} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
};

const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
  documents,
  onNew,
  onSelect,
  className,
}) => {
  const [query, setQuery] = useState("");
  const [fetchedDocs, setFetchedDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documents) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      listDocuments(query.trim() || undefined)
        .then(setFetchedDocs)
        .catch((error) => {
          toast.error(
            getAcademicErrorMessage(error, "Could not load documents."),
          );
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [documents, query]);

  const docs = documents || fetchedDocs;

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = documents && q
      ? docs.filter((d) => d.title.toLowerCase().includes(q))
      : docs;
    return list.slice(0, 20);
  }, [docs, documents, query]);

  return (
    <aside
      className={`w-72 bg-white border-r h-full flex flex-col ${
        className || ""
      }`}
    >
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
        <button
          onClick={onNew}
          className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800"
          aria-label="New document"
        >
          <HiMiniPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs..."
          className="w-full h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
        />
      </div>

      <div className="relative flex-1 overflow-auto">
        <ToolsApiLoader show={loading} contained />
        {!loading && filteredDocs.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-500">
            No documents found.
          </div>
        )}
        {filteredDocs.map((doc) => (
          <button
            key={doc.id || doc._id}
            onClick={() => {
              const documentId = doc.id || doc._id;
              if (documentId) onSelect?.(documentId);
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900 truncate">
              {doc.title}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {formatRelative(doc.updatedAt || doc.updated_at || new Date())}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default DocumentsSidebar;
