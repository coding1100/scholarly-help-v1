"use client";

import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  DICTIONARY_MAX_WORDS,
  type GrammarGoals,
} from "./types";

/**
 * Writing goals (dialect / section / formality) + custom dictionary manager.
 * Goals condition the backend prompt; the dictionary is an ignore-list the
 * checker must never flag. Only settings the backend actually honors are
 * shown — no dead pills.
 */

const GOAL_GROUPS: {
  key: keyof GrammarGoals;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "dialect",
    label: "English dialect",
    options: [
      { value: "us", label: "US" },
      { value: "uk", label: "UK" },
      { value: "ca", label: "Canadian" },
      { value: "au", label: "Australian" },
    ],
  },
  {
    key: "section",
    label: "Section",
    options: [
      { value: "general", label: "General" },
      { value: "literature-review", label: "Literature review" },
      { value: "methodology", label: "Methodology" },
      { value: "discussion", label: "Discussion" },
    ],
  },
  {
    key: "formality",
    label: "Formality",
    options: [
      { value: "informal", label: "Informal" },
      { value: "neutral", label: "Neutral" },
      { value: "formal", label: "Formal" },
    ],
  },
];

const FORMALITY_HINTS: Record<GrammarGoals["formality"], string> = {
  informal: "Informal: casual phrasing is fine; only clarity problems get flagged.",
  neutral: "Neutral: flags slang, allows standard academic phrasing.",
  formal: "Formal: flags contractions, filler words, and casual phrasing.",
};

interface GoalsModalProps {
  open: boolean;
  onClose: () => void;
  goals: GrammarGoals;
  dictionary: string[];
  isSignedIn: boolean;
  onApply: (goals: GrammarGoals, dictionary: string[]) => void;
}

const GoalsModal: React.FC<GoalsModalProps> = ({
  open,
  onClose,
  goals,
  dictionary,
  isSignedIn,
  onApply,
}) => {
  const [draftGoals, setDraftGoals] = useState<GrammarGoals>(goals);
  const [draftWords, setDraftWords] = useState<string[]>(dictionary);
  const [newWord, setNewWord] = useState("");

  // Re-seed drafts each time the modal opens.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setDraftGoals(goals);
    setDraftWords(dictionary);
    setNewWord("");
    setWasOpen(true);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  if (!open) return null;

  const addWord = () => {
    const word = newWord.trim();
    if (!word) return;
    if (draftWords.some((w) => w.toLowerCase() === word.toLowerCase())) {
      toast.error("That word is already in your dictionary.");
      return;
    }
    if (draftWords.length >= DICTIONARY_MAX_WORDS) {
      toast.error(`Dictionary is limited to ${DICTIONARY_MAX_WORDS} words.`);
      return;
    }
    setDraftWords([...draftWords, word]);
    setNewWord("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Set goals
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX />
          </button>
        </div>

        {GOAL_GROUPS.map((group) => (
          <div key={group.key} className="mb-4">
            <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const active = draftGoals[group.key] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setDraftGoals({ ...draftGoals, [group.key]: option.value })
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "border-primary-400 bg-primary-100 font-medium text-primary-400"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {group.key === "formality" && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {FORMALITY_HINTS[draftGoals.formality]}
              </p>
            )}
          </div>
        ))}

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          Custom dictionary{" "}
          <span className="font-normal text-gray-400 dark:text-gray-500">
            — {isSignedIn ? "saved to your account" : "saved on this device"}
          </span>
        </p>
        <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
          {draftWords.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {draftWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                >
                  {word}
                  <button
                    onClick={() => setDraftWords(draftWords.filter((w) => w !== word))}
                    aria-label={`Remove ${word}`}
                    className="text-gray-400 transition-colors hover:text-red-500"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addWord();
              }}
              placeholder="Add a word..."
              maxLength={50}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
            <button
              onClick={addWord}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={() => onApply(draftGoals, draftWords)}
          className="mt-4 w-full rounded-lg bg-primary-400 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-300"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default GoalsModal;
