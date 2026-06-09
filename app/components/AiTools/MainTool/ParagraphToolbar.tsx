"use client";

import React from "react";
import BlockMenu from "./BlockMenu";

type ParagraphToolbarProps = {
  className?: string;
  onSetBlock?: (value: string) => void;
  onCite?: () => void;
  onHumanize?: () => void;
  onOpenChat?: () => void;
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleUnderline?: () => void;
  onToggleStrike?: () => void;
  onToggleCode?: () => void;
  onLink?: () => void;
};

/**
 * Presentational toolbar only. Matches the requested design without behaviors.
 */
const ParagraphToolbar: React.FC<ParagraphToolbarProps> = ({
  className = "",
  onSetBlock,
  onCite,
  onHumanize,
  onOpenChat,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onToggleCode,
  onLink,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = React.useState(false);
  const [selectedBlock, setSelectedBlock] = React.useState<string>("text");
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const textBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const actionBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [actionPos, setActionPos] = React.useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const actionMenuRef = React.useRef<HTMLDivElement | null>(null);

  const labelForSelected = (value: string) => {
    switch (value) {
      case "h1":
        return "H1 Heading 1";
      case "h2":
        return "H2 Heading 2";
      case "h3":
        return "H3 Heading 3";
      case "bulletList":
        return "Bulleted List";
      case "numberedList":
        return "Numbered List";
      case "codeBlock":
        return "Code Block";
      case "table":
        return "Table";
      case "image":
        return "Image";
      default:
        return "Text";
    }
  };

  const openMenu = () => {
    const btn = textBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
    setIsMenuOpen(true);
  };

  const openActionMenu = () => {
    const btn = actionBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setActionPos({
      // Use viewport coords so the menu stays anchored even inside positioned containers.
      top: rect.bottom + 6,
      left: rect.left,
    });
    setIsActionMenuOpen((prev) => !prev);
  };

  React.useEffect(() => {
    if (!isActionMenuOpen) return;
    const onDocMouseDown = (event: MouseEvent) => {
      const t = event.target;
      if (!(t instanceof Node)) return;
      const btn = actionBtnRef.current;
      const menu = actionMenuRef.current;
      if (btn?.contains(t) || menu?.contains(t)) return;
      setIsActionMenuOpen(false);
    };
    const onDocKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsActionMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [isActionMenuOpen]);

  const handleSelect = (value: string) => {
    setSelectedBlock(value);
    setIsMenuOpen(false);
    onSetBlock?.(value);
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        data-tour="ara-selection-toolbar"
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white p-1 shadow-sm"
      >
        {/* Left group: Cite, Chat, AI Edit */}
        {/* <button
          type="button"
          aria-label="Cite selected text"
          title="CT — Cite the selected text (adds an in-text citation)"
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 font-semibold"
          onClick={onCite}
        >
          CT
        </button> */}
        <button
          ref={actionBtnRef}
          type="button"
          aria-label="Selection actions"
          title="Tools for the selected text"
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1"
          onClick={openActionMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M2 5.75A2.75 2.75 0 0 1 4.75 3h14.5A2.75 2.75 0 0 1 22 5.75v7.5A2.75 2.75 0 0 1 19.25 16H8.6l-3.6 3.6A.75.75 0 0 1 4 18.75V16H4.75A2.75 2.75 0 0 1 2 13.25v-7.5Z" />
          </svg>
          Chat
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {/* <button
          aria-label="AI Edit"
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M11.3 2.3a1 1 0 0 1 1.4 0l1.2 1.2 1.2-1.2a1 1 0 1 1 1.4 1.4L15.4 5l1.2 1.2a1 1 0 0 1-1.4 1.4L14 6.4l-1.2 1.2a1 1 0 1 1-1.4-1.4L12.6 5l-1.2-1.2a1 1 0 0 1 0-1.4Z" />
          </svg>
          AI Edit
        </button> */}

        {/* Text dropdown */}
        <button
          ref={textBtnRef}
          aria-label="Text style"
          className="px-2 py-1 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1"
          onClick={openMenu}
        >
          <span className="font-medium">T</span>
          <span className="text-gray-700">
            {labelForSelected(selectedBlock)}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Color dot + dropdown */}
        {/* <div className="flex items-center gap-1 px-1">
          <span className="inline-block h-3 w-3 rounded-full border border-gray-300 bg-white" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-gray-500"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
              clipRule="evenodd"
            />
          </svg>
        </div> */}

        {/* Right group: B I U S, code, link */}
        <button
          aria-label="Bold"
          className="px-2 py-1 rounded hover:bg-gray-100 font-semibold"
          onClick={onToggleBold}
        >
          B
        </button>
        <button
          aria-label="Italic"
          className="px-2 py-1 rounded hover:bg-gray-100 italic"
          onClick={onToggleItalic}
        >
          I
        </button>
        <button
          aria-label="Underline"
          className="px-2 py-1 rounded hover:bg-gray-100 underline"
          onClick={onToggleUnderline}
        >
          U
        </button>
        <button
          aria-label="Strikethrough"
          className="px-2 py-1 rounded hover:bg-gray-100 line-through"
          onClick={onToggleStrike}
        >
          S
        </button>
        <button
          aria-label="Code"
          className="px-2 py-1 rounded hover:bg-gray-100 font-mono text-sm"
          onClick={onToggleCode}
        >
          &lt;/&gt;
        </button>
        <button
          aria-label="Link"
          className="px-2 py-1 rounded hover:bg-gray-100"
          onClick={onLink}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10.59 13.41a1 1 0 0 0 1.41 1.41l3.54-3.54a3 3 0 1 0-4.24-4.24l-1.77 1.77a1 1 0 1 0 1.41 1.41l1.77-1.77a1 1 0 1 1 1.41 1.41l-3.54 3.54Zm2.82-2.82a1 1 0 0 0-1.41-1.41L8.46 12.31a3 3 0 1 0 4.24 4.24l1.77-1.77a1 1 0 1 0-1.41-1.41l-1.77 1.77a1 1 0 1 1-1.41-1.41l3.54-3.54Z" />
          </svg>
        </button>
      </div>
      {isMenuOpen && (
        <BlockMenu
          position={menuPos}
          onSelect={handleSelect}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
      {isActionMenuOpen && (
        <div
          ref={actionMenuRef}
          className=" z-[9999] w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1"
          style={{ top: actionPos.top, left: actionPos.left }}
        >
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            title="Add an in-text citation for the selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsActionMenuOpen(false);
              onCite?.();
            }}
          >
            Citation
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            title="Rewrite the selection to sound more human"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsActionMenuOpen(false);
              onHumanize?.();
            }}
          >
            Humanizer
          </button>
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            title="Chat with AI about the selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setIsActionMenuOpen(false);
              onOpenChat?.();
            }}
          >
            Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default ParagraphToolbar;
