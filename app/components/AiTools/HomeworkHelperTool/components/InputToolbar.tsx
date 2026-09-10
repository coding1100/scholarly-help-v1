"use client";

import React from "react";
import { INPUT_TOOLKITS, type HomeworkInputType } from "../types";

interface InputToolbarProps {
  inputType: HomeworkInputType;
  onInsert: (symbol: string) => void;
  compact?: boolean;
}

const InputToolbar: React.FC<InputToolbarProps> = ({ inputType, onInsert, compact }) => {
  const kit = INPUT_TOOLKITS[inputType];
  if (!kit) {
    return compact ? null : (
      <div className="text-[10.5px] uppercase text-[var(--ink-faint)] mb-1.5">
        Plain text — no special formatting needed for this subject
      </div>
    );
  }
  return (
    <div className={compact ? "mb-2" : "mb-2"}>
      {!compact && (
        <div className="text-[10.5px] uppercase text-[var(--ink-faint)] mb-1.5">{kit.label}</div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {kit.syms.map((sym) => (
          <button
            key={sym}
            type="button"
            className="font-mono text-[13px] px-2 py-1 border border-[var(--line)] rounded-md bg-[var(--paper-raised)] text-[var(--ink-soft)] hover:border-[var(--pen)] hover:text-[var(--pen)]"
            onClick={() => onInsert(sym)}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputToolbar;
