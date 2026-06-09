"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";
import { appendQueryString } from "@/app/utils/url";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

export default function HumanizerPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token");
    if (!isAuthenticated) {
      const currentQs =
        typeof window !== "undefined" ? window.location.search.slice(1) : "";
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const returnTo = `${pathname || "/tools/humanizer-tool"}${currentQs ? `?${currentQs}` : ""}`;
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
      fallback={<ToolsSuspenseFallback />}
    >
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <HumanizerTool />
      </ToolsLayout>
    </Suspense>
  );
}

