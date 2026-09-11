"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import toast from "react-hot-toast";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import { useToolDraftPersistence } from "@/app/lib/client/useToolDraftPersistence";
import { useBillingDraftStash } from "@/app/lib/client/useBillingDraftStash";
import { isBillingGateError } from "@/app/lib/client/billingGateCodes";
import { looksLikeGibberish } from "@/app/utils/text";
import { trackToolGenerate } from "@/app/utils/toolsSheetClient";
import * as api from "./api";
import styles from "./homework-helper.module.css";
import type {
  DetectionResponseDTO,
  HomeworkMode,
  HomeworkSessionDTO,
  ScreenName,
} from "./types";

import HomeScreen from "./screens/HomeScreen";
import AnalyzingScreen from "./screens/AnalyzingScreen";
import PickQuestionsScreen from "./screens/PickQuestionsScreen";
import DetectedScreen from "./screens/DetectedScreen";
import ModeSelectScreen from "./screens/ModeSelectScreen";
import StepByStepScreen from "./screens/StepByStepScreen";
import SocraticScreen from "./screens/SocraticScreen";
import ExplainScreen from "./screens/ExplainScreen";
import CheckWorkScreen from "./screens/CheckWorkScreen";
import ShowSolutionScreen from "./screens/ShowSolutionScreen";
import CompleteScreen from "./screens/CompleteScreen";
import PracticeScreen from "./screens/PracticeScreen";
import MyHomeworkScreen from "./screens/MyHomeworkScreen";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--hh-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--hh-mono" });

type HomeworkDraft = { text: string };

const HomeworkHelperTool: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [session, setSession] = useState<HomeworkSessionDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [detection, setDetection] = useState<DetectionResponseDTO | null>(null);
  /** Sessions created from the current detection, worked through one at a time. */
  const [queue, setQueue] = useState<HomeworkSessionDTO[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const requestControllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestControllerRef.current?.abort(), []);

  const { stashDraft } = useToolDraftPersistence<HomeworkDraft>("homework-helper", (draft) => {
    if (draft.text) setPasteText(draft.text);
  });
  useBillingDraftStash<HomeworkDraft>("homework-helper", () => ({ text: pasteText }));
  const { gateOpen, closeGate, guardAiClick } = useGuestGate<HomeworkDraft>({
    getDraft: () => ({ text: pasteText }),
    stashDraft,
  });

  const showApiError = useCallback((err: any, fallback: string) => {
    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback;
    if (status === 401) {
      toast.error("Session expired. Please sign in again.");
    } else if (isBillingGateError(err)) {
      // Global interceptor already opens the upgrade popup.
    } else if (status === 403) {
      toast.error("You don't have enough token balance, or the input exceeds limits.");
    } else if (status === 429) {
      toast.error("Too many requests — please wait a moment and try again.");
    } else {
      toast.error(Array.isArray(message) ? message.join(", ") : String(message));
    }
  }, []);

  const goHome = useCallback(() => {
    setSession(null);
    setDetection(null);
    setQueue([]);
    setQueueIndex(0);
    setScreen("home");
  }, []);

  const openMyHomework = useCallback(() => setScreen("myhomework"), []);

  const runDetect = useCallback(
    async (fn: (signal: AbortSignal) => Promise<DetectionResponseDTO>) => {
      setScreen("analyzing");
      setLoading(true);
      requestControllerRef.current?.abort();
      const controller = new AbortController();
      requestControllerRef.current = controller;
      try {
        const result = await fn(controller.signal);
        setDetection(result);
        // A single detected question skips the picker — matches the prototype's
        // "1 question found" straight-through flow. A worksheet with several
        // questions stops at the picker so the student chooses which to work on.
        if (result.questions.length === 1) {
          const created = await api.createSessionsFromDetection(result.detection_id, [0]);
          setQueue(created);
          setQueueIndex(0);
          setSession(created[0]);
          setScreen("detected");
        } else {
          setScreen("pickQuestions");
        }
        trackToolGenerate({ tool: "homework-helper" } as any);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        showApiError(err, "Could not read that question. Please try again.");
        setScreen("home");
      } finally {
        setLoading(false);
      }
    },
    [showApiError],
  );

  const confirmQuestionSelection = useCallback(
    async (selectedIndices: number[]) => {
      if (!detection) return;
      setLoading(true);
      try {
        const created = await api.createSessionsFromDetection(detection.detection_id, selectedIndices);
        setQueue(created);
        setQueueIndex(0);
        setSession(created[0]);
        setScreen("detected");
      } catch (err: any) {
        showApiError(err, "Could not start those questions. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [detection, showApiError],
  );

  const submitPastedText = useCallback(() => {
    const text = pasteText.trim();
    if (!text) return;
    if (looksLikeGibberish(text)) {
      toast.error("That doesn't look like a question yet — try typing or pasting the actual text.");
      return;
    }
    guardAiClick(() => runDetect((signal) => api.detectFromText(text, signal)));
  }, [pasteText, guardAiClick, runDetect]);

  const submitImage = useCallback(
    (file: File) => {
      guardAiClick(() => runDetect((signal) => api.detectFromImage(file, undefined, signal)));
    },
    [guardAiClick, runDetect],
  );

  const submitDocument = useCallback(
    (file: File) => {
      guardAiClick(() => runDetect((signal) => api.detectFromDocument(file, signal)));
    },
    [guardAiClick, runDetect],
  );

  const resumeSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    try {
      const result = await api.getSession(sessionId);
      setSession(result);
      // Resuming a single session from "My Homework" is not part of a
      // worksheet queue — treat it as a standalone queue of one so
      // "Complete question" goes home instead of advancing a stale queue.
      setQueue([result]);
      setQueueIndex(0);
      if (result.status === "completed") setScreen("complete");
      else if (result.mode) setScreen("solving");
      else setScreen("detected");
    } catch (err: any) {
      toast.error("Could not load that session.");
    } finally {
      setLoading(false);
    }
  }, []);

  const pickMode = useCallback(
    async (mode: HomeworkMode) => {
      if (!session) return;
      setScreen("solving");
      setLoading(true);
      try {
        const result = await api.generateMode(session.session_id, mode);
        setSession(result.session);
      } catch (err: any) {
        showApiError(err, "Could not generate that right now.");
        setScreen("modeSelect");
      } finally {
        setLoading(false);
      }
    },
    [session, showApiError],
  );

  const refreshSession = useCallback(async () => {
    if (!session) return;
    try {
      const result = await api.getSession(session.session_id);
      setSession(result);
    } catch {
      // Best-effort refresh; ignore failures.
    }
  }, [session]);

  const completeQuestion = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await api.completeSession(session.session_id);
      setSession(result);
      setQueue((prev) => prev.map((s) => (s.session_id === result.session_id ? result : s)));
      setScreen("complete");
    } catch (err: any) {
      showApiError(err, "Could not save this. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [session, showApiError]);

  const hasNextInQueue = queueIndex < queue.length - 1;

  /** From the complete screen: move to the next queued question, or go home if this was the last (or only) one. */
  const continueAfterComplete = useCallback(() => {
    if (hasNextInQueue) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setSession(queue[nextIndex]);
      setScreen("detected");
    } else {
      goHome();
    }
  }, [hasNextInQueue, queueIndex, queue, goHome]);

  const goPractice = useCallback(() => setScreen("practice"), []);
  const goModeSelect = useCallback(() => setScreen("modeSelect"), []);

  return (
    <div
      className={`${styles.wrap} ${serif.variable} ${mono.variable} max-w-[760px] mx-auto px-4 md:px-5 pb-16 pt-4`}
    >
      <ToolsApiLoader show={loading} contained />
      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />

      <div key={`${screen}:${session?.mode || ""}`} className={styles.screenEnter}>
      {screen === "home" && (
        <HomeScreen
          pasteText={pasteText}
          setPasteText={setPasteText}
          onSubmitText={submitPastedText}
          onSubmitImage={submitImage}
          onSubmitDocument={submitDocument}
          onOpenMyHomework={openMyHomework}
          onResumeSession={resumeSession}
        />
      )}

      {screen === "analyzing" && <AnalyzingScreen />}

      {screen === "pickQuestions" && detection && (
        <PickQuestionsScreen
          questions={detection.questions}
          onContinue={confirmQuestionSelection}
          onBack={goHome}
        />
      )}

      {screen === "detected" && session && (
        <DetectedScreen
          session={session}
          queuePosition={queue.length > 1 ? { index: queueIndex, total: queue.length } : null}
          onChange={async (patch) => {
            try {
              const updated = await api.updateDetection(session.session_id, patch);
              setSession(updated);
              setQueue((prev) => prev.map((s) => (s.session_id === updated.session_id ? updated : s)));
              toast.success("Details updated");
            } catch (err: any) {
              showApiError(err, "Could not update details.");
            }
          }}
          onContinue={goModeSelect}
        />
      )}

      {screen === "modeSelect" && session && (
        <ModeSelectScreen session={session} onPickMode={pickMode} />
      )}

      {screen === "solving" && session && session.mode === "stepbystep" && (
        <StepByStepScreen
          session={session}
          loading={loading}
          onAsk={async (stepIndex, question) => {
            const res = await api.askAboutStep(session.session_id, stepIndex, question);
            return res.response;
          }}
          onPropose={async (proposal) => {
            const res = await api.proposeMethod(session.session_id, proposal);
            return res.response;
          }}
          onComplete={completeQuestion}
        />
      )}

      {screen === "solving" && session && session.mode === "socratic" && (
        <SocraticScreen
          session={session}
          onAnswer={(qIndex, answer) => api.answerSocratic(session.session_id, qIndex, answer)}
          onHint={(qIndex) => api.getSocraticHint(session.session_id, qIndex)}
          onComplete={completeQuestion}
        />
      )}

      {screen === "solving" && session && session.mode === "explain" && (
        <ExplainScreen session={session} onPickMode={pickMode} />
      )}

      {screen === "solving" && session && session.mode === "checkwork" && (
        <CheckWorkScreen
          session={session}
          onCheck={(attempt) => api.checkWork(session.session_id, attempt)}
          onPickMode={pickMode}
          onComplete={completeQuestion}
        />
      )}

      {screen === "solving" && session && session.mode === "solution" && (
        <ShowSolutionScreen session={session} onComplete={completeQuestion} />
      )}

      {screen === "complete" && session && (
        <CompleteScreen
          onContinue={continueAfterComplete}
          onPractice={goPractice}
          hasNext={hasNextInQueue}
        />
      )}

      {screen === "practice" && session && (
        <PracticeScreen
          session={session}
          onGenerate={() => api.generatePractice(session.session_id)}
          onAnswer={(qIndex, answer) => api.submitPracticeAnswer(session.session_id, qIndex, answer)}
          onDone={goHome}
          onPracticeAgain={goPractice}
        />
      )}

      {screen === "myhomework" && (
        <MyHomeworkScreen
          onBack={goHome}
          onOpen={resumeSession}
          onList={api.listSessions}
          onDelete={api.deleteSession}
        />
      )}
      </div>
    </div>
  );
};

export default HomeworkHelperTool;
