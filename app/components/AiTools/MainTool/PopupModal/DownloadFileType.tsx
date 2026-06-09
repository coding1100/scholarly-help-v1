"use client";

import React, { useContext, useState } from "react";
import { SiLatex } from "react-icons/si";
import { HiOutlineLockClosed } from "react-icons/hi";
import toast from "react-hot-toast";
import { EditorContext, TitleContext } from "../MainToolLayout";
import {
  buildDocxBlob,
  buildFullLaTeXDocument,
  downloadBlob,
  htmlToLaTeX,
  sanitizeFilename,
  savePdfFromHtml,
} from "../academicDocumentExport";

type DownloadFileTypeProps = {
  documentId?: string | null;
};

const DownloadFileType: React.FC<DownloadFileTypeProps> = () => {
  const { editor } = useContext(EditorContext);
  const { title } = useContext(TitleContext);
  const [exporting, setExporting] = useState(false);

  const baseName = sanitizeFilename(title || "document");

  const handleDownloadLaTeX = async () => {
    if (!editor) {
      toast.error("Open a document in the editor before exporting.");
      return;
    }
    setExporting(true);
    try {
      const html = editor.getHTML();
      const body = htmlToLaTeX(html);
      const full = buildFullLaTeXDocument(body, title || "Untitled");
      downloadBlob(
        new Blob([full], { type: "text/plain;charset=utf-8" }),
        `${baseName}.tex`,
      );
      toast.success("LaTeX file downloaded.", { id: "export-latex-ok" });
    } catch (e) {
      console.error(e);
      toast.error("Could not build LaTeX export.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!editor) {
      toast.error("Open a document in the editor before exporting.");
      return;
    }
    setExporting(true);
    try {
      const blob = await buildDocxBlob(editor.getHTML(), title || "Document");
      downloadBlob(blob, `${baseName}.docx`);
      toast.success("Word file downloaded.", { id: "export-docx-ok" });
    } catch (e) {
      console.error(e);
      toast.error("Could not build Word export.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!editor) {
      toast.error("Open a document in the editor before exporting.");
      return;
    }
    setExporting(true);
    try {
      await savePdfFromHtml(editor.getHTML(), baseName);
      toast.success("PDF downloaded.", { id: "export-pdf-ok" });
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not build PDF. If this keeps happening, try LaTeX or Word export.",
        { duration: 5000 },
      );
    } finally {
      setExporting(false);
    }
  };

  const disabled = exporting;

  return (
    <div className="w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-[9999] relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => void handleDownloadLaTeX()}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
      >
        <SiLatex className="text-gray-800 shrink-0" />
        <span>LaTeX (.tex)</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void handleDownloadWord()}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
      >
        <span>Word (.docx)</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => void handleDownloadPdf()}
        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <span>PDF (.pdf)</span>
      </button>
      <div
        aria-disabled
        className="w-full px-3 py-2 text-left text-sm text-gray-400 flex items-center gap-2 cursor-not-allowed"
      >
        <HiOutlineLockClosed />
        <span>Copy to clipboard</span>
      </div>
    </div>
  );
};

export default DownloadFileType;
