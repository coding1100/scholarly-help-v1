"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import DashboardGate from "@/app/components/AiTools/Dashboard/DashboardGate";
import { appendQueryString } from "@/app/utils/url";
import {
  getActiveStudySessionId,
  listStudySessions,
  setActiveStudySessionId,
} from "@/app/utils/studyApiClient";
import { initializeAuthSession } from "@/app/lib/authSession";

export default function DashboardPageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;

    async function bootstrapStudySession() {
      if (!(await initializeAuthSession())) {
        const currentQs = window.location.search.slice(1);
        const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
        const returnTo = `${pathname || "/tools/dashboard"}${currentQs ? `?${currentQs}` : ""}`;
        router.replace(appendQueryString(signInBase, `returnUrl=${encodeURIComponent(returnTo)}`));
        return;
      }

      const qsSessionId = searchParams.get("sessionId");
      const localSessionId = getActiveStudySessionId();
      const sessions = await listStudySessions();

      let resolvedSession =
        (qsSessionId && sessions.find((s) => s._id === qsSessionId)) ||
        (localSessionId && sessions.find((s) => s._id === localSessionId)) ||
        sessions[0];

      // Sessions are created only when the user adds their first source.
      if (!active || !resolvedSession) return;
      setActiveStudySessionId(resolvedSession._id);

      const nextParams = new URLSearchParams(searchParams.toString());
      if (nextParams.get("sessionId") !== resolvedSession._id) {
        nextParams.set("sessionId", resolvedSession._id);
        const nextHref = appendQueryString(pathname || "/tools/dashboard", nextParams.toString());
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
      <DashboardGate mode="inline" />
    </ToolsLayout>
  );
}
