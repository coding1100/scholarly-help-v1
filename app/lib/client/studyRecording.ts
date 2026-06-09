"use client";

export type StudyRecordingMode = "microphone" | "browser-tab";
type RecordingStatus = "idle" | "recording" | "stopping";

export interface StudyRecordingResult {
  id: string;
  mode: StudyRecordingMode;
  durationMs: number;
  transcript: string;
  capturedAt: string;
  mediaUrl: string | null;
  mimeType: string | null;
  fileName: string;
}

export interface StudyRecordingSnapshot {
  status: RecordingStatus;
  mode: StudyRecordingMode | null;
  startedAt: number | null;
  transcript: string;
  lastResult: StudyRecordingResult | null;
  previewStream: MediaStream | null;
  /** Web Speech API available (live caption from microphone) */
  liveTranscriptCapable: boolean;
}

type RecordingStore = {
  status: RecordingStatus;
  mode: StudyRecordingMode | null;
  startedAt: number | null;
  transcript: string;
  /** Finalized speech segments (Web Speech API) */
  speechFinalBuffer: string;
  lastResult: StudyRecordingResult | null;
  recorder: MediaRecorder | null;
  stream: MediaStream | null;
  chunks: BlobPart[];
  mimeType: string | null;
  speechRecognizer: SpeechRecognitionLike | null;
  speechRestartTimer: ReturnType<typeof setTimeout> | null;
  /** Mic / speech permission denied — do not spin restart until next recording */
  speechDisabledForSession: boolean;
  pendingStop:
    | null
    | { resolve: (value: StudyRecordingResult | null) => void; reject: (reason?: unknown) => void };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const STORE_KEY = "__studyRecordingStore";
const EVENT_NAME = "study-recording-state";

function initialStore(): RecordingStore {
  return {
    status: "idle",
    mode: null,
    startedAt: null,
    transcript: "",
    speechFinalBuffer: "",
    lastResult: null,
    recorder: null,
    stream: null,
    chunks: [],
    mimeType: null,
    speechRecognizer: null,
    speechRestartTimer: null,
    speechDisabledForSession: false,
    pendingStop: null,
  };
}

function getStore(): RecordingStore {
  const globalAny = globalThis as typeof globalThis & {
    [STORE_KEY]?: RecordingStore;
  };
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = initialStore();
  }
  return globalAny[STORE_KEY]!;
}

function emitState() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getStudyRecordingSnapshot() }));
}

function clearSpeechRestartTimer(store: RecordingStore) {
  if (store.speechRestartTimer) {
    clearTimeout(store.speechRestartTimer);
    store.speechRestartTimer = null;
  }
}

function cleanupStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

function stopSpeechRecognizer(store: RecordingStore) {
  clearSpeechRestartTimer(store);
  if (!store.speechRecognizer) return;
  try {
    store.speechRecognizer.stop();
  } catch {
    // swallow recognition stop errors
  }
  store.speechRecognizer = null;
}

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  const windowAny = window as typeof window & {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition || null;
}

/**
 * Live transcript uses the device microphone (Web Speech API). It runs for both
 * mic-only and browser-tab capture so captions can follow narration; it does not
 * transcribe tab/system audio. Chrome often ends a session after silence — we restart
 * while `MediaRecorder` is still active.
 */
function tryStartSpeechRecognition(store: RecordingStore) {
  if (store.status !== "recording") return;
  if (store.speechRecognizer) return;
  if (store.speechDisabledForSession) return;
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) return;
  try {
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: unknown) => {
      const ev = event as {
        resultIndex?: number;
        results?: ArrayLike<{ length: number; [k: number]: { transcript?: string }; isFinal: boolean }>;
      };
      const results = ev.results;
      const start = typeof ev.resultIndex === "number" ? ev.resultIndex : 0;
      if (!results || results.length === 0) return;
      let interim = "";
      for (let i = start; i < results.length; i += 1) {
        const alt = results[i]?.[0];
        const piece = (alt?.transcript || "").trim();
        if (!piece) continue;
        if (results[i].isFinal) {
          store.speechFinalBuffer = `${store.speechFinalBuffer} ${piece}`.trim();
        } else {
          interim += `${piece} `;
        }
      }
      store.transcript = `${store.speechFinalBuffer}${interim ? ` ${interim.trim()}` : ""}`.trim();
      emitState();
    };
    recognition.onerror = (event: unknown) => {
      const code = (event as { error?: string })?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        store.speechDisabledForSession = true;
      }
    };
    recognition.onend = () => {
      if (store.speechRecognizer !== recognition) return;
      store.speechRecognizer = null;
      if (
        store.status !== "recording" ||
        !store.recorder ||
        store.recorder.state !== "recording"
      ) {
        return;
      }
      clearSpeechRestartTimer(store);
      store.speechRestartTimer = setTimeout(() => {
        store.speechRestartTimer = null;
        if (
          store.status === "recording" &&
          store.recorder?.state === "recording"
        ) {
          tryStartSpeechRecognition(store);
        }
      }, 160);
    };
    recognition.start();
    store.speechRecognizer = recognition;
  } catch {
    // speech recognition is optional enhancement
  }
}

function formatRecordingFileName(mode: StudyRecordingMode, timestamp: string) {
  const date = new Date(timestamp);
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}-${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
  return `${mode === "browser-tab" ? "tab-recording" : "mic-recording"}-${stamp}.webm`;
}

function createRecordingResult(store: RecordingStore): StudyRecordingResult | null {
  if (!store.mode || !store.startedAt) return null;
  const capturedAt = new Date().toISOString();
  const blob =
    store.chunks.length > 0
      ? new Blob(store.chunks, { type: store.mimeType || "video/webm" })
      : null;
  const mediaUrl = blob ? URL.createObjectURL(blob) : null;
  return {
    id: `recording_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    mode: store.mode,
    durationMs: Math.max(Date.now() - store.startedAt, 0),
    transcript: store.transcript.trim(),
    capturedAt,
    mediaUrl,
    mimeType: blob ? blob.type || store.mimeType : null,
    fileName: formatRecordingFileName(store.mode, capturedAt),
  };
}

export function getStudyRecordingSnapshot(): StudyRecordingSnapshot {
  const store = getStore();
  return {
    status: store.status,
    mode: store.mode,
    startedAt: store.startedAt,
    transcript: store.transcript,
    lastResult: store.lastResult,
    previewStream: store.stream,
    liveTranscriptCapable: Boolean(getSpeechRecognitionCtor()),
  };
}

export function onStudyRecordingChange(handler: (snapshot: StudyRecordingSnapshot) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const wrapped = (event: Event) => {
    const detail = (event as CustomEvent<StudyRecordingSnapshot>).detail;
    handler(detail || getStudyRecordingSnapshot());
  };
  window.addEventListener(EVENT_NAME, wrapped);
  return () => window.removeEventListener(EVENT_NAME, wrapped);
}

export async function startStudyRecording(mode: StudyRecordingMode) {
  const store = getStore();
  if (store.status === "recording" || store.status === "stopping") {
    throw new Error("A recording is already in progress.");
  }
  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices) {
    throw new Error("Media capture is not supported in this browser.");
  }

  const stream =
    mode === "microphone"
      ? await mediaDevices.getUserMedia({ audio: true })
      : await mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
    ? "video/webm;codecs=vp9,opus"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ? "video/webm;codecs=vp8,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  store.mode = mode;
  store.startedAt = Date.now();
  store.status = "recording";
  store.transcript = "";
  store.speechFinalBuffer = "";
  store.chunks = [];
  store.mimeType = mimeType || recorder.mimeType || null;
  store.stream = stream;
  store.recorder = recorder;
  store.lastResult = null;
  stopSpeechRecognizer(store);
  store.speechDisabledForSession = false;
  tryStartSpeechRecognition(store);

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      store.chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const result = createRecordingResult(store);
    stopSpeechRecognizer(store);
    cleanupStream(store.stream);
    store.status = "idle";
    store.mode = null;
    store.startedAt = null;
    store.recorder = null;
    store.stream = null;
    store.chunks = [];
    store.mimeType = null;
    store.transcript = "";
    store.speechFinalBuffer = "";
    store.lastResult = result;
    emitState();
    if (store.pendingStop) {
      store.pendingStop.resolve(result);
      store.pendingStop = null;
    }
  };

  stream.getTracks().forEach((track) => {
    track.onended = () => {
      if (store.recorder && store.recorder.state !== "inactive") {
        store.status = "stopping";
        stopSpeechRecognizer(store);
        emitState();
        store.recorder.stop();
      }
    };
  });

  recorder.start(1000);
  emitState();
}

export async function stopStudyRecording(): Promise<StudyRecordingResult | null> {
  const store = getStore();
  if (!store.recorder || store.recorder.state === "inactive") {
    return store.lastResult;
  }
  if (store.pendingStop) {
    return new Promise((resolve, reject) => {
      const existing = store.pendingStop!;
      store.pendingStop = {
        resolve: (value) => {
          existing.resolve(value);
          resolve(value);
        },
        reject: (reason) => {
          existing.reject(reason);
          reject(reason);
        },
      };
    });
  }

  store.status = "stopping";
  emitState();
  return new Promise((resolve, reject) => {
    store.pendingStop = { resolve, reject };
    try {
      stopSpeechRecognizer(store);
      store.recorder!.stop();
    } catch (error) {
      store.pendingStop = null;
      reject(error);
    }
  });
}
