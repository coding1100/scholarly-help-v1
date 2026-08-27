import React, { useState } from "react";
import { Calendar as CalendarIcon, Plus, Filter, Clock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
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
      color: "#8b5cf6",
    });

    setEventTitle("");
    setShowEventModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Unified Academic Calendar</h2>
          <p className="text-sm text-gray-500">Classes, coursework deadlines, and personal schedule events in one view</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "month" ? "bg-white text-primary-400 shadow-2xs" : "text-gray-600"
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "agenda" ? "bg-white text-primary-400 shadow-2xs" : "text-gray-600"
              }`}
            >
              Agenda List
            </button>
          </div>

          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Personal Event
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Category:
        </span>
        {(["all", "class", "coursework", "personal"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-xl capitalize transition-all ${
              filterCategory === cat
                ? "bg-gray-900 text-white shadow-2xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">Upcoming Agenda Events</h3>

          <div className="space-y-3">
            {coursework
              .filter((cw) => filterCategory === "all" || filterCategory === "coursework")
              .map((cw) => {
                const course = courses.find((c) => c.id === cw.courseId);
                return (
                  <div key={cw.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-10 rounded-full" style={{ backgroundColor: course?.color || "#3b82f6" }} />
                      <div>
                        <span className="font-bold text-gray-900 text-xs">{cw.title}</span>
                        <span className="text-xs text-primary-400 font-semibold ml-2">[{course?.code || "COURSE"}]</span>
                        <p className="text-[11px] text-gray-400">Due: {cw.dueDate.replace("T", " ")}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-md">
                      Coursework
                    </span>
                  </div>
                );
              })}

            {calendarEvents
              .filter((e) => filterCategory === "all" || filterCategory === e.category)
              .map((e) => (
                <div key={e.id} className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 text-xs">{e.title}</span>
                    <p className="text-[11px] text-purple-700">
                      {e.date} ({e.startTime} - {e.endTime})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-200 text-purple-800 text-[10px] font-semibold rounded-md">
                      Personal
                    </span>
                    <button
                      onClick={() => onDeletePersonalEvent(e.id)}
                      className="text-purple-400 hover:text-red-600 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Month View Grid */}
      {viewMode === "month" && (
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-gray-900 w-40 text-center">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              <button
                onClick={() => shiftMonth(1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
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
                const dayTasks = coursework.filter((cw) => cw.dueDate.startsWith(dayStr));
                const dayEvents = calendarEvents.filter((ev) => ev.date === dayStr);
                const isToday = dayStr === todayStr;

                cells.push(
                  <div
                    key={dayNum}
                    className={`min-h-[75px] rounded-xl border p-2 text-left space-y-1 ${
                      isToday ? "bg-primary-100 border-primary-300" : "bg-gray-50 border-gray-100"
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
                        style={{ backgroundColor: ev.color || "#8b5cf6" }}
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateEvent} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Personal Event</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Study Group Session / Career Fair"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-400 text-white text-xs font-semibold rounded-xl shadow-xs"
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
