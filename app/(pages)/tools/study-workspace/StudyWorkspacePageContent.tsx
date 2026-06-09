"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import StudySourceIngestion from "@/app/components/AiTools/Dashboard/StudySourceIngestion";
import StudyWorkspace from "@/app/components/AiTools/Dashboard/StudyWorkspace";
import { appendQueryString } from "@/app/utils/url";
import {
  createStudySession,
  getActiveStudySessionId,
  listStudySessions,
  setActiveStudySessionId,
} from "@/app/utils/studyApiClient";

export default function StudyWorkspacePageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      <main className="h-[90vh] overflow-y-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <StudySourceIngestion />
        <StudyWorkspace />
      </main>
    </ToolsLayout>
  );
}
