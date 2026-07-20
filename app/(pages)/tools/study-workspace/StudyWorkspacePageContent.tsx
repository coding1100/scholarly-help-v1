"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import StudySourceIngestion from "@/app/components/AiTools/Dashboard/StudySourceIngestion";
import StudyWorkspace from "@/app/components/AiTools/Dashboard/StudyWorkspace";
import ToolGrid from "@/app/components/AiTools/Dashboard/ToolGrid";
import StudyAuthGateModal from "@/app/components/AiTools/StudyWorkspace/StudyAuthGateModal";
import { appendQueryString } from "@/app/utils/url";
import {
  getStudyRecordingSnapshot,
  onStudyRecordingChange,
} from "@/app/lib/client/studyRecording";
import {
  claimGuestStudyData,
  clearActiveStudySessionId,
  deleteStudySession,
  getActiveStudySessionId,
  getStudySessionDetails,
  listStudySessions,
  setActiveStudySessionId,
} from "@/app/utils/studyApiClient";
import {
  isGuest,
  takePendingGuestMigrationId,
} from "@/app/lib/client/guestStudyLimits";

export default function StudyWorkspacePageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const [hasSessionContent, setHasSessionContent] = useState<boolean | null>(null);
  // True until bootstrap has finished looking for an EXISTING session. A
  // first-time visitor legitimately ends with no session, so the loading state
  // can't key off `sessionId` alone (that would spin forever).
  const [isResolvingSession, setIsResolvingSession] = useState(true);
  const [isRecording, setIsRecording] = useState(
    () => getStudyRecordingSnapshot().status !== "idle",
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // Email gate (guests): shown on a 2nd session attempt or the 4th query.
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<"query" | "session">("session");

  // "Back to start": returns the user to the creation/welcome view. Because
  // re-adding content to the SAME session would append to the existing data,
  // confirming "Back" wipes the current session (delete + fresh session) so the
  // user genuinely starts over. `forceStart` shows onboarding for the brief
  // window before navigation completes.
  const [forceStart, setForceStart] = useState(false);
  const [backConfirmOpen, setBackConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // No upfront sign-in gate: guests may use the workspace. The email/password
  // gate appears later — on the 4th tutor query or a 2nd session creation.

  // The query (4th) gate is triggered from the child workspace via an event.
  useEffect(() => {
    const onAuthGate = (e: Event) => {
      const reason =
        (e as CustomEvent<{ reason?: "query" | "session" }>).detail?.reason ||
        "query";
      setGateReason(reason);
      setGateOpen(true);
    };
    window.addEventListener("study:auth-gate", onAuthGate);
    return () => window.removeEventListener("study:auth-gate", onAuthGate);
  }, []);

  // "Back to start" from the in-workspace toolbar asks for confirmation first —
  // going back discards the current session's data.
  useEffect(() => {
    const onBackToStart = () => setBackConfirmOpen(true);
    window.addEventListener("study-back-to-start", onBackToStart);
    return () => window.removeEventListener("study-back-to-start", onBackToStart);
  }, []);

  // Leaving "start" again whenever the active session changes (switch/create),
  // so navigating to another session always lands on its workspace, not the
  // forced welcome view.
  useEffect(() => {
    setForceStart(false);
  }, [sessionId]);

  // After returning signed in, migrate the guest's work onto the new account.
  // Run exactly once and expose the promise so bootstrap can await it BEFORE
  // listing sessions — otherwise bootstrap may list (and create a fresh empty
  // session) before the claim commits, and the migrated work won't appear.
  const migrationPromiseRef = useRef<Promise<void> | null>(null);
  const ensureGuestMigration = useCallback((): Promise<void> => {
    if (migrationPromiseRef.current) return migrationPromiseRef.current;
    const run = (async () => {
      if (isGuest()) return;
      const pendingGuestId = takePendingGuestMigrationId();
      if (!pendingGuestId) return;
      try {
        await claimGuestStudyData(pendingGuestId);
      } catch (error) {
        console.error("Failed to migrate guest study data", error);
      }
    })();
    migrationPromiseRef.current = run;
    return run;
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapStudySession() {
      // Migrate guest work first so the freshly-claimed sessions are visible to
      // the list call below (prevents creating a duplicate empty session).
      await ensureGuestMigration();
      if (!active) return;
      const qsSessionId = searchParams.get("sessionId");
      const localSessionId = getActiveStudySessionId();
      const sessions = await listStudySessions();

      const resolvedSession =
        (qsSessionId && sessions.find((s) => s._id === qsSessionId)) ||
        (localSessionId && sessions.find((s) => s._id === localSessionId)) ||
        sessions[0];

      if (!active) return;

      // NO session is created here. Merely opening /tools/study-workspace is not
      // intent to start studying — auto-creating produced empty throwaway
      // sessions (and fired the "session created" analytics event) for every
      // visitor who bounced. The session is created lazily on the first
      // successful source add (see StudySourceIngestion.onSubmit). Until then we
      // show onboarding with no sessionId in the URL.
      if (!resolvedSession) {
        setIsResolvingSession(false);
        return;
      }

      setActiveStudySessionId(resolvedSession._id);
      setIsResolvingSession(false);

      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextParams.get("sessionId") !== resolvedSession._id) {
        nextParams.set("sessionId", resolvedSession._id);
        const nextHref = appendQueryString(
          pathname || "/tools/study-workspace",
          nextParams.toString(),
        );
        router.replace(nextHref);
      }
    }

    bootstrapStudySession().catch((error) => {
      console.error("Failed to bootstrap study session", error);
      if (active) setIsResolvingSession(false);
    });

    return () => {
      active = false;
    };
  }, [pathname, router, searchParams, ensureGuestMigration]);

  // A session was created lazily by the ingestion form on the user's first
  // successful source add. Adopt it: mark it active and put it in the URL so the
  // workspace mounts against it (and a refresh reopens the same session).
  const adoptCreatedSession = useCallback(
    (createdSessionId: string) => {
      setActiveStudySessionId(createdSessionId);
      setForceStart(false);
      setHasSessionContent(true);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("sessionId", createdSessionId);
      router.replace(
        appendQueryString(
          pathname || "/tools/study-workspace",
          nextParams.toString(),
        ),
      );
    },
    [pathname, router, searchParams],
  );

  // Confirmed "Back to start": discard the current session entirely and open a
  // fresh, empty one so new uploads don't append to the old data.
  const confirmBackToStart = useCallback(async () => {
    setIsResetting(true);
    try {
      const previousSessionId = sessionId;

      // Best-effort delete of the old session + its client-only state. A failure
      // here must not block starting fresh, so it's swallowed.
      if (previousSessionId) {
        try {
          await deleteStudySession(previousSessionId);
        } catch (error) {
          console.error("Failed to delete previous session on reset", error);
        }
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(
            `study_saved_recordings_${previousSessionId}`,
          );
          window.localStorage.removeItem(
            `study_workspace_state_${previousSessionId}`,
          );
        }
      }

      // Do NOT create a replacement session here — that would recreate the
      // empty-session problem. Drop the sessionId and return to onboarding; the
      // next successful source add creates the new session.
      clearActiveStudySessionId();
      setForceStart(true);
      setHasSessionContent(false);
      setBackConfirmOpen(false);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("sessionId");
      router.replace(
        appendQueryString(
          pathname || "/tools/study-workspace",
          nextParams.toString(),
        ),
      );
    } catch (error) {
      console.error("Failed to start a fresh session", error);
    } finally {
      setIsResetting(false);
    }
  }, [pathname, router, searchParams, sessionId]);

  const refreshSessionContentState = useCallback(async (targetSessionId: string) => {
    try {
      const details = await getStudySessionDetails(targetSessionId);
      setHasSessionContent(details.sources.length > 0);
    } catch (error) {
      console.error("Failed to load study session details", error);
      setHasSessionContent(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      // No session yet (nothing uploaded) → definitively no content, show
      // onboarding rather than an indefinite loading spinner.
      setHasSessionContent(false);
      return;
    }

    let active = true;
    setHasSessionContent(null);

    getStudySessionDetails(sessionId)
      .then((details) => {
        if (active) setHasSessionContent(details.sources.length > 0);
      })
      .catch((error) => {
        console.error("Failed to load study session details", error);
        if (active) setHasSessionContent(false);
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    setIsRecording(getStudyRecordingSnapshot().status !== "idle");
    const unsubscribe = onStudyRecordingChange((snapshot) => {
      setIsRecording(snapshot.status !== "idle");
    });
    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    const onSourceAdded = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId || detail.sessionId !== sessionId) return;
      setHasSessionContent(true);
    };
    const onRecordingStarted = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId || detail.sessionId !== sessionId) return;
      setHasSessionContent(true);
      setIsRecording(true);
    };
    const onSessionChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ sessionId?: string }>).detail;
      if (!detail?.sessionId) return;
      void refreshSessionContentState(detail.sessionId);
    };

    window.addEventListener("study-source-added", onSourceAdded);
    window.addEventListener("study-recording-started", onRecordingStarted);
    window.addEventListener("study-session-changed", onSessionChanged);
    return () => {
      window.removeEventListener("study-source-added", onSourceAdded);
      window.removeEventListener("study-recording-started", onRecordingStarted);
      window.removeEventListener("study-session-changed", onSessionChanged);
    };
  }, [refreshSessionContentState, sessionId]);

  // Loading only while we're still resolving an existing session, or while a
  // resolved session's content is still being fetched. With no session at all
  // (brand-new visitor) we go straight to onboarding — there is nothing to load.
  const isBootstrapping =
    isResolvingSession || (!!sessionId && hasSessionContent === null);
  // A live recording always keeps the workspace visible (its controls live
  // there); "back to start" only applies when nothing is being recorded.
  const showWorkspace = isRecording || (!forceStart && hasSessionContent === true);
  const showOnboarding = !isBootstrapping && !showWorkspace;

  // Broadcast the current view so the sidebar (a sibling, not a child) can hide
  // the Recent Sessions nav unless the full workspace is showing. We key off
  // showWorkspace (not showOnboarding) so the nav stays hidden during the
  // bootstrap/welcome phases and only appears in the real workspace view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("study-view-changed", {
        detail: { onboarding: !showWorkspace },
      }),
    );
  }, [showWorkspace]);

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      {/* ToolsLayout clones its single child element to inject `token`, so the
          page must pass exactly one element here — wrap the workspace and the
          auth-gate modal in a fragment. */}
      <>
        <main
          className={`bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 ${
            // Onboarding now also renders the Explore Tools grid below the
            // welcome card, so the view must scroll instead of clipping at the
            // fold. Both states share a scrolling main.
            "h-full overflow-y-auto"
          }`}
        >
        {isBootstrapping ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <FiLoader className="h-10 w-10 animate-spin text-[#5f70ff]" aria-label="Loading" />
          </div>
        ) : (
          <>
            <StudySourceIngestion
              variant={showOnboarding ? "onboarding" : "toolbar"}
              onSessionCreated={adoptCreatedSession}
              onContentReady={() => {
                setForceStart(false);
                setHasSessionContent(true);
              }}
            />
            {showWorkspace ? <StudyWorkspace /> : null}
            {/* Explore Tools grid is shown both before a session has content
                (creation page) and inside the workspace, so guests can discover
                other tools at either step. */}
            <ToolGrid />
          </>
        )}
        </main>

        {gateOpen ? (
          <StudyAuthGateModal
            open={gateOpen}
            reason={gateReason}
            returnUrl={`${pathname || "/tools/study-workspace"}${
              sessionId ? `?sessionId=${sessionId}` : ""
            }`}
            onClose={() => setGateOpen(false)}
          />
        ) : null}

        {backConfirmOpen ? (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0f1020]/55 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="back-confirm-title"
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#e2e5ff] bg-white p-5 shadow-2xl">
              <p
                id="back-confirm-title"
                className="text-base font-semibold text-[#1f2342]"
              >
                Start over?
              </p>
              <p className="mt-2 text-sm text-[#656b91]">
                Going back will clear this session. Your uploaded content and any
                generated notes, summaries, flashcards, or quizzes will be lost.
                This can&apos;t be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBackConfirmOpen(false)}
                  disabled={isResetting}
                  className="rounded-md border border-[#cfd5ff] px-3 py-1.5 text-sm text-[#4f577d] transition hover:bg-[#f3f5ff] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBackToStart}
                  disabled={isResetting}
                  className="rounded-md bg-[#d84848] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#c93d3d] disabled:opacity-60"
                >
                  {isResetting ? "Clearing…" : "Yes, start over"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    </ToolsLayout>
  );
}
