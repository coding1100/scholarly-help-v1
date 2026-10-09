"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FiCopy,
  FiEdit3,
  FiRefreshCw,
  FiZap,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import DoneForYouCard from "../DoneForYouCard";

interface DiscussionPostViewProps {
  onBackToStudio: () => void;
  guardAiClick?: (action: () => void | Promise<void>) => void;
}

export default function DiscussionPostView({
  onBackToStudio,
  guardAiClick = (fn) => fn(),
}: DiscussionPostViewProps) {
  const [tab, setTab] = useState<"initial" | "replies">("initial");
  const [prompt, setPrompt] = useState("");
  const [experience, setExperience] = useState("");
  const [words, setWords] = useState("250-300");
  const [citation, setCitation] = useState("APA 7th");
  const [sources, setSources] = useState(1);
  const [reading, setReading] = useState("");

  const [classmatePost, setClassmatePost] = useState("");
  const [replyType, setReplyType] = useState<
    "agree" | "counterpoint" | "question"
  >("agree");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<{
    post: string;
    references?: string;
    wordCount: number;
  } | null>(null);

  const handleGenerate = () => {
    if (tab === "initial" && !prompt.trim()) {
      toast.error("Please enter your discussion prompt.");
      return;
    }
    if (tab === "replies" && !classmatePost.trim()) {
      toast.error("Please paste your classmate's post to generate replies.");
      return;
    }

    guardAiClick(async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      setLoading(false);

      if (tab === "initial") {
        const cleanPrompt = prompt.trim();
        const expText = experience.trim()
          ? `Drawing from my practical background (${experience.trim()}), `
          : "Examining this question from both theoretical and operational perspectives, ";

        const postBody = `${expText}addressing "${cleanPrompt.slice(0, 100)}${cleanPrompt.length > 100 ? "…" : ""}" requires synthesizing core evidence-based concepts with real-world application.\n\nFirst, peer-reviewed literature emphasizes that structured frameworks create the baseline necessary for consistent performance. When organizations and practitioners align their daily routines with validated standards, communication barriers decrease and collaborative problem-solving improves substantially.\n\nFurthermore, sustainable success depends on continuous evaluation. By establishing transparent benchmarks and actively encouraging stakeholder feedback, teams can identify potential obstacles before they escalate. Moving forward, integrating these principles into routine workflow will be critical for driving measurable, long-term improvements.`;

        setOutput({
          wordCount: postBody.split(/\s+/).filter(Boolean).length,
          post: postBody,
          references:
            citation !== "None"
              ? `Northouse, P. G. (2021). Leadership: Theory and practice (9th ed.). SAGE Publications.\nBass, B. M., & Riggio, R. E. (2006). Transformational leadership (2nd ed.). Psychology Press. https://doi.org/10.4324/9781410617095`
              : undefined,
        });
        toast.success("Initial discussion post generated!");
      } else {
        const snippet = classmatePost.slice(0, 60);
        let r1 = "";
        let r2 = "";

        if (replyType === "agree") {
          r1 = `**Peer Reply 1:**\nI really resonated with your point about "${snippet}…". You clearly illustrated how structured expectations support day-to-day consistency. In my own observations, having transparent criteria helps prevent ambiguity and keeps everyone aligned. How has your team maintained this balance when unexpected workflow disruptions occur?`;
          r2 = `**Peer Reply 2:**\nGreat analysis of how this dynamic functions in practice. Your point on accountability especially stood out to me. One additional dimension to consider is how ongoing mentorship can reinforce these standards without causing cognitive overload over long periods.`;
        } else if (replyType === "counterpoint") {
          r1 = `**Peer Reply 1:**\nThank you for sharing your thoughts on "${snippet}…". While I agree that this approach offers clear operational advantages, I wonder if relying solely on this model might limit adaptability during rapidly changing situations. In your experience, is there room for a more flexible, decentralized framework?`;
          r2 = `**Peer Reply 2:**\nI appreciate your thorough post! While your perspective makes sense for standardized environments, research often suggests that collaborative models foster higher long-term engagement. Do you think a hybrid approach could mitigate some of the common trade-offs you mentioned?`;
        } else {
          r1 = `**Peer Reply 1:**\nThank you for this insightful breakdown of "${snippet}…". Your explanation raised an interesting question for me: how do you measure the direct impact of these practices on overall morale over an extended timeframe?`;
          r2 = `**Peer Reply 2:**\nExcellent post! I found your connection between policy and daily practice compelling. What advice would you give to a team looking to transition toward the model you described while minimizing initial friction?`;
        }

        const replyBody = `${r1}\n\n${r2}`;
        setOutput({
          wordCount: replyBody.split(/\s+/).filter(Boolean).length,
          post: replyBody,
          references: undefined,
        });
        toast.success("Classmate replies generated!");
      }
    });
  };

  const handleCopy = () => {
    if (!output) return;
    const text = output.references
      ? `${output.post}\n\nReferences:\n${output.references}`
      : output.post;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToStudio}
          className="flex items-center gap-2 text-sm font-semibold text-[#4F46E5] hover:text-[#3730A3]"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to Essay Studio
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6072]">
          Discussion Board Assistant
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Form: 7 cols */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div className="rounded-2xl border border-[#E4E5EE] bg-white p-6 shadow-sm">
            {/* Tabs */}
            <div className="mb-5 flex rounded-xl border border-[#E4E5EE] bg-[#F5F5FA] p-1.5">
              <button
                type="button"
                onClick={() => setTab("initial")}
                className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  tab === "initial"
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-[#3F4357] hover:text-[#171A2B]"
                }`}
              >
                Initial post
              </button>
              <button
                type="button"
                onClick={() => setTab("replies")}
                className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  tab === "replies"
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-[#3F4357] hover:text-[#171A2B]"
                }`}
              >
                Reply to classmates
              </button>
            </div>

            {tab === "initial" ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                    Discussion prompt
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    placeholder="Paste the discussion question from Canvas/Blackboard…"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#171A2B]">
                      Your personal or work experience
                    </label>
                    <span className="text-[11px] text-[#5B6072]">
                      Makes it sound like you, not a textbook
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    placeholder="Briefly describe your job, hospital, unit, or background…"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                      Words
                    </label>
                    <select
                      value={words}
                      onChange={(e) => setWords(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-2.5 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      <option value="250-300">250–300</option>
                      <option value="150-200">150–200</option>
                      <option value="400-500">400–500</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                      Citation
                    </label>
                    <select
                      value={citation}
                      onChange={(e) => setCitation(e.target.value)}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-2.5 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      <option value="APA 7th">APA 7th</option>
                      <option value="MLA">MLA 9th</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                      Sources
                    </label>
                    <select
                      value={sources}
                      onChange={(e) => setSources(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#CBD5E1] bg-white p-2.5 text-xs text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    >
                      <option value={1}>1 source</option>
                      <option value={2}>2 sources</option>
                      <option value={3}>3 sources</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                    Week&apos;s reading / reference note{" "}
                    <span className="font-normal text-[#5B6072]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={reading}
                    onChange={(e) => setReading(e.target.value)}
                    placeholder="e.g. Chapter 4 on transformational leadership"
                    className="w-full rounded-xl border border-[#CBD5E1] p-2.5 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] font-semibold text-white shadow-md transition hover:bg-[#3730A3]"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 animate-spin" /> Drafting
                      post…
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="h-4 w-4" /> Write my post
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                    Classmate&apos;s post
                  </label>
                  <textarea
                    rows={4}
                    value={classmatePost}
                    onChange={(e) => setClassmatePost(e.target.value)}
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#171A2B] focus:border-[#4F46E5] focus:outline-none"
                    placeholder="Paste your classmate's post here…"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#171A2B]">
                    Reply approach
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "agree", label: "Agree + add point" },
                      { id: "counterpoint", label: "Respectful counterpoint" },
                      { id: "question", label: "Ask a thoughtful question" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setReplyType(opt.id as any)}
                        className={`rounded-xl border p-2.5 text-center text-xs font-medium transition ${
                          replyType === opt.id
                            ? "border-[#4F46E5] bg-[#EEF0FF] text-[#3730A3]"
                            : "border-[#E4E5EE] bg-white text-[#3F4357] hover:border-[#CBD5E1]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4F46E5] font-semibold text-white shadow-md transition hover:bg-[#3730A3]"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="h-4 w-4 animate-spin" /> Drafting
                      replies…
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="h-4 w-4" /> Write 2 replies
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Output: 5 cols */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex flex-col rounded-2xl border border-[#E4E5EE] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between border-b border-[#EEF0F5] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#171A2B]">
                  {tab === "initial" ? "Your post" : "Your replies"}
                </span>
                {output && (
                  <span className="rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-semibold text-[#15803D]">
                    {output.wordCount} words · {citation}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-medium text-[#3F4357] hover:bg-gray-50"
              >
                {copied ? (
                  <FiCheck className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <FiCopy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {output ? (
              <div className="flex flex-col gap-3">
                <div className="whitespace-pre-line text-sm leading-relaxed text-[#2B2E40]">
                  {output.post}
                </div>
                {output.references && (
                  <div className="mt-2 rounded-xl border border-[#E4E5EE] bg-[#F5F5FA] p-3 text-xs">
                    <span className="font-semibold text-[#171A2B]">
                      Reference:
                    </span>
                    <p className="mt-1 text-[#3F4357]">{output.references}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center text-xs text-[#5B6072]">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FF] text-[#4F46E5]">
                  <FiEdit3 className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#171A2B]">
                  No post generated yet
                </p>
                <p className="mt-1 max-w-[280px] text-xs text-[#5B6072]">
                  Paste your prompt on the left and click &quot;Write my post&quot; to generate an authentic post with citations.
                </p>
              </div>
            )}
          </div>

          {/* Done for you card */}
          <DoneForYouCard
            placement="discussion_post"
            title="Due by Sunday and working long shifts?"
            body="Send your weekly discussion board prompt. Our academic experts draft your initial post and two peer responses with real citations."
          />
        </div>
      </div>
    </div>
  );
}
