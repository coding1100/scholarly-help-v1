"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "../homework-helper.module.css";
import type { HomeworkSessionDTO } from "../types";

interface MyHomeworkScreenProps {
  onBack: () => void;
  onOpen: (sessionId: string) => void;
  onList: () => Promise<HomeworkSessionDTO[]>;
  onDelete: (sessionId: string) => Promise<void>;
}

const MyHomeworkScreen: React.FC<MyHomeworkScreenProps> = ({ onBack, onOpen, onList, onDelete }) => {
  const [rows, setRows] = useState<HomeworkSessionDTO[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    onList()
      .then((result) => {
        if (!cancelled) setRows(result);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [onList]);

  const remove = async (id: string) => {
    try {
      await onDelete(id);
      setRows((prev) => (prev ? prev.filter((r) => r.session_id !== id) : prev));
      toast.success("Removed");
    } catch {
      toast.error("Could not remove that session.");
    }
  };

  return (
    <div>
      <div className={`${styles.mono} text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1`}>
        My Homework
      </div>
      <h1 className={`${styles.serif} text-2xl font-bold mt-1 mb-1.5`}>Your progress</h1>
      <p className="text-[var(--ink-soft)] text-[15px] mb-5">
        Saved automatically as you complete questions, so you can pick up where you left off.
      </p>

      {rows === null && <div className="text-[13.5px] italic text-[var(--ink-faint)]">Loading…</div>}
      {rows && rows.length === 0 && (
        <div className="text-[13.5px] italic text-[var(--ink-faint)]">
          Nothing here yet — start a question from the home screen.
        </div>
      )}
      {rows &&
        rows.map((row) => (
          <div
            key={row.session_id}
            className="flex justify-between items-center py-2.5 border-b border-[var(--line-soft)] text-[13.5px] gap-3"
          >
            <button
              type="button"
              className="font-medium text-left truncate flex-1"
              onClick={() => onOpen(row.session_id)}
            >
              {row.subject} · {row.topic}
            </button>
            <span className={`${styles.mono} text-xs text-[var(--ink-faint)] shrink-0`}>
              {row.status === "completed" ? "completed ✓" : "in progress"}
            </span>
            <button
              type="button"
              className="text-xs text-[var(--red)] shrink-0"
              onClick={() => remove(row.session_id)}
            >
              Remove
            </button>
          </div>
        ))}

      <div className="mt-6">
        <button
          type="button"
          className="font-semibold text-[14.5px] px-5 py-2.5 rounded-lg border border-[var(--line)]"
          onClick={onBack}
        >
          ← Back home
        </button>
      </div>
    </div>
  );
};

export default MyHomeworkScreen;
