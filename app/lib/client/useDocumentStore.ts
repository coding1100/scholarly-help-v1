"use client";

// Shared cross-tool document state with local persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ActiveDocumentState {
  title: string;
  activeText: string;
  sourceTool: string;
  lastUpdated: number;
  setActiveDocument: (payload: {
    text: string;
    title?: string;
    sourceTool?: string;
  }) => void;
  setActiveText: (text: string) => void;
  clearDocument: () => void;
}

export const useDocumentStore = create<ActiveDocumentState>()(
  persist(
    (set) => ({
      title: "",
      activeText: "",
      sourceTool: "",
      lastUpdated: 0,
      setActiveDocument: ({ text, title = "", sourceTool = "" }) =>
        set({
          activeText: text,
          title,
          sourceTool,
          lastUpdated: Date.now(),
        }),
      setActiveText: (text: string) =>
        set({
          activeText: text,
          lastUpdated: Date.now(),
        }),
      clearDocument: () =>
        set({
          title: "",
          activeText: "",
          sourceTool: "",
          lastUpdated: 0,
        }),
    }),
    {
      name: "sh_active_document_v1",
    },
  ),
);
