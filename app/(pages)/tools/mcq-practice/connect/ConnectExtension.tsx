"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getOrRefreshAccessToken } from "@/app/lib/authSession";

type ChromeRuntime = {
  lastError?: unknown;
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback: (response?: { ok?: boolean }) => void,
  ) => void;
};

// Fixed by "key" in the extension's manifest. The login token only ever goes to
// this id, so no other extension can receive it.
const MCQ_EXTENSION_ID = "knooemamppkbebedclhgbjnkchlenpfd";

export default function ConnectExtension() {
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState("Connecting your account...");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const accessToken = await getOrRefreshAccessToken().catch(() => null);
      if (cancelled) return;
      if (!accessToken) {
        router.replace(`/sign-in/?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      const runtime = (window as Window & { chrome?: { runtime?: ChromeRuntime } })
        .chrome?.runtime;
      if (!runtime?.sendMessage) {
        setMessage("Open this page in Chrome with the extension installed.");
        return;
      }
      runtime.sendMessage(
        MCQ_EXTENSION_ID,
        { type: "SH_MCQ_CONNECT", accessToken },
        (response) => {
          // On success the extension closes this tab.
          if (runtime.lastError || !response?.ok) {
            setMessage("Couldn't reach the extension. Please try again.");
          }
        },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <p>{message}</p>;
}
