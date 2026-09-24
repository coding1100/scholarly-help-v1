import React, { useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiArrowRight, FiArrowLeft, FiMessageSquare, FiRefreshCw, FiSend, FiZap, FiX, FiCheck } from "react-icons/fi";
import { CourseCatalogItem, CourseSection, ScheduleOption, ScheduleConflict } from "@/app/lib/client/coursePlanner/types";
import { CoursePlannerService } from "@/app/lib/client/coursePlanner/service";

interface Props {
  semesterId: string;
  courses: CourseCatalogItem[];
  options: ScheduleOption[];
  onSelectOption: (option: ScheduleOption) => void;
  onBack: () => void;
  /** Gates the free-text chat editor's LLM call for guest users, same as
   * every other AI action in this tool. Auto Swap doesn't need this — it's
   * a deterministic, non-LLM call. */
  guardAiClick: (run: () => void | Promise<void>) => boolean;
}

export const Step5ScheduleOptions: React.FC<Props> = ({
  semesterId,
  courses,
  options,
  onSelectOption,
  onBack,
  guardAiClick,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || "");
  const [activeOptions, setActiveOptions] = useState<ScheduleOption[]>(options);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveNotice, setResolveNotice] = useState<{ text: string; tone: "success" | "error" } | null>(null);
  // Tracks whether the user has applied any local edit (Auto Swap or chat)
  // to any option, so navigating back can warn that those edits are about
  // to be discarded (Step 4 regenerating replaces `options` entirely).
  const [hasLocalEdits, setHasLocalEdits] = useState(false);

  // Conversational Chat Editor State — every message here is answered by a
  // real LLM call on the backend (schedules/chat), which validates any
  // proposed swap against the actual catalog before applying it.
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! You can ask me to swap sections or adjust your schedule. Try typing: 'Switch CS 101 to section 02' or 'Give me Fridays off'." },
  ]);

  const activeOption = activeOptions.find((o) => o.id === selectedOptionId) || activeOptions[0];

  // Helper to map section IDs to actual section objects. Pairs each section
  // with the course it was actually found under — `section.courseId` is
  // frequently unset on a plain course fetch (the backend only populates it
  // for call sites that need it, like schedule generation; see
  // CourseSection schema), so looking it up via `courses.find(c => c.id ===
  // sec.courseId)` elsewhere silently fails and falls back to a "COURSE"
  // placeholder label instead of the real course code.
  const getSelectedSections = (secIds: string[]): Array<{ section: CourseSection; course: CourseCatalogItem }> => {
    const list: Array<{ section: CourseSection; course: CourseCatalogItem }> = [];
    for (const c of courses) {
      for (const s of c.sections) {
        if (secIds.includes(s.id)) list.push({ section: s, course: c });
      }
    }
    return list;
  };

  const applyUpdatedSections = (updatedSectionIds: string[], note: string, clearConflicts: boolean) => {
    setHasLocalEdits(true);
    setActiveOptions((prev) =>
      prev.map((opt) =>
        opt.id === activeOption?.id
          ? {
              ...opt,
              sectionIds: updatedSectionIds,
              conflicts: clearConflicts ? [] : opt.conflicts,
              tradeOffs: [...opt.tradeOffs, note],
            }
          : opt
      )
    );
  };

  // Deterministic — no LLM call, so not guest-gated. resolveConflictsEngine
  // (the backend engine behind this endpoint) only reports success when the
  // WHOLE resulting section selection is conflict-free, so clearing
  // `conflicts` to [] here is always correct for a successful resolve.
  const handleResolveConflict = async (conflict: ScheduleConflict) => {
    if (!activeOption || isResolving) return;
    setIsResolving(true);
    setResolveNotice(null);
    try {
      const result = await CoursePlannerService.resolveConflict(
        semesterId,
        activeOption.sectionIds,
        conflict
      );
      if (result.success) {
        applyUpdatedSections(result.updatedSectionIds, result.explanation, true);
        setResolveNotice({ text: `Conflict resolved! ${result.explanation}`, tone: "success" });
      } else {
        setResolveNotice({ text: result.explanation, tone: "error" });
      }
    } catch (err) {
      setResolveNotice({ text: "Couldn't resolve that conflict right now. Please try again.", tone: "error" });
    } finally {
      setIsResolving(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !activeOption || isChatSending) return;

    guardAiClick(async () => {
      const q = chatQuery.trim();
      setChatLog((prev) => [...prev, { sender: "user", text: q }]);
      setChatQuery("");
      setIsChatSending(true);

      try {
        const result = await CoursePlannerService.chatEditSchedule(semesterId, activeOption.sectionIds, q);
        if (result.success) {
          // The free-text chat path doesn't verify the WHOLE selection is
          // conflict-free the way resolveConflictsEngine does — it only
          // validates the one requested swap — so conflicts are left as-is
          // for the caller to re-check, rather than optimistically cleared.
          applyUpdatedSections(result.updatedSectionIds, `User Chat Edit: ${q}`, false);
        }
        setChatLog((prev) => [...prev, { sender: "ai", text: result.explanation }]);
      } catch (err) {
        setChatLog((prev) => [...prev, { sender: "ai", text: "Sorry, I couldn't process that request right now. Please try again." }]);
      } finally {
        setIsChatSending(false);
      }
    });
  };

  const handleBack = () => {
    if (hasLocalEdits) {
      const confirmed = window.confirm(
        "Going back will discard the schedule edits you made here (Auto Swap / chat). Continue?"
      );
      if (!confirmed) return;
    }
    onBack();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {resolveNotice && (
        <div
          className={`rounded-lg px-4 py-3 text-xs font-semibold flex items-center justify-between border ${
            resolveNotice.tone === "success"
              ? "bg-primary-100 border-primary-200 text-primary-400"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span>{resolveNotice.text}</span>
          <button onClick={() => setResolveNotice(null)} className="opacity-60 hover:opacity-100 p-1">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Generated Schedule Candidates</h2>
          <p className="text-xs text-gray-500">Multiple schedule options scored against your requirements & preferences</p>
        </div>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <FiMessageSquare className="w-3.5 h-3.5" /> Conversational Chat Assistant
        </button>
      </div>

      {activeOptions.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center space-y-2 shadow-sm">
          <FiAlertTriangle className="w-5 h-5 text-primary-400 mx-auto" />
          <p className="text-sm font-semibold text-gray-800">No viable schedule could be generated</p>
          <p className="text-xs text-gray-500">
            Your preferences and course pool may be too constrained. Try relaxing a preference (e.g. campus days
            or morning classes) and generating again.
          </p>
          <button
            onClick={handleBack}
            className="mt-2 px-5 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Preferences
          </button>
        </div>
      )}

      {/* Main Grid: Left Candidates List, Right Selected Schedule Visualizer */}
      {activeOptions.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 tracking-wide">Top Options ({activeOptions.length})</h3>
          {activeOptions.map((opt) => {
            const isSelected = opt.id === activeOption?.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary-300 bg-primary-100 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{opt.name}</span>
                  <span className="px-2.5 py-0.5 bg-primary-200 text-primary-500 font-semibold text-xs rounded-full">
                    Score {opt.score}/100
                  </span>
                </div>

                {opt.conflicts.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-2">
                    <FiAlertTriangle className="w-3.5 h-3.5" /> {opt.conflicts.length} Conflict(s)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-primary-400 text-xs font-semibold mb-2">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Conflict Free
                  </div>
                )}

                <div className="space-y-1">
                  {opt.tradeOffs.slice(0, 2).map((t: string, idx: number) => (
                    <p key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400" /> {t}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Timetable Details */}
        {activeOption && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{activeOption.name} Details</h3>
                <p className="text-xs text-gray-500">{activeOption.sectionIds.length} course sections enrolled</p>
              </div>

              <button
                onClick={() => onSelectOption(activeOption)}
                disabled={activeOption.conflicts.length > 0}
                title={activeOption.conflicts.length > 0 ? "Resolve all conflicts before accepting this schedule" : undefined}
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                Accept This Schedule <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Conflicts Warning Banner & Resolution Action */}
            {activeOption.conflicts.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-red-700 font-semibold text-xs">
                  <FiAlertTriangle className="w-4 h-4" /> Conflicts detected in this option
                </div>
                {activeOption.conflicts.map((c: ScheduleConflict) => (
                  <div key={c.id} className="flex items-center justify-between text-xs text-red-700 bg-white p-2.5 rounded-lg border border-red-100">
                    <span>{c.description}</span>
                    <button
                      onClick={() => handleResolveConflict(c)}
                      disabled={isResolving}
                      className="px-3 py-1 bg-white border border-red-300 text-red-600 text-xs font-semibold rounded-lg transition-colors hover:bg-red-50 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiRefreshCw className={`w-3 h-3 ${isResolving ? "animate-spin" : ""}`} /> {isResolving ? "Resolving..." : "Auto Swap"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Enrolled Sections Summary Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 tracking-wide">Enrolled Sections</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getSelectedSections(activeOption.sectionIds).map(({ section: sec, course }) => (
                  <div key={sec.id} className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
                    <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: course.color || "#3b82f6" }} />
                    <div>
                      <span className="font-semibold text-gray-800 text-xs">{course.code}</span>
                      <span className="text-xs text-gray-500 ml-1">Sec {sec.sectionNumber}</span>
                      <p className="text-xs font-semibold text-gray-700">
                        {sec.days.join(", ")} {sec.startTime} - {sec.endTime}
                      </p>
                      <p className="text-xs text-gray-400">Prof. {sec.instructor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade-offs & Compromises */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-primary-100/60 border border-primary-200 rounded-lg">
                <h5 className="text-xs font-semibold text-primary-500 mb-1">Satisfied Preferences</h5>
                <ul className="space-y-1 text-xs text-primary-500">
                  {activeOption.tradeOffs.map((t: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1">
                      <FiCheck className="w-3 h-3 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-secondary-200/20 border border-secondary-200 rounded-lg">
                <h5 className="text-xs font-semibold text-secondary-500 mb-1">Compromises / Trade-Offs</h5>
                {activeOption.compromises.length === 0 ? (
                  <p className="text-xs text-primary-400 font-semibold">None. All preferences met.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-secondary-500">
                    {activeOption.compromises.map((c: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1">
                        <FiAlertTriangle className="w-3 h-3 shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Preferences
        </button>
      </div>

      {/* Conversational Schedule Chat Editor Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden flex flex-col h-[480px]">
          <div className="p-4 bg-primary-400 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiZap className="w-4 h-4" />
              <span className="font-semibold text-sm">Schedule Assistant</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white text-xs font-semibold">
              Close
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatLog.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg text-xs ${
                    m.sender === "user"
                      ? "bg-primary-400 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="e.g. Switch CS 101 to section 02..."
              disabled={isChatSending}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatSending}
              className="p-2 bg-primary-400 text-white rounded-lg hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatSending ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSend className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
