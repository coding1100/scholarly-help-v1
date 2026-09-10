"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiEdit3, FiFileText, FiImage } from "react-icons/fi";
import styles from "../homework-helper.module.css";
import * as api from "../api";
import type { HomeworkSessionDTO } from "../types";

interface HomeScreenProps {
  pasteText: string;
  setPasteText: (v: string) => void;
  onSubmitText: () => void;
  onSubmitImage: (file: File) => void;
  onSubmitDocument: (file: File) => void;
  onOpenMyHomework: () => void;
  onResumeSession: (sessionId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  pasteText,
  setPasteText,
  onSubmitText,
  onSubmitImage,
  onSubmitDocument,
  onOpenMyHomework,
  onResumeSession,
}) => {
  const [pasteOpen, setPasteOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<HomeworkSessionDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listSessions()
      .then((rows) => {
        if (!cancelled) setRecent(rows.slice(0, 5));
      })
      .catch(() => {
        if (!cancelled) setRecent([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1`}>
        Homework Helper
      </div>
      <h1 className={`${styles.serif} text-[28px] font-bold tracking-tight mt-1 mb-1.5`}>
        What are you working on?
      </h1>
      <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed mb-2">
        Bring one question or a whole assignment — any subject.
      </p>
      <p className="text-[12.5px] text-[var(--ink-faint)] italic mb-6">
        Walks through the reasoning with you — the answer&apos;s never the first thing you see.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <button
          type="button"
          className={`${styles.uploadTile} p-5 text-center text-[13.5px]`}
          onClick={() => imageInputRef.current?.click()}
        >
          <FiImage aria-hidden="true" className="mx-auto mb-2 text-xl" />
          Photo or
          <br />
          handwritten notes
        </button>
        <button
          type="button"
          className={`${styles.uploadTile} p-5 text-center text-[13.5px]`}
          onClick={() => documentInputRef.current?.click()}
        >
          <FiFileText aria-hidden="true" className="mx-auto mb-2 text-xl" />
          Upload PDF /<br />
          document
        </button>
        <button
          type="button"
          aria-expanded={pasteOpen}
          aria-controls="hh-paste-box"
          className={`${styles.uploadTile} p-5 text-center text-[13.5px]`}
          onClick={() => setPasteOpen((v) => !v)}
        >
          <FiEdit3 aria-hidden="true" className="mx-auto mb-2 text-xl" />
          Paste or
          <br />
          type
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onSubmitImage(file);
        }}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.rtf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onSubmitDocument(file);
        }}
      />

      {pasteOpen && (
        <div id="hh-paste-box" className="mb-4">
          <label htmlFor="hh-paste-input" className="sr-only">
            Homework question
          </label>
          <textarea
            id="hh-paste-input"
            autoFocus
            className="w-full min-h-[90px] p-3 border border-[var(--pen)] rounded-lg text-sm leading-relaxed bg-[var(--paper-raised)] text-[var(--ink)] resize-y"
            placeholder="Paste or type a homework question — any subject..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="text-[13px] px-3 py-1.5 rounded-md border border-[var(--line)] text-[var(--ink)]"
              onClick={() => setPasteOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="text-[13px] font-semibold px-3 py-1.5 rounded-md bg-[var(--pen-btn)] text-white"
              onClick={onSubmitText}
            >
              Analyze →
            </button>
          </div>
        </div>
      )}

      <div className="mt-9 border-t border-[var(--line-soft)] pt-5">
        <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-3`}>
          My Homework
        </div>
        {recent === null && (
          <div className="text-[13.5px] italic text-[var(--ink-faint)] py-1.5">Loading…</div>
        )}
        {recent && recent.length === 0 && (
          <div className="text-[13.5px] italic text-[var(--ink-faint)] py-1.5">
            Nothing completed yet — finish a question and it&apos;ll show up here.
          </div>
        )}
        {recent && recent.length > 0 && (
          <>
            {recent.map((row) => (
              <button
                key={row.session_id}
                type="button"
                onClick={() => onResumeSession(row.session_id)}
                className="w-full flex justify-between items-center py-2.5 border-b border-[var(--line-soft)] text-[13.5px] text-left"
              >
                <span className="font-medium truncate pr-3">
                  {row.subject} · {row.topic}
                </span>
                <span className={`${styles.mono} text-xs text-[var(--ink-faint)] shrink-0`}>
                  {row.status === "completed" ? "completed ✓" : "in progress"}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenMyHomework}
              className="text-[13px] font-semibold text-[var(--pen)] mt-3"
            >
              View all →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
