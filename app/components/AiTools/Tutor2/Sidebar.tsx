"use client";

import { FC, useEffect, useState } from "react";
import { FiBookOpen, FiEdit3, FiCheckSquare, FiFolder, FiClock, FiPlus, FiX } from "react-icons/fi";
import {
  listStudySessions,
  listTutorDocuments,
  listTutorFolders,
  type StudySessionDto,
  type TutorDocumentRecord,
  type TutorFolderRecord,
} from "./tutorApi";
import type { TutorTab } from "./IntentPicker";

interface SidebarProps {
  activeTab: TutorTab;
  onSelectTab: (tab: TutorTab) => void;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  /** Bumped by the parent after a successful save so an already-open "Saved
   * Data" panel refetches instead of showing stale folder contents. */
  savedDataRefreshToken?: number;
}

const TAB_ITEMS: Array<{ tab: TutorTab; icon: FC<{ className?: string }>; label: string }> = [
  { tab: "research", icon: FiBookOpen, label: "Research" },
  { tab: "assignment", icon: FiEdit3, label: "Assignment" },
  { tab: "quiz", icon: FiCheckSquare, label: "Quiz" },
];

const Sidebar: FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentSessionId,
  onSelectSession,
  onNewSession,
  savedDataRefreshToken,
}) => {
  const [panel, setPanel] = useState<"none" | "folders" | "history">("none");
  const [folders, setFolders] = useState<TutorFolderRecord[]>([]);
  const [folderDocs, setFolderDocs] = useState<Record<string, TutorDocumentRecord[]>>({});
  const [sessions, setSessions] = useState<StudySessionDto[]>([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<TutorDocumentRecord | null>(null);

  useEffect(() => {
    if (panel !== "folders") return;
    setLoadingPanel(true);
    listTutorFolders()
      .then(async (list) => {
        setFolders(list);
        const entries = await Promise.all(
          list.map(async (folder) => {
            const id = folder.id || folder._id || "";
            const docs = await listTutorDocuments(id).catch(() => []);
            return [id, docs] as const;
          }),
        );
        setFolderDocs(Object.fromEntries(entries));
      })
      .catch(() => setFolders([]))
      .finally(() => setLoadingPanel(false));
    // Re-run whenever a save completes elsewhere (savedDataRefreshToken bump)
    // even while this panel is already open — otherwise a freshly saved item
    // stays invisible until the panel is closed and reopened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, savedDataRefreshToken]);

  useEffect(() => {
    if (panel !== "history") return;
    setLoadingPanel(true);
    listStudySessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoadingPanel(false));
  }, [panel]);

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between p-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Modes</span>
        <button
          type="button"
          onClick={onNewSession}
          title="New session"
          className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-white hover:text-primary-400"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>

      <nav className="space-y-1 px-2">
        {TAB_ITEMS.map(({ tab, icon: Icon, label }) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              onSelectTab(tab);
              setPanel("none");
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab && panel === "none"
                ? "bg-primary-400 text-white"
                : "text-gray-600 hover:bg-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-3 space-y-1 border-t border-gray-200 px-2 pt-3">
        <button
          type="button"
          onClick={() => setPanel(panel === "folders" ? "none" : "folders")}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            panel === "folders" ? "bg-white text-primary-400" : "text-gray-600 hover:bg-white"
          }`}
        >
          <FiFolder className="h-4 w-4" />
          Saved Data
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === "history" ? "none" : "history")}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            panel === "history" ? "bg-white text-primary-400" : "text-gray-600 hover:bg-white"
          }`}
        >
          <FiClock className="h-4 w-4" />
          Session History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {panel === "folders" ? (
          <div className="space-y-3">
            {loadingPanel ? <p className="p-2 text-xs text-gray-500">Loading…</p> : null}
            {!loadingPanel && folders.length === 0 ? (
              <p className="p-2 text-xs text-gray-500">
                Nothing saved yet. Use "Save Note" / "Save Progress" / "Save attempt" in a tab.
              </p>
            ) : null}
            {folders.map((folder) => {
              const id = folder.id || folder._id || "";
              const docs = folderDocs[id] || [];
              return (
                <div key={id} className="rounded-lg border border-gray-200 bg-white p-2">
                  <p className="text-xs font-semibold text-gray-800">{folder.name}</p>
                  {docs.length === 0 ? (
                    <p className="mt-1 text-[11px] text-gray-500">Empty</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {docs.map((doc) => (
                        <li key={doc.id || doc._id}>
                          <button
                            type="button"
                            onClick={() => setViewingDoc(doc)}
                            className="block w-full truncate rounded px-1 py-0.5 text-left text-[11px] text-gray-600 transition-colors hover:bg-primary-100 hover:text-primary-500"
                            title={doc.title}
                          >
                            {doc.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {panel === "history" ? (
          <div className="space-y-1">
            {loadingPanel ? <p className="p-2 text-xs text-gray-500">Loading…</p> : null}
            {!loadingPanel && sessions.length === 0 ? (
              <p className="p-2 text-xs text-gray-500">No previous sessions yet.</p>
            ) : null}
            {sessions.map((session) => (
              <button
                key={session._id}
                type="button"
                onClick={() => onSelectSession(session._id)}
                className={`block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs ${
                  currentSessionId === session._id
                    ? "bg-primary-100 font-semibold text-primary-400"
                    : "text-gray-600 hover:bg-white"
                }`}
                title={session.title}
              >
                {session.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {viewingDoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="truncate text-sm font-semibold text-gray-800" title={viewingDoc.title}>
                {viewingDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto whitespace-pre-wrap text-xs text-gray-700">
              {viewingDoc.content || "This item has no saved content."}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
};

export default Sidebar;
