"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import AiTutorChat from "@/app/components/AiTools/Tutor/AiTutorChat";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ToolWithExplore from "@/app/components/AiTools/ToolWithExplore";
import ProductSchema from "@/app/components/ProductSchema";
import StudyAuthGateModal from "@/app/components/AiTools/StudyWorkspace/StudyAuthGateModal";

function TutorPageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<"query" | "session">("query");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

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

  return (
    <>
      <ProductSchema
        productTitle="AI Tutor - Scholarly Help"
        metaDescription="Learn from your course material with source-grounded tutoring, adaptive practice, and progress tracking."
        pageUrl={`${baseUrl}/tools/tutor`}
      />
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ToolWithExplore>
          <AiTutorChat initialSessionId={sessionId || undefined} />
        </ToolWithExplore>
      </ToolsLayout>

      {gateOpen ? (
        <StudyAuthGateModal
          open={gateOpen}
          reason={gateReason}
          returnUrl={`${pathname || "/tools/tutor"}${
            sessionId ? `?sessionId=${sessionId}` : ""
          }`}
          onClose={() => setGateOpen(false)}
        />
      ) : null}
    </>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <TutorPageContent />
    </Suspense>
  );
}
