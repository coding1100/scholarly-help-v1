import React, { useState } from "react";
import { CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, MessageSquare, RefreshCw, Send, ShieldAlert, Sparkles } from "lucide-react";
import { CourseCatalogItem, CourseSection, ScheduleOption, ScheduleConflict } from "@/app/lib/client/coursePlanner/types";
import { CoursePlannerService } from "@/app/lib/client/coursePlanner/service";

interface Props {
  semesterId: string;
  courses: CourseCatalogItem[];
  options: ScheduleOption[];
  onSelectOption: (option: ScheduleOption) => void;
  onBack: () => void;
}

export const Step5ScheduleOptions: React.FC<Props> = ({
  semesterId,
  courses,
  options,
  onSelectOption,
  onBack,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || "");
  const [activeOptions, setActiveOptions] = useState<ScheduleOption[]>(options);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveNotice, setResolveNotice] = useState<{ text: string; tone: "success" | "error" } | null>(null);

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

  // Helper to map section IDs to actual section objects
  const getSelectedSections = (secIds: string[]): CourseSection[] => {
    const list: CourseSection[] = [];
    for (const c of courses) {
      for (const s of c.sections) {
        if (secIds.includes(s.id)) list.push(s);
      }
    }
    return list;
  };

  const applyUpdatedSections = (updatedSectionIds: string[], note: string) => {
    setActiveOptions((prev) =>
      prev.map((opt) =>
        opt.id === activeOption?.id
          ? {
              ...opt,
              sectionIds: updatedSectionIds,
              conflicts: [],
              tradeOffs: [...opt.tradeOffs, note],
            }
          : opt
      )
    );
  };

  const handleResolveConflict = async (conflict: ScheduleConflict) => {
    if (!activeOption || isResolving) return;
    setIsResolving(true);
    setResolveNotice(null);
    try {
      const result = await CoursePlannerService.chatEditSchedule(
        semesterId,
        activeOption.sectionIds,
        conflict.description
      );
      if (result.success) {
        applyUpdatedSections(result.updatedSectionIds, result.explanation);
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !activeOption || isChatSending) return;

    const q = chatQuery.trim();
    setChatLog((prev) => [...prev, { sender: "user", text: q }]);
    setChatQuery("");
    setIsChatSending(true);

    try {
      const result = await CoursePlannerService.chatEditSchedule(semesterId, activeOption.sectionIds, q);
      if (result.success) {
        applyUpdatedSections(result.updatedSectionIds, `User Chat Edit: ${q}`);
      }
      setChatLog((prev) => [...prev, { sender: "ai", text: result.explanation }]);
    } catch (err) {
      setChatLog((prev) => [...prev, { sender: "ai", text: "Sorry, I couldn't process that request right now. Please try again." }]);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {resolveNotice && (
        <div
          className={`rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between border ${
            resolveNotice.tone === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span>{resolveNotice.text}</span>
          <button onClick={() => setResolveNotice(null)} className="opacity-60 hover:opacity-100 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Generated Schedule Candidates</h2>
          <p className="text-sm text-gray-500">Multiple schedule options scored against your requirements & preferences</p>
        </div>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Conversational Chat Assistant
        </button>
      </div>

      {/* Main Grid: Left Candidates List, Right Selected Schedule Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Top Options ({activeOptions.length})</h3>
          {activeOptions.map((opt) => {
            const isSelected = opt.id === activeOption?.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary-400 bg-primary-100/40 shadow-sm ring-2 ring-primary-400/10"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-sm">{opt.name}</span>
                  <span className="px-2.5 py-0.5 bg-primary-200 text-primary-500 font-semibold text-xs rounded-full">
                    Score {opt.score}/100
                  </span>
                </div>

                {opt.conflicts.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> {opt.conflicts.length} Conflict(s)
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-2">
                    <CheckCircle className="w-3.5 h-3.5" /> Conflict Free
                  </div>
                )}

                <div className="space-y-1">
                  {opt.tradeOffs.slice(0, 2).map((t: string, idx: number) => (
                    <p key={idx} className="text-[11px] text-gray-600 flex items-center gap-1">
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
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{activeOption.name} Details</h3>
                <p className="text-xs text-gray-500">{activeOption.sectionIds.length} course sections enrolled</p>
              </div>

              <button
                onClick={() => onSelectOption(activeOption)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                Accept This Schedule <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Conflicts Warning Banner & Resolution Action */}
            {activeOption.conflicts.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-800 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4" /> Conflicts Detected in this option:
                </div>
                {activeOption.conflicts.map((c: ScheduleConflict) => (
                  <div key={c.id} className="flex items-center justify-between text-xs text-red-700 bg-white p-2.5 rounded-lg border border-red-100">
                    <span>{c.description}</span>
                    <button
                      onClick={() => handleResolveConflict(c)}
                      disabled={isResolving}
                      className="px-3 py-1 bg-red-600 text-white text-[11px] font-semibold rounded-lg hover:bg-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${isResolving ? "animate-spin" : ""}`} /> {isResolving ? "Resolving…" : "Auto Swap"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Enrolled Sections Summary Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Enrolled Sections</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getSelectedSections(activeOption.sectionIds).map((sec: CourseSection) => {
                  const course = courses.find((c) => c.id === sec.courseId);
                  return (
                    <div key={sec.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center gap-3">
                      <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: course?.color || "#3b82f6" }} />
                      <div>
                        <span className="font-bold text-gray-900 text-xs">{course?.code || "COURSE"}</span>
                        <span className="text-xs text-gray-500 font-medium ml-1">Sec {sec.sectionNumber}</span>
                        <p className="text-[11px] font-semibold text-gray-700">
                          {sec.days.join(", ")} {sec.startTime} - {sec.endTime}
                        </p>
                        <p className="text-[10px] text-gray-400">Prof: {sec.instructor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade-offs & Compromises */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <h5 className="text-xs font-semibold text-emerald-800 mb-1">Satisfied Preferences</h5>
                <ul className="space-y-1 text-[11px] text-emerald-700">
                  {activeOption.tradeOffs.map((t: string, idx: number) => (
                    <li key={idx}>✓ {t}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
                <h5 className="text-xs font-semibold text-amber-800 mb-1">Compromises / Trade-Offs</h5>
                {activeOption.compromises.length === 0 ? (
                  <p className="text-[11px] text-emerald-700 font-medium">None! All preferences met.</p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-amber-800">
                    {activeOption.compromises.map((c: string, idx: number) => (
                      <li key={idx}>⚠️ {c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Preferences
        </button>
      </div>

      {/* Conversational Schedule Chat Editor Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl border border-gray-200 shadow-2xl z-50 overflow-hidden flex flex-col h-[480px]">
          <div className="p-4 bg-primary-400 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
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
                  className={`max-w-[85%] p-3 rounded-xl text-xs ${
                    m.sender === "user"
                      ? "bg-primary-400 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 shadow-2xs rounded-bl-none"
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
              className="flex-1 px-3 py-2 border rounded-xl text-xs disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatSending}
              className="p-2 bg-primary-400 text-white rounded-xl hover:bg-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
