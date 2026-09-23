import React, { useState } from "react";
import { FiPlus, FiFilter, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CourseCatalogItem, Coursework, CalendarEvent, CalendarCategory } from "@/app/lib/client/coursePlanner/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  courses: CourseCatalogItem[];
  coursework: Coursework[];
  calendarEvents: CalendarEvent[];
  onAddPersonalEvent: (event: Omit<CalendarEvent, "id" | "userId" | "createdAt">) => void;
  onDeletePersonalEvent: (id: string) => void;
}

export const CalendarTab: React.FC<Props> = ({
  courses,
  coursework,
  calendarEvents,
  onAddPersonalEvent,
  onDeletePersonalEvent,
}) => {
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [filterCategory, setFilterCategory] = useState<"all" | CalendarCategory>("all");
  const [showEventModal, setShowEventModal] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  // Personal Event Form
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onAddPersonalEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime,
      endTime,
      category: "personal",
      color: "#565add",
    });

    setEventTitle("");
    setShowEventModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Unified Academic Calendar</h2>
          <p className="text-xs text-gray-500">Classes, coursework deadlines, and personal schedule events in one view</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "month" ? "bg-white text-primary-400 shadow-sm" : "text-gray-600"
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === "agenda" ? "bg-white text-primary-400 shadow-sm" : "text-gray-600"
              }`}
            >
              Agenda List
            </button>
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" /> Personal Event
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          <FiFilter className="w-3.5 h-3.5" /> Filter Category
        </span>
        {(["all", "class", "coursework", "personal"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ring-1 ${
              filterCategory === cat
                ? "bg-primary-400 text-white ring-primary-400"
                : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Upcoming Agenda Events</h3>

          <div className="space-y-3">
            {coursework
              .filter((cw) => filterCategory === "all" || filterCategory === "coursework")
              .map((cw) => {
                const course = courses.find((c) => c.id === cw.courseId);
                return (
                  <div key={cw.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: course?.color || "#3b82f6" }} />
                      <div>
                        <span className="font-semibold text-gray-800 text-xs">{cw.title}</span>
                        <span className="text-xs text-primary-400 font-semibold ml-2">[{course?.code || "COURSE"}]</span>
                        <p className="text-xs text-gray-400">Due: {cw.dueDate.replace("T", " ")}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-secondary-200/40 text-secondary-500 text-xs font-semibold rounded-full ring-1 ring-secondary-200">
                      Coursework
                    </span>
                  </div>
                );
              })}

            {calendarEvents
              .filter((e) => filterCategory === "all" || filterCategory === e.category)
              .map((e) => (
                <div key={e.id} className="p-3.5 bg-primary-100 border border-primary-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-primary-500 text-xs">{e.title}</span>
                    <p className="text-xs text-primary-400">
                      {e.date} ({e.startTime} - {e.endTime})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-white text-primary-400 text-xs font-semibold rounded-full ring-1 ring-primary-300">
                      Personal
                    </span>
                    <button
                      onClick={() => onDeletePersonalEvent(e.id)}
                      className="text-primary-400 hover:text-red-600 p-1 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Month View Grid */}
      {viewMode === "month" && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Previous month"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-gray-800 w-40 text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              <button
                onClick={() => shiftMonth(1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Next month"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-gray-400">Showing active class & coursework events</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-xs text-gray-400 pb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {(() => {
              const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              const todayStr = today.toISOString().split("T")[0];
              const cells = [];

              for (let i = 0; i < firstDayOfWeek; i++) {
                cells.push(<div key={`pad-${i}`} />);
              }

              for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dayTasks =
                  filterCategory === "all" || filterCategory === "coursework"
                    ? coursework.filter((cw) => cw.dueDate.startsWith(dayStr))
                    : [];
                const dayEvents = calendarEvents.filter(
                  (ev) => ev.date === dayStr && (filterCategory === "all" || filterCategory === ev.category)
                );
                const isToday = dayStr === todayStr;

                cells.push(
                  <div
                    key={dayNum}
                    className={`min-h-[75px] rounded-lg border p-2 text-left space-y-1 ${
                      isToday ? "bg-primary-100 border-primary-300" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className={`font-semibold text-xs ${isToday ? "text-primary-500" : "text-gray-700"}`}>{dayNum}</span>
                    {dayTasks.map((t) => (
                      <div key={t.id} className="p-1 bg-primary-400 text-white rounded text-[9px] truncate font-semibold">
                        {t.title}
                      </div>
                    ))}
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-1 text-white rounded text-[9px] truncate font-semibold"
                        style={{ backgroundColor: ev.color || "#565add" }}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              }

              return cells;
            })()}
          </div>
        </div>
      )}

      {/* Add Personal Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateEvent} className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Add Personal Event</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Study Group Session, Career Fair"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-400/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-400/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-400/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-400/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
