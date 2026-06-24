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
  createStudySession,
  getActiveStudySessionId,
  getStudySessionDetails,
  listStudySessions,
  setActiveStudySessionId,
} from "@/app/utils/studyApiClient";
import {
  incrementGuestSessionCount,
  isGuest,
  takePendingGuestMigrationId,
} from "@/app/lib/client/guestStudyLimits";

export default function StudyWorkspacePageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const [hasSessionContent, setHasSessionContent] = useState<boolean | null>(null);
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

      let resolvedSession =
        (qsSessionId && sessions.find((s) => s._id === qsSessionId)) ||
        (localSessionId && sessions.find((s) => s._id === localSessionId)) ||
        sessions[0];

      if (!resolvedSession) {
        // Bootstrap (initial page load) is never gated — a guest always gets
        // their first session created automatically here. The email gate lives
        // only on the explicit "+ New Study Session" button (see
        // StudySourceIngestion), which fires on the 2nd-session attempt. We
        // still count this first session so that button knows the limit is hit.
        resolvedSession = await createStudySession("My Study Session");
        if (isGuest()) incrementGuestSessionCount();
      }

      if (!active) return;
      setActiveStudySessionId(resolvedSession._id);

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
    });

    return () => {
      active = false;
    };
  }, [pathname, router, searchParams, ensureGuestMigration]);

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
      setHasSessionContent(null);
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

  const isBootstrapping = !sessionId || hasSessionContent === null;
  const showWorkspace = hasSessionContent === true || isRecording;
  const showOnboarding = !isBootstrapping && !showWorkspace;

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      {/* ToolsLayout clones its single child element to inject `token`, so the
          page must pass exactly one element here — wrap the workspace and the
          auth-gate modal in a fragment. */}
      <>
        <main
          className={`bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 ${
            showOnboarding
              ? "flex h-[calc(100vh-8vh)] min-h-0 flex-col overflow-hidden"
              : "h-[90vh] overflow-y-auto"
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
              onContentReady={() => setHasSessionContent(true)}
            />
            {showWorkspace ? <StudyWorkspace /> : null}
            {showWorkspace ? <ToolGrid /> : null}
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
      </>
    </ToolsLayout>
  );
}
