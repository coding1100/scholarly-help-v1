"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";
import Landing from "./Landing";
import IntentPicker, { type TutorTab } from "./IntentPicker";
import Sidebar from "./Sidebar";
import SaveModal from "./SaveModal";
import ResearchTab from "./tabs/ResearchTab";
import AssignmentTab from "./tabs/AssignmentTab";
import QuizTab from "./tabs/QuizTab";
import { getStudySessionDetails, type TutorMessageDto } from "./tutorApi";
import type { TutorChatMessage } from "./ChatMessage";

interface TutorWorkspaceProps {
  initialSessionId?: string;
}

const toChatMessages = (dtos: TutorMessageDto[]): TutorChatMessage[] =>
  dtos.map((m) => ({
    id: m._id,
    role: m.role,
    text: m.message,
  }));

/** A tab's self-reported ability to save its current state. */
export interface SaveHandler {
  hasContent: boolean;
  save: (projectLabel?: string) => Promise<void>;
}

/**
 * Top-level: owns which session is active and whether an intent has been
 * chosen for it yet. Once a session has a source attached, the Landing
 * upload screen never reappears for it (session-scoped, single-document
 * lock) — switching sessions goes through "New" in the sidebar or resuming
 * from Session History, never by re-uploading into the same session.
 */
const TutorWorkspace: FC<TutorWorkspaceProps> = ({ initialSessionId }) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [hasSource, setHasSource] = useState(false);
  const [intentChosen, setIntentChosen] = useState(false);
  const [activeTab, setActiveTab] = useState<TutorTab>("research");
  const [checkingSession, setCheckingSession] = useState(Boolean(initialSessionId));
  // A session just created via Landing already has its intent flow pending
  // (IntentPicker) — the details fetch below must not clobber that back to
  // `intentChosen: true` just because the source it itself just uploaded is
  // now visible in that response. Only a RESUMED session (loaded on mount, or
  // picked from Session History) should auto-skip the picker.
  const [freshSessionId, setFreshSessionId] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedDataRefreshToken, setSavedDataRefreshToken] = useState(0);
  const [resumedResearchMessages, setResumedResearchMessages] = useState<TutorChatMessage[]>([]);
  const [resumedAssignmentMessages, setResumedAssignmentMessages] = useState<TutorChatMessage[]>([]);
  const saveHandlersRef = useRef<Partial<Record<TutorTab, SaveHandler>>>({});

  const registerSaveHandler = useCallback(
    (tab: TutorTab) => (handler: SaveHandler) => {
      saveHandlersRef.current[tab] = handler;
    },
    [],
  );

  const handleTabSaved = useCallback(() => {
    setSavedDataRefreshToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    if (sessionId === freshSessionId) return;
    setCheckingSession(true);
    getStudySessionDetails(sessionId)
      .then((details) => {
        const sourceCount = details.sources?.length || 0;
        setHasSource(sourceCount > 0);
        // Resuming a session that already has a source: skip straight to the
        // workspace (intent already implied by prior use) rather than
        // re-asking — the sidebar lets them switch tabs freely anyway.
        setIntentChosen(sourceCount > 0);
        // Split prior tutor turns back into Research vs Assignment by the
        // `mode` they were saved with, so resuming a session actually shows
        // its chat history instead of two blank tabs (quiz attempts aren't
        // chat-persisted, so the Quiz tab has nothing to hydrate).
        const allMessages = details.tutorMessages || [];
        setResumedResearchMessages(
          toChatMessages(allMessages.filter((m) => (m.mode || "research") === "research")),
        );
        setResumedAssignmentMessages(
          toChatMessages(allMessages.filter((m) => m.mode === "assignment")),
        );
      })
      .catch(() => {
        setHasSource(false);
        setIntentChosen(false);
      })
      .finally(() => setCheckingSession(false));
  }, [sessionId, freshSessionId]);

  const handleReady = (newSessionId: string) => {
    setFreshSessionId(newSessionId);
    setSessionId(newSessionId);
    setHasSource(true);
    setIntentChosen(false);
    setCheckingSession(false);
  };

  const handleIntent = (tab: TutorTab) => {
    setActiveTab(tab);
    setIntentChosen(true);
  };

  const handleNewSession = () => {
    setSessionId(null);
    setHasSource(false);
    setIntentChosen(false);
    setFreshSessionId(null);
    setResumedResearchMessages([]);
    setResumedAssignmentMessages([]);
  };

  const handleSelectSession = (id: string) => {
    setFreshSessionId(null);
    setSessionId(id);
  };

  const handleSaveActiveTab = async () => {
    const handler = saveHandlersRef.current[activeTab];
    if (!handler || !handler.hasContent) {
      toast.error("Nothing to save yet in this tab.");
      return;
    }
    try {
      await handler.save();
      toast.success("Saved — open \"Saved Data\" in the sidebar to view it");
      setSavedDataRefreshToken((n) => n + 1);
    } catch {
      toast.error("Could not save. Please retry.");
    }
  };

  const handleSaveAllSession = async (projectLabel: string) => {
    const entries = Object.entries(saveHandlersRef.current) as [TutorTab, SaveHandler][];
    const savable = entries.filter(([, handler]) => handler.hasContent);
    if (savable.length === 0) {
      toast.error("Nothing to save yet in this session.");
      return;
    }
    const results = await Promise.allSettled(savable.map(([, handler]) => handler.save(projectLabel)));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast.success(
        `Saved ${savable.length} item${savable.length > 1 ? "s" : ""} — open "Saved Data" in the sidebar to view them`,
      );
    } else {
      toast.error(`Saved ${savable.length - failed} of ${savable.length} items — some failed`);
    }
    setSavedDataRefreshToken((n) => n + 1);
  };

  if (checkingSession) {
    return (
      <div className="flex h-[calc(100vh-4.2rem)] items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!sessionId || !hasSource) {
    return (
      <div className="h-[calc(100vh-4.2rem)] w-full bg-white">
        <Landing onReady={handleReady} />
      </div>
    );
  }

  if (!intentChosen) {
    return (
      <div className="h-[calc(100vh-4.2rem)] w-full bg-white">
        <IntentPicker onSelect={handleIntent} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.2rem)] w-full overflow-hidden bg-white">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        savedDataRefreshToken={savedDataRefreshToken}
      />
      {/* All three tabs stay mounted so switching never drops in-progress
          state. Each wrapper is `absolute inset-0` to overlap in the same
          box, but an INACTIVE wrapper must also be `hidden` + pointer-events
          disabled itself — its child being hidden does not shrink the
          wrapper's own box, so a lingering full-size wrapper would otherwise
          sit on top of the active tab and swallow clicks. */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setSaveModalOpen(true)}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-primary-400 hover:text-primary-400"
        >
          <FiBookmark className="h-3.5 w-3.5" />
          Save Progress
        </button>
        <div
          className={`absolute inset-0 ${activeTab === "research" ? "" : "hidden pointer-events-none"}`}
        >
          <ResearchTab
            sessionId={sessionId}
            active={activeTab === "research"}
            onRegisterSaveHandler={registerSaveHandler("research")}
            onSaved={handleTabSaved}
            initialMessages={resumedResearchMessages}
          />
        </div>
        <div
          className={`absolute inset-0 ${activeTab === "assignment" ? "" : "hidden pointer-events-none"}`}
        >
          <AssignmentTab
            sessionId={sessionId}
            active={activeTab === "assignment"}
            onRegisterSaveHandler={registerSaveHandler("assignment")}
            initialMessages={resumedAssignmentMessages}
          />
        </div>
        <div
          className={`absolute inset-0 ${activeTab === "quiz" ? "" : "hidden pointer-events-none"}`}
        >
          <QuizTab
            sessionId={sessionId}
            active={activeTab === "quiz"}
            onRegisterSaveHandler={registerSaveHandler("quiz")}
            onSaved={handleTabSaved}
          />
        </div>
      </div>

      <SaveModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        activeTab={activeTab}
        activeTabHasContent={Boolean(saveHandlersRef.current[activeTab]?.hasContent)}
        onSaveActiveTab={handleSaveActiveTab}
        onSaveAllSession={handleSaveAllSession}
      />
    </div>
  );
};

export default TutorWorkspace;
