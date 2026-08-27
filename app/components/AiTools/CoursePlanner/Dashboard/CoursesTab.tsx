import React, { useState } from "react";
import { Plus, Trash2, Bell, BellOff, RefreshCw, AlertTriangle, Check, BookOpen } from "lucide-react";
import { CourseCatalogItem } from "@/app/lib/client/coursePlanner/types";

interface Props {
  courses: CourseCatalogItem[];
  onUpdateCourse: (id: string, updates: Partial<CourseCatalogItem>) => void;
  onDeleteCourse: (id: string) => void;
}

export const CoursesTab: React.FC<Props> = ({
  courses,
  onUpdateCourse,
  onDeleteCourse,
}) => {
  const [dropConfirmCourse, setDropConfirmCourse] = useState<CourseCatalogItem | null>(null);
  const [replaceModalCourse, setReplaceModalCourse] = useState<CourseCatalogItem | null>(null);

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

  const handleColorChange = (courseId: string, newColor: string) => {
    onUpdateCourse(courseId, { color: newColor });
  };

  const handleToggleMute = (course: CourseCatalogItem) => {
    onUpdateCourse(course.id, { mutedNotifications: !course.mutedNotifications });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Courses Management</h2>
          <p className="text-sm text-gray-500">Edit course colors, mute notifications, replace courses, or drop with cascade cleanup</p>
        </div>

        <div className="text-xs text-gray-400 font-semibold">
          {courses.length} Active Courses
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-12 rounded-full" style={{ backgroundColor: course.color }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base">{course.code}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-semibold text-xs rounded-md">
                      {course.credits} cr
                    </span>
                    {course.isRequired && (
                      <span className="px-2 py-0.5 bg-primary-200 text-primary-500 font-semibold text-xs rounded-md">
                        Required
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">{course.title}</h3>
                  {course.instructor && <p className="text-xs text-gray-500">Instructor: {course.instructor}</p>}
                </div>
              </div>

              <button
                onClick={() => handleToggleMute(course)}
                className={`p-2 rounded-xl border transition-all ${
                  course.mutedNotifications
                    ? "bg-amber-50 border-amber-200 text-amber-600"
                    : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600"
                }`}
                title={course.mutedNotifications ? "Notifications Muted" : "Mute Notifications"}
              >
                {course.mutedNotifications ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            </div>

            {/* Color Tag Picker */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">Color Tag:</span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(course.id, c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      course.color === c ? "border-gray-900 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setReplaceModalCourse(course)}
                className="px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-500 text-xs font-semibold rounded-xl border border-primary-200 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Replace Course
              </button>

              <button
                onClick={() => setDropConfirmCourse(course)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Drop Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drop Course Cascade Confirmation Modal */}
      {dropConfirmCourse && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Drop Course with Cascade Cleanup?</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to drop <span className="font-bold">{dropConfirmCourse.code} — {dropConfirmCourse.title}</span>?
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              ⚠️ Warning: Dropping this course will permanently delete all dependent coursework tasks and attendance logs.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDropConfirmCourse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCourse(dropConfirmCourse.id);
                  setDropConfirmCourse(null);
                }}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Confirm Drop Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Course Modal */}
      {replaceModalCourse && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Replace {replaceModalCourse.code}</h3>
            <p className="text-xs text-gray-500">
              Conflict-free alternative suggestions are not available yet. For now, drop {replaceModalCourse.code}
              {" "}from Courses and add its replacement from the semester setup wizard instead.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReplaceModalCourse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
