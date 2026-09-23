"use client";

import { FC, useState } from "react";
import { FiX } from "react-icons/fi";
import type { TutorTab } from "./IntentPicker";

const TAB_LABELS: Record<TutorTab, string> = {
  research: "Research",
  assignment: "Assignment",
  quiz: "Quiz",
};

interface SaveModalProps {
  open: boolean;
  onClose: () => void;
  activeTab: TutorTab;
  activeTabHasContent: boolean;
  onSaveActiveTab: () => Promise<void>;
  onSaveAllSession: (projectLabel: string) => Promise<void>;
  defaultProjectLabel?: string;
}

const SaveModal: FC<SaveModalProps> = ({
  open,
  onClose,
  activeTab,
  activeTabHasContent,
  onSaveActiveTab,
  onSaveAllSession,
  defaultProjectLabel,
}) => {
  const [mode, setMode] = useState<"choose" | "all">("choose");
  const [projectLabel, setProjectLabel] = useState(defaultProjectLabel || "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const close = () => {
    if (saving) return;
    setMode("choose");
    onClose();
  };

  const handleSaveActiveTab = async () => {
    setSaving(true);
    try {
      await onSaveActiveTab();
      close();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await onSaveAllSession(projectLabel.trim() || "Study session");
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            {mode === "choose" ? "Save Progress" : "Save all session assets"}
          </h3>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {mode === "choose" ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSaveActiveTab}
              disabled={saving || !activeTabHasContent}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-left text-sm transition-colors hover:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="font-semibold text-gray-800">
                Save Active Tab Only ({TAB_LABELS[activeTab]})
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Saves just your current working state to its folder.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("all")}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-left text-sm transition-colors hover:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <p className="font-semibold text-gray-800">Save All Session Assets</p>
              <p className="mt-0.5 text-xs text-gray-500">
                Splits and routes everything you've generated this session into its
                folder, under one project label.
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Project label
              </label>
              <input
                value={projectLabel}
                onChange={(e) => setProjectLabel(e.target.value)}
                placeholder="e.g. Bio Ch. 4"
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-800 outline-none transition-colors duration-300 focus:border-primary-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("choose")}
                disabled={saving}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary-400 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save All"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveModal;
