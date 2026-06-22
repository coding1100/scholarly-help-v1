// app/components/WritelyAi/Paragraph-tool/BlockMenu.tsx
import React from "react";
import { createPortal } from "react-dom";
import {
  MdOutlineTextFields,
  MdOutlineTitle,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdCode,
  MdTableChart,
} from "react-icons/md";

interface BlockMenuProps {
  position: { top: number; left: number };
  onSelect: (option: string) => void;
  onClose: () => void;
}

const BlockMenu: React.FC<BlockMenuProps> = ({
  position,
  onSelect,
  onClose,
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
  const options = [
    { label: "Text", icon: <MdOutlineTextFields />, value: "text" },
    { label: "Heading 1", icon: <MdOutlineTitle />, value: "h1" },
    { label: "Heading 2", icon: <MdOutlineTitle />, value: "h2" },
    { label: "Heading 3", icon: <MdOutlineTitle />, value: "h3" },
    {
      label: "Bullet List",
      icon: <MdFormatListBulleted />,
      value: "bulletList",
    },
    {
      label: "Numbered List",
      icon: <MdFormatListNumbered />,
      value: "numberedList",
    },
    { label: "Code Block", icon: <MdCode />, value: "codeBlock" },
    { label: "Table", icon: <MdTableChart />, value: "table" },
  ];

  return createPortal(
    <div
      ref={containerRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex flex-col items-start min-w-[150px]"
    >
      <div className="text-gray-500 text-xs font-semibold uppercase mb-2">
        Blocks
      </div>
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

export default BlockMenu;
