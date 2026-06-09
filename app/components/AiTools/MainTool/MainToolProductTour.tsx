"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Joyride, {
  ACTIONS,
  EVENTS,
  STATUS,
  type CallBackProps,
  type Step,
  type TooltipRenderProps,
} from "react-joyride";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  completeAcademicResearchTour,
  completeStudyWorkspaceTour,
  getProductTourState,
} from "./academicResearchApi";

const normalizePath = (path: string | null) => {
  if (!path) return "";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

function TourTooltipFactory(onEndTour: () => void) {
  return function MainToolTourTooltip(props: TooltipRenderProps) {
    const {
      backProps,
      closeProps,
      continuous,
      index,
      isLastStep,
      primaryProps,
      size,
      step,
      tooltipProps,
    } = props;

    return (
      <div
        {...tooltipProps}
        className="max-w-[min(92vw,22rem)] rounded-xl border border-gray-200 bg-white p-4 text-left shadow-xl"
      >
        <div className="text-sm leading-relaxed text-gray-700">{step.content}</div>
        {continuous && size > 1 && (
          <p className="mt-2 text-xs font-medium text-gray-400">
            Step {index + 1} of {size}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <button
            type="button"
            className="text-xs font-semibold text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
            onClick={onEndTour}
          >
            End tour
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {index > 0 && (
              <button
                type="button"
                {...backProps}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              />
            )}
            <button
              type="button"
              {...primaryProps}
              className="rounded-lg bg-primary-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-500"
            >
              {isLastStep ? "Done" : "Next"}
            </button>
            <button type="button" {...closeProps} className="hidden" />
          </div>
        </div>
      </div>
    );
  };
}

type MainToolProductTourProps = {
  tourEditorActive: boolean;
  restartNonce?: number;
};

type TourVariant = "academic-research" | "study-workspace";

const TOUR_VARIANTS: Record<
  TourVariant,
  {
    route: string;
    completeTour: () => Promise<unknown>;
    isCompleted: (state: {
      academic_research_assistant_tour_completed: boolean;
      ai_study_workspace_tour_completed: boolean;
    }) => boolean;
    buildSteps: (tourEditorActive: boolean) => Step[];
  }
> = {
  "academic-research": {
    route: "/tools/academic-research-assistant",
    completeTour: completeAcademicResearchTour,
    isCompleted: (state) => !!state.academic_research_assistant_tour_completed,
    buildSteps: (tourEditorActive) => {
      const workspaceStep: Step = tourEditorActive
        ? {
            target: '[data-tour="ara-editor"]',
            placement: "top",
            disableBeacon: true,
            title: "Your document",
            content:
              "Write and structure your paper here. Open Documents in the sidebar to create or switch drafts.",
          }
        : {
            target: '[data-tour="ara-welcome-screen"]',
            placement: "bottom",
            disableBeacon: true,
            title: "Get started",
            content:
              "Set a title, describe your topic, generate headings, or start from a blank page. You can also import a Word file.",
          };

      return [
        {
          target: "body",
          placement: "center",
          disableBeacon: true,
          title: "Welcome",
          content:
            "This short tour introduces the Academic Research Assistant: your workspace for drafting, sources, and AI help. Use Next to continue, or End tour anytime to finish and save your progress.",
        },
        {
          target: '[data-tour="ara-sidebar"]',
          placement: "right",
          disableBeacon: true,
          title: "Sidebar",
          content:
            "Use the sidebar for your account, tools list, and token usage. On this tool you will also find New document plus Documents, Library, and AI Chat.",
        },
        {
          target: '[data-tour="ara-assistant-panels"]',
          placement: "right",
          disableBeacon: true,
          title: "Documents, Library & AI Chat",
          content:
            "Documents lists your drafts. Library stores sources for citations. AI Chat answers questions about your draft using your document as context.",
        },
        {
          target: '[data-tour="ara-main-workspace"]',
          placement: "left",
          disableBeacon: true,
          title: "Main workspace",
          content:
            "The header shows your document title and actions. The main area is your editor. On smaller screens, use the menu icon to show the sidebar.",
        },
        {
          target: '[data-tour="ara-header"]',
          placement: "bottom",
          disableBeacon: true,
          title: "Toolbar",
          content:
            "Toggle autocomplete, export your work, publish, or open settings. Title changes sync with your document.",
        },
        workspaceStep,
        {
          target: '[data-tour="ara-main-workspace"]',
          placement: "top",
          disableBeacon: true,
          title: "Selection & AI",
          content:
            "When you are in the editor, select any text to open the floating toolbar. Use Chat for AI about the selection, Humanizer for tone, or Citation to insert references.",
        },
      ];
    },
  },
  "study-workspace": {
    route: "/tools/main-tool",
    completeTour: completeStudyWorkspaceTour,
    isCompleted: (state) => !!state.ai_study_workspace_tour_completed,
    buildSteps: (tourEditorActive) => {
      const workspaceStep: Step = tourEditorActive
        ? {
            target: '[data-tour="ara-editor"]',
            placement: "top",
            disableBeacon: true,
            title: "Your document",
            content:
              "Write and refine your work here. Create a new document from the welcome screen or continue an open draft.",
          }
        : {
            target: '[data-tour="ara-welcome-screen"]',
            placement: "bottom",
            disableBeacon: true,
            title: "Get started",
            content:
              "Set a title, describe your topic, generate headings, or start from a blank page. You can also import a Word file.",
          };

      return [
        {
          target: "body",
          placement: "center",
          disableBeacon: true,
          title: "Welcome",
          content:
            "This short tour introduces the AI Study Workspace: your focused editor for drafting and AI-assisted writing. Use Next to continue, or End tour anytime to finish and save your progress.",
        },
        {
          target: '[data-tour="ara-sidebar"]',
          placement: "right",
          disableBeacon: true,
          title: "Sidebar",
          content:
            "Use the sidebar for your account, the tools list, token usage, and How to Use whenever you want to run this tour again.",
        },
        {
          target: '[data-tour="ara-main-workspace"]',
          placement: "left",
          disableBeacon: true,
          title: "Main workspace",
          content:
            "The header shows your document title and actions. The main area is your editor. On smaller screens, use the menu icon to show the sidebar.",
        },
        {
          target: '[data-tour="ara-header"]',
          placement: "bottom",
          disableBeacon: true,
          title: "Toolbar",
          content:
            "Toggle autocomplete, export your work, publish, or open settings. Title changes sync with your document.",
        },
        workspaceStep,
        {
          target: '[data-tour="ara-main-workspace"]',
          placement: "top",
          disableBeacon: true,
          title: "Selection & AI",
          content:
            "When you are in the editor, select any text to open the floating toolbar. Use Chat for AI help on the selection or Humanizer to adjust tone.",
        },
      ];
    },
  },
};

const MainToolProductTour: React.FC<MainToolProductTourProps> = ({
  tourEditorActive,
  restartNonce = 0,
}) => {
  const pathname = usePathname();
  const normalized = normalizePath(pathname);

  const variant: TourVariant | null =
    normalized === TOUR_VARIANTS["academic-research"].route
      ? "academic-research"
      : normalized === TOUR_VARIANTS["study-workspace"].route
        ? "study-workspace"
        : null;

  const config = variant ? TOUR_VARIANTS[variant] : null;

  const [loading, setLoading] = useState(true);
  const [tourCompleted, setTourCompleted] = useState(true);
  const [run, setRun] = useState(false);
  const finalizedRef = useRef(false);

  const finalizeTour = useCallback(async () => {
    if (!config || finalizedRef.current) return;
    finalizedRef.current = true;
    try {
      await config.completeTour();
      setTourCompleted(true);
    } catch {
      finalizedRef.current = false;
      toast.error("Could not save tour completion. Please try again.");
    }
  }, [config]);

  const handleEndTour = useCallback(() => {
    void (async () => {
      await finalizeTour();
      setRun(false);
    })();
  }, [finalizeTour]);

  const TooltipComponent = useMemo(
    () => TourTooltipFactory(handleEndTour),
    [handleEndTour],
  );

  useEffect(() => {
    if (!config) return;

    let cancelled = false;
    let startTimer: number | undefined;
    setLoading(true);

    getProductTourState()
      .then((state) => {
        if (cancelled) return;
        const done = config.isCompleted(state);
        setTourCompleted(done);
        finalizedRef.current = false;
        if (!done) {
          startTimer = window.setTimeout(() => {
            if (!cancelled) setRun(true);
          }, 600) as unknown as number;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTourCompleted(true);
          setRun(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (startTimer) window.clearTimeout(startTimer);
    };
  }, [config]);

  useEffect(() => {
    if (!config || restartNonce < 1) return;
    finalizedRef.current = false;
    setRun(true);
  }, [config, restartNonce]);

  const steps = useMemo(
    () => (config ? config.buildSteps(tourEditorActive) : []),
    [config, tourEditorActive],
  );

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, action } = data;

      if (type === EVENTS.TARGET_NOT_FOUND) {
        setRun(false);
        toast.error("Tour could not find a screen element. Refresh and try again.");
        return;
      }

      if (status === STATUS.FINISHED) {
        void finalizeTour();
        setRun(false);
        return;
      }

      if (status === STATUS.SKIPPED) {
        setRun(false);
        return;
      }

      if (
        status === STATUS.RUNNING &&
        type === EVENTS.STEP_AFTER &&
        action === ACTIONS.CLOSE
      ) {
        setRun(false);
      }
    },
    [finalizeTour],
  );

  if (!config || loading || (tourCompleted && !run)) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton={false}
      hideCloseButton
      disableCloseOnEsc
      disableOverlayClose
      scrollToFirstStep
      scrollOffset={80}
      callback={handleJoyrideCallback}
      tooltipComponent={TooltipComponent}
      floaterProps={{
        disableAnimation: false,
        styles: {
          floater: { filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.12))" },
        },
      }}
      styles={{
        options: {
          zIndex: 10050,
          primaryColor: "#2b7fff",
          textColor: "#1f2937",
          backgroundColor: "#ffffff",
          arrowColor: "#ffffff",
          overlayColor: "rgba(15, 23, 42, 0.72)",
        },
        spotlight: {
          borderRadius: 12,
        },
      }}
      locale={{ back: "Back", next: "Next", last: "Done" }}
    />
  );
};

export default MainToolProductTour;
