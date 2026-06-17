"use client";
import { PiTextAaBold } from "react-icons/pi";
import { FaUndo, FaRedo } from "react-icons/fa";
import { MdFormatQuote } from "react-icons/md";
import { MdOutlineImage } from "react-icons/md";
import { MdOutlineSmartDisplay } from "react-icons/md";
import { MdOutlineFunctions } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { useContext, useState, useEffect, useRef } from "react";
import { WordCountContext, EditorContext } from "./MainToolLayout";
import { CiViewTable } from "react-icons/ci";
import {
  MdOutlineTextFields,
  MdOutlineTitle,
  MdFormatListNumbered,
  MdFormatListBulleted,
  MdTableChart,
} from "react-icons/md";
import { FaChevronDown } from "react-icons/fa6";
const FooterBar = () => {
  const { wordCount } = useContext(WordCountContext);
  const { editor } = useContext(EditorContext);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const tablePickerRef = useRef<HTMLDivElement>(null);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [currentBlockType, setCurrentBlockType] = useState<string>("text");
  const blockDropdownRef = useRef<HTMLDivElement>(null);

  // Update undo/redo button states and current block type
  useEffect(() => {
    if (!editor) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    const updateUndoRedoState = () => {
      setCanUndo(editor.can().undo());
      setCanRedo(editor.can().redo());
    };

    const updateBlockType = () => {
      if (editor.isActive("heading", { level: 1 })) {
        setCurrentBlockType("h1");
      } else if (editor.isActive("heading", { level: 2 })) {
        setCurrentBlockType("h2");
      } else if (editor.isActive("heading", { level: 3 })) {
        setCurrentBlockType("h3");
      } else if (editor.isActive("bulletList")) {
        setCurrentBlockType("bulletList");
      } else if (editor.isActive("orderedList")) {
        setCurrentBlockType("numberedList");
      } else if (editor.isActive("blockquote")) {
        setCurrentBlockType("blockquote");
      } else if (editor.isActive("table")) {
        setCurrentBlockType("table");
      } else {
        setCurrentBlockType("text");
      }
    };

    // Use a single stable handler reference so editor.off can correctly remove it
    const handleEditorEvent = () => {
      updateUndoRedoState();
      updateBlockType();
    };

    handleEditorEvent();
    editor.on("update", handleEditorEvent);
    editor.on("selectionUpdate", handleEditorEvent);

    return () => {
      editor.off("update", handleEditorEvent);
      editor.off("selectionUpdate", handleEditorEvent);
    };
  }, [editor]);

  // Close table picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tablePickerRef.current &&
        !tablePickerRef.current.contains(event.target as Node)
      ) {
        setShowTablePicker(false);
        setHoveredCell(null);
      }
    };

    if (showTablePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTablePicker]);

  // Close block dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blockDropdownRef.current &&
        !blockDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBlockDropdown(false);
      }
    };

    if (showBlockDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBlockDropdown]);

  // Get label for current block type
  const getBlockTypeLabel = (blockType: string): string => {
    switch (blockType) {
      case "h1":
        return "Heading 1";
      case "h2":
        return "Heading 2";
      case "h3":
        return "Heading 3";
      case "numberedList":
        return "Numbered List";
      case "bulletList":
        return "Bulleted List";
      case "table":
        return "Table";
      case "blockquote":
        return "Block Quote";
      default:
        return "Text";
    }
  };

  // Handle block type change
  const handleBlockTypeChange = (blockType: string) => {
    if (!editor) return;

    editor.chain().focus().run();

    switch (blockType) {
      case "text":
        editor.chain().focus().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case "numberedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "table":
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      default:
        break;
    }

    setShowBlockDropdown(false);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    if (!editor) {
      console.error("Editor not available");
      return;
    }

    try {
      // Ensure editor is focused
      editor.chain().focus().run();

      // Check if insertTable command is available
      if (!editor.can().insertTable({ rows, cols, withHeaderRow: true })) {
        console.error("Cannot insert table at current position");
        // Try to insert a paragraph first, then the table
        editor
          .chain()
          .focus()
          .insertContent("<p></p>")
          .insertTable({
            rows: rows,
            cols: cols,
            withHeaderRow: true,
          })
          .run();
      } else {
        // Use TipTap's built-in insertTable command
        const result = editor
          .chain()
          .focus()
          .insertTable({
            rows: rows,
            cols: cols,
            withHeaderRow: true,
          })
          .run();

        if (!result) {
          console.error("Failed to insert table. Command returned false.");
          // Fallback: try without withHeaderRow
          const fallbackResult = editor
            .chain()
            .focus()
            .insertTable({
              rows: rows,
              cols: cols,
            })
            .run();

          if (!fallbackResult) {
            console.error("All table insertion methods failed");
          }
        }
      }
    } catch (error) {
      console.error("Error inserting table:", error);
    }

    setShowTablePicker(false);
    setHoveredCell(null);
  };
  return (
    <div className="flex flex-shrink-0 justify-between items-center px-2 py-1 border-t border-gray-300 bg-white w-full text-black">
      {/* Center buttons */}
      <div className="flex items-center gap-2 mx-auto">
        {/* <button className="text-gray-700 text-lg hover:text-[#155dfc]">
          <PiTextAaBold />
        </button> */}

        <span className="border-l h-5 border-gray-300"></span>

        <div className="relative" ref={blockDropdownRef}>
          <button
            className="text-sm text-gray-800 font-normal flex items-center gap-1 hover:text-gray-600"
            onClick={() => setShowBlockDropdown(!showBlockDropdown)}
          >
            <span>{getBlockTypeLabel(currentBlockType)}</span>
            <span className="text-xs text-gray-500">
              <FaChevronDown />
            </span>
          </button>

          {showBlockDropdown && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[180px] py-1">
              {[
                {
                  value: "text",
                  label: "Text",
                  icon: <span className="text-base font-medium">T</span>,
                },
                {
                  value: "h1",
                  label: "Heading 1",
                  icon: <span className="text-sm font-semibold">H1</span>,
                },
                {
                  value: "h2",
                  label: "Heading 2",
                  icon: <span className="text-sm font-semibold">H2</span>,
                },
                {
                  value: "h3",
                  label: "Heading 3",
                  icon: <span className="text-sm font-semibold">H3</span>,
                },
                {
                  value: "numberedList",
                  label: "Numbered List",
                  icon: <MdFormatListNumbered className="text-lg" />,
                },
                {
                  value: "bulletList",
                  label: "Bulleted List",
                  icon: <MdFormatListBulleted className="text-lg" />,
                },
                {
                  value: "table",
                  label: "Table",
                  icon: <MdTableChart className="text-lg" />,
                },
                {
                  value: "blockquote",
                  label: "Block Quote",
                  icon: <MdFormatQuote className="text-lg" />,
                },
              ].map((option) => {
                const isSelected = currentBlockType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleBlockTypeChange(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-[#155dfc] text-white hover:bg-[#1447e6]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex-shrink-0 w-5 flex items-center justify-center">
                      {option.icon}
                    </span>
                    <span className="flex-1">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className="border-l h-5 border-gray-300"></span>

        <button title="insert image" className="text-gray-600 hover:text-black">
          <MdOutlineImage className="text-lg" />
        </button>
        {/* <button className="text-gray-600 hover:text-black">
          <MdOutlineSmartDisplay className="text-lg" />
        </button> */}
        {/* <button className="text-gray-600 hover:text-black">
          <MdOutlineFunctions className="text-lg" />
        </button> */}
        {/* <button className="text-gray-600 hover:text-black">
          <RxCross2 className="text-lg" />
        </button> */}
        <div className="relative mt-1.5" ref={tablePickerRef}>
          <button
            className="text-gray-600 hover:text-black"
            onClick={() => setShowTablePicker(!showTablePicker)}
            title="Insert table"
          >
            <CiViewTable className="text-lg" />
          </button>

          {showTablePicker && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-50 min-w-[200px]">
              <div className="text-xs text-gray-700 mb-3 text-center font-medium">
                {hoveredCell
                  ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1} table`
                  : "Select table size"}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, index) => {
                  const row = Math.floor(index / 8);
                  const col = index % 8;
                  const isHovered =
                    hoveredCell &&
                    row <= hoveredCell.row &&
                    col <= hoveredCell.col;

                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 border border-gray-300 cursor-pointer transition-all duration-150 ${
                        isHovered
                          ? "bg-[#2b7fff] border-[#155dfc] shadow-sm"
                          : "bg-gray-100 hover:bg-gray-300"
                      }`}
                      onMouseEnter={() => setHoveredCell({ row, col })}
                      onClick={() => handleInsertTable(row + 1, col + 1)}
                      title={`${row + 1} rows × ${col + 1} columns`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <span className="border-l h-5 border-gray-300"></span>

        <button
          className={`text-gray-600 hover:text-black ${
            !canUndo ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (editor && canUndo) {
              editor.chain().focus().undo().run();
            }
          }}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <FaUndo />
        </button>
        <button
          className={`text-gray-600 hover:text-black ${
            !canRedo ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            if (editor && canRedo) {
              editor.chain().focus().redo().run();
            }
          }}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <FaRedo />
        </button>
      </div>

      {/* Right side stats */}
      <div className="flex items-center text-sm text-gray-600 gap-4">
        <span>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
};

export default FooterBar;
