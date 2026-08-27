import React, { useState } from "react";
import { X, Bell, Check, Filter, Settings, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { NotificationItem, NotificationSettings, CourseCatalogItem } from "@/app/lib/client/coursePlanner/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  courses: CourseCatalogItem[];
  settings: NotificationSettings;
  onMarkRead: (id: string) => void;
  onUpdateSettings: (updates: Partial<NotificationSettings>) => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  courses,
  settings,
  onMarkRead,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "attendance" | "deadline" | "adaptive" | "settings">("all");

  if (!isOpen) return null;

  const filtered = activeTab === "all"
    ? notifications
    : activeTab === "settings"
    ? []
    : notifications.filter((n) => n.category === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-all">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-900 text-white">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-primary-400" />
            <span className="font-bold text-base">Notifications Queue</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-400 text-white text-[10px] font-semibold rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 p-2 gap-1 overflow-x-auto text-xs font-semibold">
          {(["all", "attendance", "deadline", "adaptive", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-primary-400 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeTab === "settings" ? (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">Notification Settings</h4>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Deadline Reminder Lead Time</label>
                <select
                  value={settings.reminderLeadTimeHours}
                  onChange={(e) => onUpdateSettings({ reminderLeadTimeHours: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="1">1 Hour Before</option>
                  <option value="12">12 Hours Before</option>
                  <option value="24">24 Hours Before (1 Day)</option>
                  <option value="48">48 Hours Before (2 Days)</option>
                </select>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Muted Courses</h5>
                <div className="space-y-2">
                  {courses.map((c) => {
                    const isMuted = settings.mutedCourseIds.includes(c.id);
                    return (
                      <div key={c.id} className="p-2.5 bg-gray-50 border rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">{c.code}</span>
                        <button
                          onClick={() => {
                            const newMuted = isMuted
                              ? settings.mutedCourseIds.filter((id: string) => id !== c.id)
                              : [...settings.mutedCourseIds, c.id];
                            onUpdateSettings({ mutedCourseIds: newMuted });
                          }}
                          className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${
                            isMuted ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {isMuted ? "Muted" : "Active"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No notifications in this category.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.read ? "bg-white border-gray-200 opacity-75" : "bg-primary-100/50 border-primary-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-200 text-primary-500 text-[9px] font-semibold rounded uppercase">
                      {item.category}
                    </span>
                    <span className="font-bold text-gray-900 text-xs">{item.title}</span>
                  </div>

                  {!item.read && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                <span className="text-[10px] text-gray-400 block mt-2">{item.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
