"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import DashboardGate from "@/app/components/AiTools/Dashboard/DashboardGate";
import { appendQueryString } from "@/app/utils/url";
import { initializeAuthSession } from "@/app/lib/authSession";
import LowCreditBanner from "@/app/components/AiTools/Dashboard/LowCreditBanner";

export default function DashboardPageContent() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  // Signed-out visitors go to sign in. The query string is read inside the
  // effect rather than through useSearchParams, so the page can render on the
  // server instead of showing the full-screen loader until JavaScript loads.
  useEffect(() => {
    let active = true;
    void initializeAuthSession().then((token) => {
      if (!active || token) return;
      const currentQs = window.location.search.slice(1);
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const returnTo = `${pathname || "/tools/dashboard"}${currentQs ? `?${currentQs}` : ""}`;
      router.replace(appendQueryString(signInBase, `returnUrl=${encodeURIComponent(returnTo)}`));
    });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return (
    <ToolsLayout setFlag={setFlag} flag={flag}>
      <LowCreditBanner />
      <DashboardGate mode="inline" />
    </ToolsLayout>
  );
}
