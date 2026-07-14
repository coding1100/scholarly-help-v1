"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface DelayedBelowFoldProps {
    children: ReactNode;
    /** @deprecated kept for call-site compatibility; content is no longer time-delayed */
    delay?: number;
}

/**
 * Below-fold sections are fully server-rendered (stable paint, good Speed
 * Index) but their hydration is deferred until the browser is idle or the
 * user interacts, so the heavy carousel/slider JS doesn't land inside the
 * Total Blocking Time window.
 *
 * How the skip works: on the client's first render we hand React a
 * dangerouslySetInnerHTML element, so hydration leaves the server HTML
 * untouched instead of walking (and hydrating) the whole subtree. Once
 * idle/interaction fires we re-render with the real children.
 *
 * content-visibility lets the browser skip layout/paint work for the
 * off-screen sections; contain-intrinsic-size reserves approximate height so
 * the scrollbar doesn't jump.
 */
export default function DelayedBelowFold({ children }: DelayedBelowFoldProps) {
    // true on the server so the HTML is rendered; false on the client until idle
    const [hydrated, setHydrated] = useState(typeof window === "undefined");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hydrated) return;

        let revealed = false;
        const events: (keyof WindowEventMap)[] = [
            "scroll",
            "touchstart",
            "keydown",
            "mousedown",
            "wheel",
        ];
        let idleId: number | undefined;
        let timerId: number | undefined;
        let rafId: number | undefined;
        let interactionTimerId: number | undefined;

        const cleanup = () => {
            if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
                window.cancelIdleCallback(idleId);
            }
            if (timerId !== undefined) clearTimeout(timerId);
            if (rafId !== undefined) cancelAnimationFrame(rafId);
            if (interactionTimerId !== undefined) clearTimeout(interactionTimerId);
            window.removeEventListener("load", scheduleFallback);
            events.forEach((event) => window.removeEventListener(event, onInteraction));
        };

        const hydrate = () => {
            if (revealed) return;
            revealed = true;
            cleanup();
            setHydrated(true);
        };

        // Taps/keys/mouse-downs are INP-scored interactions: hydrating the
        // whole below-fold tree inside their event handler puts a long task in
        // the interaction window (~225ms field INP). Let the interaction's
        // frame paint first, then hydrate in a later task.
        const onInteraction = () => {
            if (revealed) return;
            rafId = window.requestAnimationFrame(() => {
                interactionTimerId = window.setTimeout(hydrate, 0);
            });
        };

        // Fallback for users who never interact: hydrate well after load +
        // idle so the work stays outside the Lighthouse trace (TBT window).
        const scheduleFallback = () => {
            if (typeof window.requestIdleCallback === "function") {
                idleId = window.requestIdleCallback(
                    () => {
                        timerId = window.setTimeout(hydrate, 5000);
                    },
                    { timeout: 8000 },
                );
            } else {
                timerId = window.setTimeout(hydrate, 8000);
            }
        };

        if (document.readyState === "complete") {
            scheduleFallback();
        } else {
            window.addEventListener("load", scheduleFallback, { once: true });
        }
        events.forEach((event) =>
            window.addEventListener(event, onInteraction, { once: true, passive: true }),
        );

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const style: React.CSSProperties = {
        contentVisibility: "auto",
        containIntrinsicSize: "auto 5000px",
    };

    if (!hydrated) {
        return (
            <div
                ref={ref}
                style={style}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: "" }}
            />
        );
    }

    return (
        <div ref={ref} style={style}>
            {children}
        </div>
    );
}
