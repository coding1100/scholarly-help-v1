"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import StudySourceIngestion from "@/app/components/AiTools/Dashboard/StudySourceIngestion";
import StudyWorkspace from "@/app/components/AiTools/Dashboard/StudyWorkspace";
import { appendQueryString } from "@/app/utils/url";
import {
  getStudyRecordingSnapshot,
  onStudyRecordingChange,
} from "@/app/lib/client/studyRecording";
import {
  createStudySession,
  getActiveStudySessionId,
  getStudySessionDetails,
  listStudySessions,
  setActiveStudySessionId,
} from "@/app/utils/studyApiClient";

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

  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("access_token") || localStorage.getItem("authToken");
    if (!isAuthenticated) {
      const currentQs =
        typeof window !== "undefined" ? window.location.search.slice(1) : "";
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const returnTo = `${pathname || "/tools/study-workspace"}${currentQs ? `?${currentQs}` : ""}`;
      router.replace(
        appendQueryString(
          signInBase,
          `returnUrl=${encodeURIComponent(returnTo)}`,
        ),
      );
    }
  }, [pathname, router]);

  useEffect(() => {
    let active = true;

    async function bootstrapStudySession() {
      const isAuthenticated =
        localStorage.getItem("access_token") ||
        localStorage.getItem("authToken");
      if (!isAuthenticated) return;

      const qsSessionId = searchParams.get("sessionId");
      const localSessionId = getActiveStudySessionId();
      const sessions = await listStudySessions();

      let resolvedSession =
        (qsSessionId && sessions.find((s) => s._id === qsSessionId)) ||
        (localSessionId && sessions.find((s) => s._id === localSessionId)) ||
        sessions[0];

      if (!resolvedSession) {
        resolvedSession = await createStudySession("My Study Session");
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
  }, [pathname, router, searchParams]);

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
          </>
        )}
      </main>
    </ToolsLayout>
  );
}
