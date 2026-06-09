"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import CitationTool from "@/app/components/AiTools/CitationTool/CitationTool";
import { appendQueryString } from "@/app/utils/url";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

export default function CitationPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token");
    if (!isAuthenticated) {
      const currentQs =
        typeof window !== "undefined" ? window.location.search.slice(1) : "";
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const returnTo = `${pathname || "/tools/citation-tool"}${currentQs ? `?${currentQs}` : ""}`;
      router.replace(
        appendQueryString(
          signInBase,
          `returnUrl=${encodeURIComponent(returnTo)}`,
        ),
      );
    }
  }, [pathname, router]);

  return (
    <Suspense
      fallback={
        <ToolsSuspenseFallback />
      }
    >
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <CitationTool setFlag={setFlag} />
      </ToolsLayout>
    </Suspense>
  );
}
