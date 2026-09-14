"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import StudySourceIngestion from "@/app/components/AiTools/Dashboard/StudySourceIngestion";
import StudyWorkspace from "@/app/components/AiTools/Dashboard/StudyWorkspace";
import StudyAuthGateModal from "@/app/components/AiTools/StudyWorkspace/StudyAuthGateModal";
import { appendQueryString } from "@/app/utils/url";
import { setActiveStudySessionId } from "@/app/utils/studyApiClient";

/**
 * The live Study Workspace embedded in the landing hero.
 *
 * Only the two pieces the landing page needs are mounted: the ingestion card
 * ("Name your session" + File/Link/Text) and, once content exists, the
 * workspace itself (Original Content / AI Notes / Summary / Flashcards /
 * Quizzes + AI Tutor). The dashboard chrome (ToolsLayout shell, session
 * sidebar, tool grid) is intentionally left out.
 *
 * Split out of StudyHero so that only this subtree — which needs
 * useSearchParams, and therefore a Suspense boundary — is client-rendered. The
 * hero's marketing copy stays server-rendered for SEO.
 */
const StudyToolEmbed: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // Reveal the workspace only after the user's first successful upload, so the
  // hero opens on the clean ingestion card exactly like the tool page does.
  const [hasSessionContent, setHasSessionContent] = useState(false);

  // Once a guest's free AI-action allowance is used up, StudyWorkspace
  // (mounted below once hasSessionContent is true) dispatches "study:auth-gate"
  // instead of calling the AI directly — see runGeneration() in
  // AiTools/Dashboard/StudyWorkspace.tsx. The dashboard tool page
  // (StudyWorkspacePageContent.tsx) listens for this and opens
  // StudyAuthGateModal; this embed is the same child component reused on the
  // landing page, so without its own listener the event fires into the void
  // and clicking "Generate" after the free action just silently does nothing.
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<"query" | "session">("query");

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

  // A session already in the URL (return visit / shared link) shows the workspace.
  useEffect(() => {
    if (sessionId) setHasSessionContent(true);
  }, [sessionId]);

  /** Adopt a lazily-created session: mark it active and put it in the URL. */
  const adoptCreatedSession = useCallback(
    (createdId: string) => {
      setActiveStudySessionId(createdId);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("sessionId", createdId);
      router.replace(
        appendQueryString(
          pathname || "/tools/ai-study-workspace",
          nextParams.toString(),
        ),
      );
      setHasSessionContent(true);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_24px_50px_-20px_rgba(43,28,80,0.35)] md:p-6">
      <StudySourceIngestion
        variant="onboarding"
        onSessionCreated={adoptCreatedSession}
        onContentReady={() => setHasSessionContent(true)}
      />
      {hasSessionContent ? <StudyWorkspace /> : null}

      {gateOpen ? (
        <StudyAuthGateModal
          open={gateOpen}
          reason={gateReason}
          returnUrl={`${pathname || "/tools/ai-study-workspace"}${
            sessionId ? `?sessionId=${sessionId}` : ""
          }`}
          onClose={() => setGateOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default StudyToolEmbed;
