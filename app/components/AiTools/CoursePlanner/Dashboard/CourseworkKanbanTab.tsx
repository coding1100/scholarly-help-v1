import React, { useState } from "react";
import { FiPlus, FiTrash2, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import { CourseCatalogItem, Coursework, KanbanStatus, PriorityLevel, CourseworkType } from "@/app/lib/client/coursePlanner/types";

interface Props {
  semesterId: string;
  courses: CourseCatalogItem[];
  coursework: Coursework[];
  onCreateCoursework: (item: Omit<Coursework, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateCoursework: (id: string, updates: Partial<Coursework>) => void;
  onDeleteCoursework: (id: string) => void;
}

export const CourseworkKanbanTab: React.FC<Props> = ({
  semesterId,
  courses,
  coursework,
  onCreateCoursework,
  onUpdateCoursework,
  onDeleteCoursework,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");

  // Add form state
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 16));
  const [type, setType] = useState<CourseworkType>("assignment");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [description, setDescription] = useState("");

  const columns: { id: KanbanStatus; title: string; color: string }[] = [
    { id: "backlog", title: "Backlog", color: "bg-gray-50 border-gray-200" },
    { id: "todo", title: "To Do", color: "bg-primary-100/50 border-primary-200" },
    { id: "in_progress", title: "In Progress", color: "bg-secondary-200/20 border-secondary-200" },
    { id: "done", title: "Done", color: "bg-gray-50 border-gray-200" },
  ];

  const filteredCoursework = selectedCourseFilter === "all"
    ? coursework
    : coursework.filter((cw) => cw.courseId === selectedCourseFilter);

  // Check same-day pile up
  const dueDatesCount: Record<string, number> = {};
  coursework.forEach((cw) => {
    const d = cw.dueDate.slice(0, 10);
    dueDatesCount[d] = (dueDatesCount[d] || 0) + 1;
  });
  const pileUpDates = Object.keys(dueDatesCount).filter((d) => dueDatesCount[d] >= 3);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: KanbanStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      onUpdateCoursework(id, {
        kanbanStatus: targetStatus,
        completionState: targetStatus === "done" ? "done" : "pending",
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) return;

    onCreateCoursework({
      semesterId,
      courseId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      type,
      kanbanStatus: "todo",
      priority,
      completionState: "pending",
    });

    setTitle("");
    setDescription("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Coursework Kanban Board</h2>
          <p className="text-xs text-gray-500">Persisted drag-and-drop task tracking with same-day pile-up detection</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-semibold text-gray-700"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Same-Day Pile-Up Warning Banner */}
      {pileUpDates.length > 0 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-5 h-5 text-primary-400" />
            <div>
              <h4 className="text-xs font-semibold text-gray-800">Same-Day Workload Pile-Up Alert</h4>
              <p className="text-xs text-gray-500">
                You have {dueDatesCount[pileUpDates[0]]} major deadlines on {pileUpDates[0]}. Adaptive Planning has logged an auto-rebalancing proposal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredCoursework.filter((cw) => cw.kanbanStatus === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`p-4 rounded-lg border min-h-[450px] space-y-3 ${col.color}`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="font-semibold text-gray-800 text-xs tracking-wide">{col.title}</span>
                <span className="px-2 py-0.5 bg-white text-gray-700 font-semibold text-xs rounded-full ring-1 ring-gray-200">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => {
                  const course = courses.find((c) => c.id === task.courseId);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: course?.color || "#3b82f6" }}>
                          {course?.code || "COURSE"}
                        </span>
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ring-1 ${
                            task.priority === "high"
                              ? "bg-red-50 text-red-600 ring-red-200"
                              : task.priority === "medium"
                              ? "bg-secondary-200/40 text-secondary-500 ring-secondary-200"
                              : "bg-gray-100 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-800 text-xs">{task.title}</h4>
                      {task.description && <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>}

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gray-400" /> {task.dueDate.replace("T", " ")}
                        </span>
                        <button
                          onClick={() => onDeleteCoursework(task.id)}
                          className="text-gray-300 hover:text-red-600 transition-colors"
                          aria-label={`Delete ${task.title}`}
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Keyboard/screen-reader alternative to drag-and-drop —
                          moving a card between columns should not require a mouse. */}
                      <label className="sr-only" htmlFor={`move-${task.id}`}>
                        Move &quot;{task.title}&quot; to a different column
                      </label>
                      <select
                        id={`move-${task.id}`}
                        value={task.kanbanStatus}
                        onChange={(e) => {
                          const targetStatus = e.target.value as KanbanStatus;
                          onUpdateCoursework(task.id, {
                            kanbanStatus: targetStatus,
                            completionState: targetStatus === "done" ? "done" : "pending",
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 bg-white"
                      >
                        {columns.map((c) => (
                          <option key={c.id} value={c.id}>
                            Move to: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Add Coursework Task</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Exam Prep, Essay 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-400/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CourseworkType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
