import React, { useState } from "react";
import { FiCheckCircle, FiShield, FiArrowLeft, FiLock, FiLoader } from "react-icons/fi";
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
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-400 flex items-center justify-center">
            <FiShield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Finalize & Lock Semester</h2>
            <p className="text-xs text-gray-500">Set attendance tracking policy presets before landing on your dashboard</p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wide">Schedule Confirmation Summary</h3>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <div>
            <span className="text-xs text-gray-400 block">Semester</span>
            <span className="font-semibold text-gray-800 text-sm">{semester.name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Schedule Option</span>
            <span className="font-semibold text-primary-400 text-sm">{selectedOption.name}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">Enrolled Courses</span>
            <span className="font-semibold text-gray-800 text-sm">{courses.length} Courses</span>
          </div>
        </div>
      </div>

      {/* Attendance Policy Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Post-Finalization Attendance Policy Setup</h3>
          <p className="text-xs text-gray-500">Bulk policy presets automatically configure low-attendance warning thresholds across your schedule.</p>
        </div>

        {/* Bulk Preset Options */}
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => setPreset("standard")}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              preset === "standard"
                ? "border-primary-300 bg-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-800 text-sm">Standard</span>
              {preset === "standard" && <FiCheckCircle className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 3 misses allowed</p>
            <p className="text-xs text-gray-400">80% target attendance. Balanced alerts.</p>
          </div>

          <div
            onClick={() => setPreset("strict")}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              preset === "strict"
                ? "border-primary-300 bg-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-800 text-sm">Strict</span>
              {preset === "strict" && <FiCheckCircle className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 1 miss allowed</p>
            <p className="text-xs text-gray-400">90% target attendance. High priority alerts.</p>
          </div>

          <div
            onClick={() => setPreset("relaxed")}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              preset === "relaxed"
                ? "border-primary-300 bg-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-800 text-sm">Relaxed</span>
              {preset === "relaxed" && <FiCheckCircle className="w-4 h-4 text-primary-400" />}
            </div>
            <p className="text-xs text-gray-600 font-semibold mb-1">Max 5 misses allowed</p>
            <p className="text-xs text-gray-400">70% target attendance. Flexible tracking.</p>
          </div>
        </div>

        {/* Per-Course Target Override Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-gray-500 tracking-wide">Per-Course Attendance Target Overrides</h4>
          <div className="space-y-2">
            {courses.map((c) => {
              const currentTarget = overrides[c.id] !== undefined ? overrides[c.id] : preset === "strict" ? 90 : preset === "relaxed" ? 70 : 80;
              return (
                <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-semibold text-gray-800 text-xs">{c.code}</span>
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
                    <span className="w-12 text-right font-semibold text-xs text-primary-400">{currentTarget}%</span>
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
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Schedule Options
        </button>

        <button
          onClick={handleConfirmFinalize}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <FiLoader className="w-4 h-4 animate-spin" /> Finalizing Timetable...
            </>
          ) : (
            <>
              <FiLock className="w-4 h-4" /> Lock & Finalize Semester
            </>
          )}
        </button>
      </div>
    </div>
  );
};
