"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ToolsLayout from "@/app/components/AiTools/ToolsLayout";
import HumanizerTool from "@/app/components/AiTools/HumanizerTool/HumanizerTool";

export default function HumanizerPage() {
  const [flag, setFlag] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("access_token");
    if (!isAuthenticated) {
      router.replace("/sign-in?returnUrl=/tools/humanizer-tool");
    }
  }, [router]);

  return (
    <Suspense
      fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-72" />}
    >
      <ToolsLayout setFlag={setFlag} flag={flag}>
        <HumanizerTool />
      </ToolsLayout>
    </Suspense>
  );
}

