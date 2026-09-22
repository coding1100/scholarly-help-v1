"use client";

import { FC } from "react";

const CHIPS: Array<{ action: "hint" | "why" | "eli6" | "steps"; label: string }> = [
  { action: "hint", label: "💡 Hint" },
  { action: "why", label: "🤔 Why?" },
  { action: "eli6", label: "👶 ELI6" },
  { action: "steps", label: "🪜 Step-by-Step" },
];

interface ActionChipsProps {
  onSelect: (action: "hint" | "why" | "eli6" | "steps") => void;
  disabled?: boolean;
}

/**
 * Fixed beneath every assistant message. Clicking a chip processes the exact
 * text of THIS message (passed by the caller as groundedText to the tutor
 * stream), never a fresh, ungrounded backend retrieval.
 */
const ActionChips: FC<ActionChipsProps> = ({ onSelect, disabled }) => (
  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
    {CHIPS.map((chip) => (
      <button
        key={chip.action}
        type="button"
        disabled={disabled}
        onClick={() => onSelect(chip.action)}
        className="rounded-lg border border-primary-400 bg-white px-2.5 py-1 text-[11px] font-medium text-primary-400 transition-colors hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {chip.label}
      </button>
    ))}
  </div>
);

export default ActionChips;
