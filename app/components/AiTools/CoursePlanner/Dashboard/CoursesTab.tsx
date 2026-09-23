import React, { useState } from "react";
import { FiTrash2, FiBell, FiBellOff, FiRefreshCw, FiAlertTriangle } from "react-icons/fi";
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
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Courses Management</h2>
          <p className="text-xs text-gray-500">Edit course colors, mute notifications, replace courses, or drop with cascade cleanup</p>
        </div>

        <div className="text-xs text-gray-500 font-semibold">
          {courses.length} active courses
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-12 rounded-full" style={{ backgroundColor: course.color }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{course.code}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-semibold text-xs rounded-full ring-1 ring-gray-200">
                      {course.credits} cr
                    </span>
                    {course.isRequired && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-400 font-semibold text-xs rounded-full ring-1 ring-primary-300">
                        Required
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{course.title}</h3>
                  {course.instructor && <p className="text-xs text-gray-500">Instructor: {course.instructor}</p>}
                </div>
              </div>

              <button
                onClick={() => handleToggleMute(course)}
                className={`p-2 rounded-lg transition-colors ${
                  course.mutedNotifications
                    ? "text-primary-400 hover:bg-primary-100"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
                title={course.mutedNotifications ? "Notifications Muted" : "Mute Notifications"}
              >
                {course.mutedNotifications ? <FiBellOff className="w-4 h-4" /> : <FiBell className="w-4 h-4" />}
              </button>
            </div>

            {/* Color Tag Picker */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">Color Tag</span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(course.id, c)}
                    className={`w-5 h-5 rounded-full border-2 transition-colors ${
                      course.color === c ? "border-gray-800" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled
                title="Coming soon, for now drop this course and add its replacement from the setup wizard."
                className="px-3 py-1.5 bg-white text-gray-400 text-xs font-semibold rounded-lg border border-gray-200 flex items-center gap-1.5 cursor-not-allowed"
              >
                <FiRefreshCw className="w-3.5 h-3.5" /> Replace Course (Coming Soon)
              </button>

              <button
                onClick={() => setDropConfirmCourse(course)}
                className="px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-300 transition-colors hover:border-red-300 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5"
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Drop Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drop Course Cascade Confirmation Modal */}
      {dropConfirmCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <FiAlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-800">Drop Course with Cascade Cleanup?</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to drop <span className="font-semibold">{dropConfirmCourse.code}, {dropConfirmCourse.title}</span>?
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              Warning: dropping this course will permanently delete all dependent coursework tasks and attendance logs.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDropConfirmCourse(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCourse(dropConfirmCourse.id);
                  setDropConfirmCourse(null);
                }}
                className="px-4 py-2 bg-white border border-red-300 text-red-600 text-xs font-semibold rounded-lg transition-colors hover:bg-red-50"
              >
                Confirm Drop Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
