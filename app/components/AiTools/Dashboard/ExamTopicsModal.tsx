"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiLoader, FiX } from "react-icons/fi";
import { fetchStudyExamTopics } from "@/app/utils/studyApiClient";

function mergeTopics(...lists: (string[] | Iterable<string>)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list) {
      const topic = String(raw).trim();
      if (!topic) continue;
      const key = topic.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(topic);
    }
  }
  return out;
}

export default function ExamTopicsModal({
  sessionId,
  initialSelected,
  onClose,
  onConfirm,
}: {
  sessionId: string;
  initialSelected: string[];
  onClose: () => void;
  onConfirm: (topics: string[]) => void;
}) {
  const [candidates, setCandidates] = useState<string[]>(() =>
    mergeTopics(initialSelected),
  );
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(mergeTopics(initialSelected)),
  );
  const [customTopic, setCustomTopic] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const merged = mergeTopics(initialSelected);
    setSelected(new Set(merged));
    setCandidates((prev) => mergeTopics(prev, merged));
  }, [initialSelected]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchStudyExamTopics(sessionId)
      .then((data) => {
        if (!active) return;
        setCandidates((prev) => mergeTopics(prev, data.topics || [], initialSelected));
      })
      .catch(() => {
        if (!active) return;
        setCandidates((prev) => mergeTopics(prev, initialSelected));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId, initialSelected]);

  const selectedList = useMemo(() => Array.from(selected), [selected]);

  const toggle = (topic: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const removeSelected = (topic: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(topic);
      return next;
    });
  };

  const addCustom = useCallback(() => {
    const topic = customTopic.trim();
    if (!topic) return;
    setCandidates((prev) => mergeTopics(prev, [topic]));
    setSelected((prev) => new Set(prev).add(topic));
    setCustomTopic("");
  }, [customTopic]);

  const handleApply = () => {
    onConfirm(mergeTopics(selectedList));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#11132a]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-topics-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#e4e6ff] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="exam-topics-title" className="text-lg font-semibold text-[#1c2142]">
              What&apos;s on your exam?
            </h2>
            <p className="mt-1 text-sm text-[#6f7497]">
              Pick topics so notes and quizzes focus on what matters for your test.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6f76a8] hover:bg-[#f0f2ff]"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
      </div>

        {selectedList.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b73ab]">
              Selected ({selectedList.length})
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedList.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 rounded-full border border-[#5f70ff] bg-[#eef1ff] px-2.5 py-1 text-xs font-medium text-[#353b89]"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeSelected(topic)}
                    className="rounded-full p-0.5 text-[#5f70ff] hover:bg-[#dce2ff]"
                    aria-label={`Remove ${topic}`}
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#6f74a0]">
            <FiLoader className="h-5 w-5 animate-spin text-[#5f70ff]" />
            Loading topics from your source…
          </div>
        ) : (
          <div className="mt-4 max-h-[200px] space-y-2 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="text-sm text-[#7a7fa8]">
                No headings detected in your source. Add custom topics below, then click
                Apply topics.
              </p>
            ) : (
              candidates.map((topic) => (
                <label
                  key={topic}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                    selected.has(topic)
                      ? "border-[#5f70ff] bg-[#f3f5ff] text-[#353b89]"
                      : "border-[#e8e9f6] text-[#4f5373]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(topic)}
                    onChange={() => toggle(topic)}
                    className="mt-0.5"
                  />
                  <span>{topic}</span>
                </label>
              ))
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add custom topic (e.g. Biology exam)"
            className="flex-1 rounded-lg border border-[#d6d9f8] px-3 py-2 text-sm outline-none focus:border-[#6572ff]"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customTopic.trim()}
            className="rounded-lg border border-[#ccd2ff] px-3 py-2 text-sm font-semibold text-[#5f70ff] disabled:opacity-40"
          >
            Add
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6f74a0]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#5f70ff] px-4 py-2 text-sm font-semibold text-white"
          >
            Apply topics
          </button>
        </div>
      </div>
    </div>
  );
}
