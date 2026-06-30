"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  createStudySession,
  deleteStudySession,
  listStudySessions,
  setActiveStudySessionId,
  StudySessionDto,
} from "@/app/utils/studyApiClient";
import { incrementGuestSessionCount, isGuest } from "@/app/lib/client/guestStudyLimits";

const STUDY_WORKSPACE_PATH = "/tools/study-workspace";

type SessionListItem = Pick<StudySessionDto, "_id" | "title">;

/**
 * Sidebar navigation for the AI Study Workspace: a "+ New Study Session" action
 * and the user's full "Recent Sessions" history.
 *
 * Only shown to signed-in users (hidden for guests), on the study-workspace
 * route (MTSidebar is shared across all tools), once at least one session
 * exists. Session list state is kept in sync with the workspace via the same
 * window events the workspace already dispatches.
 */
export default function StudySessionsNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSessionId = searchParams.get("sessionId");

  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // Resolved on the client only — isGuest() reads localStorage, so calling it
  // during render would risk an SSR/hydration mismatch. Defaults to true so the
  // block stays hidden until we confirm the user is signed in.
  const [isGuestUser, setIsGuestUser] = useState(true);

  useEffect(() => {
    setIsGuestUser(isGuest());
  }, []);

  const normalizedRoute = useMemo(
    () => (pathname?.endsWith("/") ? pathname.slice(0, -1) : pathname),
    [pathname],
  );
  const isStudyWorkspaceRoute = normalizedRoute === STUDY_WORKSPACE_PATH;

  const refreshSessions = useCallback(async () => {
    try {
      const list = await listStudySessions();
      setSessions(list.map((item) => ({ _id: item._id, title: item.title })));
    } catch (error) {
      console.error("Failed to load study sessions", error);
    }
  }, []);

  useEffect(() => {
    if (!isStudyWorkspaceRoute) return;
    void refreshSessions();
  }, [isStudyWorkspaceRoute, refreshSessions]);

  // Keep the list fresh as the workspace creates sessions, adds sources, or
  // renames the active session.
  useEffect(() => {
    if (!isStudyWorkspaceRoute || typeof window === "undefined") return;
    const refresh = () => void refreshSessions();
    window.addEventListener("study-session-changed", refresh);
    window.addEventListener("study-source-added", refresh);
    return () => {
      window.removeEventListener("study-session-changed", refresh);
      window.removeEventListener("study-source-added", refresh);
    };
  }, [isStudyWorkspaceRoute, refreshSessions]);

  const openSession = useCallback(
    (sessionId: string) => {
      if (!sessionId) return;
      setActiveStudySessionId(sessionId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("sessionId", sessionId);
      router.replace(`${STUDY_WORKSPACE_PATH}?${params.toString()}`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("study-session-changed", { detail: { sessionId } }),
        );
      }
      onNavigate?.();
    },
    [router, searchParams, onNavigate],
  );

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      const session = await createStudySession("My Study Session");
      if (isGuest()) incrementGuestSessionCount();
      await refreshSessions();
      openSession(session._id);
    } catch (error) {
      console.error("Failed to create study session", error);
      toast.error("Could not create new study session");
    } finally {
      setIsCreating(false);
    }
  }, [openSession, refreshSessions]);

  const handleConfirmDelete = useCallback(
    async (sessionId: string) => {
      setDeletingId(sessionId);
      try {
        await deleteStudySession(sessionId);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(`study_saved_recordings_${sessionId}`);
          window.localStorage.removeItem(`study_workspace_state_${sessionId}`);
        }
        const list = await listStudySessions();
        setSessions(list.map((item) => ({ _id: item._id, title: item.title })));
        setPendingDeleteId(null);
        toast.success("Session deleted");

        // If we deleted the active session, move to another (or a fresh one).
        if (sessionId === activeSessionId) {
          if (list.length > 0) {
            openSession(list[0]._id);
          } else {
            const created = await createStudySession("My Study Session");
            setSessions([{ _id: created._id, title: created.title }]);
            openSession(created._id);
          }
        }
      } catch (error) {
        console.error("Failed to delete study session", error);
        toast.error("Could not delete session");
      } finally {
        setDeletingId(null);
      }
    },
    [activeSessionId, openSession],
  );

  // Shown on the workspace once at least one session exists. Recent Sessions is
  // visible to everyone (guests included); the "+ New Study Session" button is
  // for signed-in users only.
  if (!isStudyWorkspaceRoute || sessions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      {!isGuestUser ? (
        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-60 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
        >
          <FiPlus className="h-4 w-4 shrink-0" />
          <span>{isCreating ? "Creating…" : "New Study Session"}</span>
        </button>
      ) : null}

      <p className="mt-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Recent Sessions
      </p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {sessions.map((session) => {
          const isActive = session._id === activeSessionId;
          const isConfirming = pendingDeleteId === session._id;
          return (
            <li key={session._id} className="group relative">
              <div
                className={`flex items-center rounded-md transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openSession(session._id)}
                  title={session.title || "Untitled Session"}
                  className={`min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm leading-5 ${
                    isActive
                      ? "font-semibold text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {session.title || "Untitled Session"}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(session._id)}
                  aria-label={`Delete ${session.title || "session"}`}
                  className="mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-red-200 group-hover:opacity-100 dark:hover:bg-red-900/30"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {isConfirming ? (
                <div className="mt-1 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-900/50 dark:bg-red-900/20">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Delete this session? This cannot be undone.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(session._id)}
                      disabled={deletingId === session._id}
                      className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {deletingId === session._id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(null)}
                      disabled={deletingId === session._id}
                      className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
