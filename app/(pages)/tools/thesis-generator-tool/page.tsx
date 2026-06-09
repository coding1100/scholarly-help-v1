"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import ThesisGenerator from "@/app/components/AiTools/ThesisGenerator-tool";
import { appendQueryString } from "@/app/utils/url";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
// import ThemeToggle from "@/app/components/AiLandingPage/ThemeToggle";

const Page = () => {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token");
    if (!isAuthenticated) {
      const currentQs =
        typeof window !== "undefined" ? window.location.search.slice(1) : "";
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const returnTo = `${pathname || "/tools/thesis-generator-tool"}${currentQs ? `?${currentQs}` : ""}`;
      router.replace(
        appendQueryString(
          signInBase,
          `returnUrl=${encodeURIComponent(returnTo)}`,
        ),
      );
    }
  }, [pathname, router]);

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      {/* <ThemeToggle top="top-12" /> */}
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <ThesisGenerator />
      </ToolsLayout>
    </Suspense>
  );
};

export default Page;
