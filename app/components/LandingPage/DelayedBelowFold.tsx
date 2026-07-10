"use client";

import { ReactNode, useEffect, useState } from "react";

interface DelayedBelowFoldProps {
    children: ReactNode;
    delay?: number;
}

/**
 * Defers rendering of below-fold content so the browser prioritizes the Hero
 * section for LCP. Content appears on the first user interaction (scroll,
 * touch, key, mouse) or after `delay` ms — whichever comes first — so real
 * visitors who scroll immediately never see a gap.
 */
export default function DelayedBelowFold({ children, delay = 2000 }: DelayedBelowFoldProps) {
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (shouldRender) return;

        let revealed = false;
        const events: (keyof WindowEventMap)[] = [
            "scroll",
            "touchstart",
            "keydown",
            "mousedown",
            "wheel",
        ];

        const reveal = () => {
            if (revealed) return;
            revealed = true;
            cleanup();
            setShouldRender(true);
        };

        const timer = setTimeout(reveal, delay);

        const cleanup = () => {
            clearTimeout(timer);
            events.forEach((event) => window.removeEventListener(event, reveal));
        };

        events.forEach((event) =>
            window.addEventListener(event, reveal, { once: true, passive: true }),
        );

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [delay]);

    if (!shouldRender) {
        return null;
    }

    return <>{children}</>;
}
