"use client";

import { FC, useEffect, useState } from "react";
import Landing from "./Landing";
import IntentPicker, { type TutorTab } from "./IntentPicker";
import Sidebar from "./Sidebar";
import ResearchTab from "./tabs/ResearchTab";
import AssignmentTab from "./tabs/AssignmentTab";
import QuizTab from "./tabs/QuizTab";
import { getStudySessionDetails } from "./tutorApi";

interface TutorWorkspaceProps {
  initialSessionId?: string;
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
  };

  const handleSelectSession = (id: string) => {
    setFreshSessionId(null);
    setSessionId(id);
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
      />
      {/* All three tabs stay mounted so switching never drops in-progress
          state. Each wrapper is `absolute inset-0` to overlap in the same
          box, but an INACTIVE wrapper must also be `hidden` + pointer-events
          disabled itself — its child being hidden does not shrink the
          wrapper's own box, so a lingering full-size wrapper would otherwise
          sit on top of the active tab and swallow clicks. */}
      <div className="relative flex-1">
        <div
          className={`absolute inset-0 ${activeTab === "research" ? "" : "hidden pointer-events-none"}`}
        >
          <ResearchTab sessionId={sessionId} active={activeTab === "research"} />
        </div>
        <div
          className={`absolute inset-0 ${activeTab === "assignment" ? "" : "hidden pointer-events-none"}`}
        >
          <AssignmentTab sessionId={sessionId} active={activeTab === "assignment"} />
        </div>
        <div
          className={`absolute inset-0 ${activeTab === "quiz" ? "" : "hidden pointer-events-none"}`}
        >
          <QuizTab sessionId={sessionId} active={activeTab === "quiz"} />
        </div>
      </div>
    </div>
  );
};

export default TutorWorkspace;
