import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiArrowRight, FiArrowLeft, FiRefreshCw, FiAlertTriangle, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
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
  const [expandedCourseId, setExpandedCourseId] = useState<string>("");

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

  // Next available number, not just "count + 1" — that breaks past 9
  // sections ("010" via naive string concatenation) and can collide with an
  // existing number after a lower one was deleted (e.g. delete "03" then
  // "add" recomputes from length and can reissue an already-used number).
  const nextSectionNumber = (course: CourseCatalogItem): string => {
    const used = course.sections
      .map((s) => parseInt(s.sectionNumber, 10))
      .filter((n) => !Number.isNaN(n));
    const next = used.length > 0 ? Math.max(...used) + 1 : course.sections.length + 1;
    return String(next).padStart(2, "0");
  };

  // `courses` can still be `[]` on first mount while SetupWizard's resume
  // effect is fetching them — a useState initializer only runs once, so
  // seeding from courses[0] at declaration time permanently missed the
  // auto-expand once courses actually arrived. Expand the first course the
  // first time the pool becomes non-empty instead.
  useEffect(() => {
    if (!expandedCourseId && courses.length > 0) {
      setExpandedCourseId(courses[0].id);
      setNewSecNumber(nextSectionNumber(courses[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses.length]);

  const handleAddSection = (course: CourseCatalogItem) => {
    const newSec: CourseSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      courseId: course.id,
      sectionNumber: newSecNumber || nextSectionNumber(course),
      instructor: newInstructor || course.instructor || "Staff",
      days: newDays.length > 0 ? newDays : ["M", "W"],
      startTime: newStartTime || "09:00",
      endTime: newEndTime || "10:15",
      location: newLocation || "Main Hall",
    };

    onUpdateCourseSections(course.id, [...course.sections, newSec]);
    setNewSecNumber(nextSectionNumber({ ...course, sections: [...course.sections, newSec] }));
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
        <div className="rounded-lg px-4 py-3 text-xs font-semibold flex items-center justify-between border bg-primary-100 border-primary-200 text-primary-400">
          <span>{sectionNotice}</span>
          <button onClick={() => setSectionNotice(null)} className="opacity-60 hover:opacity-100 p-1">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Configure Sections & Catalog</h2>
          <p className="text-xs text-gray-500">Each course identity supports multiple sections. Do not duplicate courses.</p>
        </div>

        {priorSemesters.length > 0 && (
          <button
            onClick={() => setShowRetakeModal(true)}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Import Retakes from Prior Semester
          </button>
        )}
      </div>

      {/* Course List & Section Management */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div
                onClick={() => {
                  const willExpand = !isExpanded;
                  setExpandedCourseId(willExpand ? course.id : "");
                  if (willExpand) setNewSecNumber(nextSectionNumber(course));
                }}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: course.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{course.code}</span>
                      <span className="text-sm text-gray-600">{course.title}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-semibold text-xs rounded-full ring-1 ring-gray-200">
                        {course.credits} credits
                      </span>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-400 font-semibold text-xs rounded-full ring-1 ring-primary-300">
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
                  {isExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 tracking-wide">Active Sections</h4>

                  <div className="space-y-2">
                    {course.sections.map((sec: CourseSection) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-400 font-semibold text-xs flex items-center justify-center">
                            Sec {sec.sectionNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-xs">
                                {sec.days.join(", ")} {sec.startTime} - {sec.endTime}
                              </span>
                              {sec.location && <span className="text-gray-400 text-xs">({sec.location})</span>}
                            </div>
                            <p className="text-xs text-gray-500">Instructor: {sec.instructor}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSection(course, sec.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Section Form */}
                  <div className="p-4 bg-white rounded-lg border border-dashed border-gray-300 space-y-3">
                    <h5 className="text-xs font-semibold text-gray-800">Add Alternate Section</h5>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Section #</label>
                        <input
                          type="text"
                          value={newSecNumber}
                          onChange={(e) => setNewSecNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Instructor</label>
                        <input
                          type="text"
                          placeholder={course.instructor || "Staff"}
                          value={newInstructor}
                          onChange={(e) => setNewInstructor(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                        <input
                          type="time"
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Days</label>
                      <div className="flex gap-1.5">
                        {(["M", "T", "W", "Th", "F"] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleDayToggle(d)}
                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                              newDays.includes(d)
                                ? "bg-primary-400 text-white"
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
                        className="px-3 py-1.5 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Save Section
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
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          Set Schedule Preferences <FiArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Retake Import Modal */}
      {showRetakeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Import Courses from Prior Semester</h3>
            <p className="text-xs text-gray-500">Select a past finalized semester to re-import courses with fresh section selection.</p>

            <select
              value={selectedSourceSem}
              onChange={(e) => setSelectedSourceSem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Choose semester</option>
              {priorSemesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.term} {s.year})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRetakeModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!selectedSourceSem}
                onClick={() => {
                  onImportRetake(selectedSourceSem);
                  setShowRetakeModal(false);
                }}
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Import Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Required Flag Uncheck Confirmation Modal */}
      {confirmUncheckCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-primary-400">
              <FiAlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Uncheck Required Flag?</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to mark <span className="font-semibold">{confirmUncheckCourse.code}</span> as an elective?
              This allows the schedule optimizer to replace it with alternative electives if a severe time conflict occurs.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmUncheckCourse(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Keep Required
              </button>
              <button
                onClick={() => {
                  onToggleRequired(confirmUncheckCourse.id, false);
                  setConfirmUncheckCourse(null);
                }}
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors"
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
