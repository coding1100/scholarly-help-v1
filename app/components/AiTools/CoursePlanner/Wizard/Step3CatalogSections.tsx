import React, { useState } from "react";
import { Plus, Trash2, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { CourseCatalogItem, CourseSection, Semester } from "@/app/lib/client/coursePlanner/types";

interface Props {
  courses: CourseCatalogItem[];
  priorSemesters: Semester[];
  onUpdateCourseSections: (courseId: string, sections: CourseSection[]) => void;
  onToggleRequired: (courseId: string, isRequired: boolean) => void;
  onImportRetake: (sourceSemesterId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3CatalogSections: React.FC<Props> = ({
  courses,
  priorSemesters,
  onUpdateCourseSections,
  onToggleRequired,
  onImportRetake,
  onNext,
  onBack,
}) => {
  const [expandedCourseId, setExpandedCourseId] = useState<string>(courses[0]?.id || "");

  // Section modal/form
  const [newSecNumber, setNewSecNumber] = useState("02");
  const [newInstructor, setNewInstructor] = useState("");
  const [newDays, setNewDays] = useState<("M" | "T" | "W" | "Th" | "F")[]>(["T", "Th"]);
  const [newStartTime, setNewStartTime] = useState("11:00");
  const [newEndTime, setNewEndTime] = useState("12:15");
  const [newLocation, setNewLocation] = useState("");

  // Retake import modal state
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [selectedSourceSem, setSelectedSourceSem] = useState<string>("");

  // Confirm uncheck required course modal
  const [confirmUncheckCourse, setConfirmUncheckCourse] = useState<CourseCatalogItem | null>(null);
  const [sectionNotice, setSectionNotice] = useState<string | null>(null);

  const handleAddSection = (course: CourseCatalogItem) => {
    const newSec: CourseSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      courseId: course.id,
      sectionNumber: newSecNumber || `0${course.sections.length + 1}`,
      instructor: newInstructor || course.instructor || "Staff",
      days: newDays.length > 0 ? newDays : ["M", "W"],
      startTime: newStartTime || "09:00",
      endTime: newEndTime || "10:15",
      location: newLocation || "Main Hall",
    };

    onUpdateCourseSections(course.id, [...course.sections, newSec]);
    setNewSecNumber("0" + (course.sections.length + 2));
  };

  const handleDeleteSection = (course: CourseCatalogItem, sectionId: string) => {
    if (course.sections.length <= 1) {
      setSectionNotice("A course must have at least one section.");
      return;
    }
    const updated = course.sections.filter((s: CourseSection) => s.id !== sectionId);
    onUpdateCourseSections(course.id, updated);
  };

  const handleDayToggle = (day: "M" | "T" | "W" | "Th" | "F") => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter((d) => d !== day));
    } else {
      setNewDays([...newDays, day]);
    }
  };

  const handleRequiredCheckboxChange = (course: CourseCatalogItem, checked: boolean) => {
    if (!checked) {
      // Prompt confirmation before unchecking required status
      setConfirmUncheckCourse(course);
    } else {
      onToggleRequired(course.id, true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {sectionNotice && (
        <div className="rounded-xl px-4 py-3 text-xs font-semibold flex items-center justify-between border bg-amber-50 border-amber-200 text-amber-700">
          <span>{sectionNotice}</span>
          <button onClick={() => setSectionNotice(null)} className="opacity-60 hover:opacity-100 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Configure Sections & Catalog</h2>
          <p className="text-sm text-gray-500">Each course identity supports multiple sections. Do not duplicate courses.</p>
        </div>

        {priorSemesters.length > 0 && (
          <button
            onClick={() => setShowRetakeModal(true)}
            className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-500 text-xs font-semibold rounded-xl border border-primary-200 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Import Retakes from Prior Semester
          </button>
        )}
      </div>

      {/* Course List & Section Management */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden transition-all">
              <div
                onClick={() => setExpandedCourseId(isExpanded ? "" : course.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-10 rounded-full" style={{ backgroundColor: course.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{course.code}</span>
                      <span className="text-sm text-gray-600 font-medium">— {course.title}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-md">
                        {course.credits} credits
                      </span>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-500 font-semibold text-xs rounded-md">
                        {course.sections.length} section(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={course.isRequired}
                      onChange={(e) => handleRequiredCheckboxChange(course, e.target.checked)}
                      className="rounded text-primary-400"
                    />
                    Required
                  </label>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Active Sections</h4>

                  <div className="space-y-2">
                    {course.sections.map((sec: CourseSection) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-500 font-semibold text-xs flex items-center justify-center">
                            Sec {sec.sectionNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-xs">
                                {sec.days.join(", ")} {sec.startTime} - {sec.endTime}
                              </span>
                              {sec.location && <span className="text-gray-400 text-xs">({sec.location})</span>}
                            </div>
                            <p className="text-[11px] text-gray-500">Instructor: {sec.instructor}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSection(course, sec.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Section Form */}
                  <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 space-y-3">
                    <h5 className="text-xs font-semibold text-gray-800">Add Alternate Section</h5>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Section #</label>
                        <input
                          type="text"
                          value={newSecNumber}
                          onChange={(e) => setNewSecNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Instructor</label>
                        <input
                          type="text"
                          placeholder={course.instructor || "Staff"}
                          value={newInstructor}
                          onChange={(e) => setNewInstructor(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Days</label>
                      <div className="flex gap-1.5">
                        {(["M", "T", "W", "Th", "F"] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleDayToggle(d)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                              newDays.includes(d)
                                ? "bg-primary-400 text-white shadow-xs"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleAddSection(course)}
                        className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save Section
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          Set Schedule Preferences <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Retake Import Modal */}
      {showRetakeModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Import Courses from Prior Semester</h3>
            <p className="text-xs text-gray-500">Select a past finalized semester to re-import courses with fresh section selection.</p>

            <select
              value={selectedSourceSem}
              onChange={(e) => setSelectedSourceSem(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm"
            >
              <option value="">-- Choose Semester --</option>
              {priorSemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.term} {s.year})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRetakeModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!selectedSourceSem}
                onClick={() => {
                  onImportRetake(selectedSourceSem);
                  setShowRetakeModal(false);
                }}
                className="px-4 py-2 bg-primary-400 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                Import Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required Flag Uncheck Confirmation Modal */}
      {confirmUncheckCourse && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Uncheck Required Flag?</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to mark <span className="font-bold">{confirmUncheckCourse.code}</span> as an elective?
              This allows the schedule optimizer to replace it with alternative electives if a severe time conflict occurs.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmUncheckCourse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Keep Required
              </button>
              <button
                onClick={() => {
                  onToggleRequired(confirmUncheckCourse.id, false);
                  setConfirmUncheckCourse(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl"
              >
                Confirm as Elective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
