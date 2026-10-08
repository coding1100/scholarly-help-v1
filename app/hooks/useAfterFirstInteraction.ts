"use client";

import { useEffect, useState } from "react";

const INTERACTION_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * True once the visitor first taps, types or scrolls, or `timeoutMs` after
 * mount, whichever comes first. Used to keep third-party tags and widgets
 * out of the initial page load.
 */
export const useAfterFirstInteraction = (timeoutMs: number) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const stopListening = () => {
      window.clearTimeout(timer);
      INTERACTION_EVENTS.forEach((event) => window.removeEventListener(event, markReady));
    };
    function markReady() {
      stopListening();
      setReady(true);
    }

    timer = window.setTimeout(markReady, timeoutMs);
    INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, markReady, { passive: true }),
    );
    return stopListening;
  }, [timeoutMs]);

  return ready;
};
