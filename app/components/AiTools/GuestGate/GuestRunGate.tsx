"use client";

import { useEffect, useState } from "react";
import GuestAuthGateModal from "./GuestAuthGateModal";

/**
 * Mounted once globally (see ClientScripts.tsx). Opens the sign-up gate when
 * the server reports GUEST_RUN_LIMIT_EXCEEDED, i.e. this guest's free try was
 * already used (possibly in another browser on the same network), even though
 * this browser's own click counter still allowed the click.
 */
export default function GuestRunGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onLimitExceeded = () => setOpen(true);
    window.addEventListener("guest:run-limit-exceeded", onLimitExceeded);
    return () => window.removeEventListener("guest:run-limit-exceeded", onLimitExceeded);
  }, []);

  return <GuestAuthGateModal open={open} onClose={() => setOpen(false)} />;
}
