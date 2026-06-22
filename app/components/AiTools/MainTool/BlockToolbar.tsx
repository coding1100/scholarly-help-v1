// app/components/WritelyAi/Paragraph-tool/BlockToolbar.tsx
import React from "react";
import { createPortal } from "react-dom";
import {
  MdOutlineAlternateEmail,
  MdOutlineChatBubbleOutline,
  MdOutlineAutoFixHigh,
  MdSwapHoriz,
  MdFormatPaint,
  MdDeleteOutline,
  MdContentCopy,
} from "react-icons/md";

interface BlockToolbarProps {
  position: { top: number; left: number };
  onSelect: (option: string) => void;
  onClose: () => void;
  /** Node type of the block this menu belongs to (e.g. "heading", "paragraph"). */
  blockType?: string;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({
  position,
  onSelect,
  onClose,
  blockType,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        containerRef.current &&
        target &&
        !containerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("touchstart", handlePointerDown, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("touchstart", handlePointerDown, true);
    };
  }, [onClose]);
  const isHeading = blockType === "heading";
  const options = [
    // You don't cite a heading — only offer Cite on prose blocks.
    ...(isHeading
      ? []
      : [{ label: "Cite", icon: <MdOutlineAlternateEmail />, value: "cite" }]),
    { label: "AI Chat", icon: <MdOutlineChatBubbleOutline />, value: "aiChat" },
    { label: "AI Edit", icon: <MdOutlineAutoFixHigh />, value: "aiEdit" },
    { label: "Turn into", icon: <MdSwapHoriz />, value: "turnInto" },
    { label: "Highlight", icon: <MdFormatPaint />, value: "highlight" },
    { label: "Duplicate", icon: <MdContentCopy />, value: "duplicate" },
    { label: "Delete", icon: <MdDeleteOutline />, value: "delete" },
  ];

  return createPortal(
    <div
      ref={containerRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex flex-col items-start min-w-[150px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className="flex items-center space-x-2 w-full p-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};

export default BlockToolbar;
