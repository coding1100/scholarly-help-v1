"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiPause, FiPlay, FiSquare } from "react-icons/fi";
import {
  DAILY_PLAY_LIMIT,
  MAX_CHARACTERS,
  consumePlay,
  playsUsedToday,
  splitIntoChunks,
  wordAt,
} from "./speech";

type Status = "idle" | "playing" | "paused";

const field =
  "h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3.5 pr-10 text-sm text-slate-900 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const label = "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";
const textBox =
  "h-[220px] w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-3.5 text-[15px] leading-relaxed text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

/** "en-GB" → "en", so a language groups all of its regional voices. */
const baseLang = (lang: string) => lang.split(/[-_]/)[0].toLowerCase();

function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** localStorage when the browser allows it; a no-op store otherwise. */
function playStorage(): Pick<Storage, "getItem" | "setItem"> {
  try {
    return window.localStorage;
  } catch {
    return { getItem: () => null, setItem: () => undefined };
  }
}

/**
 * Text-to-speech for essays, using the browser's own speech voices. Up to
 * MAX_CHARACTERS per play and DAILY_PLAY_LIMIT plays a day per browser; the
 * word being read is highlighted where the voice reports word boundaries.
 */
export default function ReadMyEssayTool({
  embedded = false,
}: {
  /** Inside a landing page hero: the panel there supplies the card chrome. */
  embedded?: boolean;
}) {
  const ids = { text: useId(), language: useId(), voice: useId(), rate: useId(), pitch: useId() };
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);
  const [language, setLanguage] = useState("");
  const [voiceUri, setVoiceUri] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [word, setWord] = useState<{ start: number; end: number } | null>(null);
  const [playsUsed, setPlaysUsed] = useState<number | null>(null);
  const [error, setError] = useState("");
  // Each play gets an id so events from a cancelled queue cannot end a newer one.
  const runRef = useRef(0);
  const readingRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const synth = window.speechSynthesis;
    // Chrome fills the voice list asynchronously and announces it.
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener("voiceschanged", load);
    setPlaysUsed(playsUsedToday(playStorage(), new Date()));
    return () => {
      synth.removeEventListener("voiceschanged", load);
      runRef.current += 1;
      synth.cancel();
    };
  }, []);

  const languages = useMemo(() => {
    const codes = Array.from(new Set(voices.map((v) => baseLang(v.lang))));
    return codes
      .map((code) => ({ code, name: languageName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [voices]);

  // Default to the visitor's language, then English, once voices arrive.
  useEffect(() => {
    if (language || !languages.length) return;
    const preferred = [baseLang(navigator.language || ""), "en"];
    const match = preferred.find((code) => languages.some((l) => l.code === code));
    setLanguage(match ?? languages[0].code);
  }, [languages, language]);

  const languageVoices = useMemo(
    () => voices.filter((v) => baseLang(v.lang) === language),
    [voices, language],
  );

  useEffect(() => {
    if (!languageVoices.length || languageVoices.some((v) => v.voiceURI === voiceUri)) return;
    const preferred =
      languageVoices.find((v) => v.default) ??
      languageVoices.find((v) => v.lang === navigator.language) ??
      languageVoices[0];
    setVoiceUri(preferred.voiceURI);
  }, [languageVoices, voiceUri]);

  // Keep the highlighted word in view inside the reading box.
  useEffect(() => {
    const box = readingRef.current;
    const mark = markRef.current;
    if (!box || !mark) return;
    const top = mark.offsetTop;
    if (top < box.scrollTop || top + mark.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = top - box.clientHeight / 2;
    }
  }, [word]);

  const limitReached = playsUsed !== null && playsUsed >= DAILY_PLAY_LIMIT;

  /** Ends the current play; events still queued from it are ignored. */
  const reset = () => {
    runRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setWord(null);
  };

  const play = () => {
    const chunks = splitIntoChunks(text);
    if (!chunks.length) {
      setError("Paste or type some text to read aloud.");
      return;
    }
    const used = consumePlay(playStorage(), new Date());
    if (used === null) {
      setPlaysUsed(DAILY_PLAY_LIMIT);
      return;
    }
    setPlaysUsed(used);
    setError("");
    setWord(null);

    const synth = window.speechSynthesis;
    const voice = languageVoices.find((v) => v.voiceURI === voiceUri);
    const run = ++runRef.current;
    synth.cancel();
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk.text);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.onboundary = (event) => {
        if (runRef.current !== run || event.name === "sentence") return;
        setWord(wordAt(text, chunk.start + event.charIndex));
      };
      utterance.onerror = (event) => {
        // Stopping or replaying cancels the queue; that is not a failure.
        if (event.error === "interrupted" || event.error === "canceled") return;
        if (runRef.current !== run) return;
        setError("Your browser could not read this text. Try another voice.");
        reset();
      };
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          if (runRef.current === run) reset();
        };
      }
      synth.speak(utterance);
    });
    setStatus("playing");
  };

  const togglePause = () => {
    const synth = window.speechSynthesis;
    if (status === "paused") {
      synth.resume();
      setStatus("playing");
    } else {
      synth.pause();
      setStatus("paused");
    }
  };

  const busy = status !== "idle";
  const playsLeft = playsUsed === null ? null : Math.max(DAILY_PLAY_LIMIT - playsUsed, 0);

  return (
    <div className={embedded ? "p-4 sm:p-6" : "container mx-auto max-w-[840px] px-3 py-4 sm:px-4 md:px-8 md:pt-8"}>
      <div
        className={
          embedded
            ? ""
            : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        }
      >
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor={ids.text} className="text-sm font-semibold text-slate-900 dark:text-white">
            Your essay text
          </label>
          <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {text.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
          </span>
        </div>

        {busy ? (
          <div ref={readingRef} aria-live="off" className={`${textBox} relative whitespace-pre-wrap`}>
            {word ? (
              <>
                {text.slice(0, word.start)}
                <mark ref={markRef} className="rounded bg-[#FFE2CC] px-0.5 text-inherit dark:bg-[#7A3A12]">
                  {text.slice(word.start, word.end)}
                </mark>
                {text.slice(word.end)}
              </>
            ) : (
              text
            )}
          </div>
        ) : (
          <textarea
            id={ids.text}
            value={text}
            maxLength={MAX_CHARACTERS}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
            placeholder="Paste your essay, assignment or any text here, then press Read aloud."
            className={`${textBox} resize-none placeholder:text-slate-400 focus:border-[#565add] focus:outline-none focus:ring-1 focus:ring-[#565add]`}
          />
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.language} className={label}>
              Language
            </label>
            <div className="relative">
              <select
                id={ids.language}
                value={language}
                disabled={busy || !languages.length}
                onChange={(e) => setLanguage(e.target.value)}
                className={field}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
              <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div>
            <label htmlFor={ids.voice} className={label}>
              Voice
            </label>
            <div className="relative">
              <select
                id={ids.voice}
                value={voiceUri}
                disabled={busy || !languageVoices.length}
                onChange={(e) => setVoiceUri(e.target.value)}
                className={field}
              >
                {languageVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <FiChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div>
            <label htmlFor={ids.rate} className={label}>
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              id={ids.rate}
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={rate}
              disabled={busy}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-[#565add] disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor={ids.pitch} className={label}>
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              id={ids.pitch}
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={pitch}
              disabled={busy}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-[#565add] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          {busy ? (
            <>
              <button
                type="button"
                onClick={togglePause}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#F26A1B] px-5 text-sm font-bold text-white transition-colors hover:bg-[#D85A10]"
              >
                {status === "paused" ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
                {status === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FiSquare aria-hidden="true" />
                Stop
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={play}
              disabled={!supported}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#F26A1B] px-5 text-sm font-bold text-white transition-colors hover:bg-[#D85A10] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlay aria-hidden="true" />
              Read aloud
            </button>
          )}
          {playsLeft !== null && supported ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {playsLeft} of {DAILY_PLAY_LIMIT} free plays left today
            </span>
          ) : null}
        </div>

        {!supported ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Your browser does not support text-to-speech. Try the latest Chrome, Edge or Safari.
          </p>
        ) : limitReached ? (
          <p role="alert" className="mt-3 text-sm text-slate-700 dark:text-slate-300">
            You have used all {DAILY_PLAY_LIMIT} free plays for today. Come back tomorrow, or{" "}
            <Link href="/contact-us" className="font-semibold text-[#565add] underline">
              contact support
            </Link>{" "}
            if you need a higher limit.
          </p>
        ) : error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
