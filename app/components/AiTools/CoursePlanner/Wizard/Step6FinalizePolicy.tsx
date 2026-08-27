import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, ArrowLeft, Lock, Sparkles } from "lucide-react";
import { CourseCatalogItem, PolicyPreset, ScheduleOption, Semester } from "@/app/lib/client/coursePlanner/types";

interface Props {
  semester: Semester;
  selectedOption: ScheduleOption;
  courses: CourseCatalogItem[];
  onFinalize: (preset: PolicyPreset, overrides: Record<string, number>) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const Step6FinalizePolicy: React.FC<Props> = ({
  semester,
  selectedOption,
  courses,
  onFinalize,
  onBack,
  isSubmitting,
}) => {
  const [preset, setPreset] = useState<PolicyPreset>("standard");
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  const handleOverrideChange = (courseId: string, percent: number) => {
    setOverrides((prev) => ({ ...prev, [courseId]: percent }));
  };

  const handleConfirmFinalize = () => {
    onFinalize(preset, overrides);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Finalize & Lock Semester</h2>
            <p className="text-sm text-gray-500">Set attendance tracking policy presets before landing on your dashboard</p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Schedule Confirmation Summary</h3>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
          <div>
            <span className="text-xs text-gray-400 block">Semester</span>
            <span className="font-bold text-gray-900 text-sm">{semester.name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Schedule Option</span>
            <span className="font-bold text-primary-400 text-sm">{selectedOption.name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Enrolled Courses</span>
            <span className="font-bold text-gray-900 text-sm">{courses.length} Courses</span>
          </div>
        </div>
      </div>

      {/* Attendance Policy Selection */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Post-Finalization Attendance Policy Setup</h3>
          <p className="text-xs text-gray-500">Bulk policy presets automatically configure low-attendance warning thresholds across your schedule.</p>
        </div>

        {/* Bulk Preset Options */}
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => setPreset("standard")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              preset === "standard"
                ? "border-primary-400 bg-primary-100/50 ring-2 ring-primary-400/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 text-sm">Standard</span>
              {preset === "standard" && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 3 misses allowed</p>
            <p className="text-[11px] text-gray-400">80% target attendance. Balanced alerts.</p>
          </div>

          <div
            onClick={() => setPreset("strict")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              preset === "strict"
                ? "border-primary-400 bg-primary-100/50 ring-2 ring-primary-400/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 text-sm">Strict</span>
              {preset === "strict" && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 1 miss allowed</p>
            <p className="text-[11px] text-gray-400">90% target attendance. High priority alerts.</p>
          </div>

          <div
            onClick={() => setPreset("relaxed")}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              preset === "relaxed"
                ? "border-primary-400 bg-primary-100/50 ring-2 ring-primary-400/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900 text-sm">Relaxed</span>
              {preset === "relaxed" && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 5 misses allowed</p>
            <p className="text-[11px] text-gray-400">70% target attendance. Flexible tracking.</p>
          </div>
        </div>

        {/* Per-Course Target Override Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Per-Course Attendance Target Overrides</h4>
          <div className="space-y-2">
            {courses.map((c) => {
              const currentTarget = overrides[c.id] !== undefined ? overrides[c.id] : preset === "strict" ? 90 : preset === "relaxed" ? 70 : 80;
              return (
                <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-bold text-gray-900 text-xs">{c.code}</span>
                    <span className="text-xs text-gray-500">{c.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={currentTarget}
                      onChange={(e) => handleOverrideChange(c.id, parseInt(e.target.value, 10))}
                      className="w-28 accent-primary-400 cursor-pointer"
                    />
                    <span className="w-12 text-right font-semibold text-xs text-primary-500">{currentTarget}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Finalize Action Bar */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schedule Options
        </button>

        <button
          onClick={handleConfirmFinalize}
          disabled={isSubmitting}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" /> Finalizing Timetable...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Lock & Finalize Semester
            </>
          )}
        </button>
      </div>
    </div>
  );
};
