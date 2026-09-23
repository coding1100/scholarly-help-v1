import React, { useState } from "react";
import { FiZap, FiArrowRight, FiArrowLeft, FiSun, FiMoon, FiCalendar, FiUserCheck, FiLoader } from "react-icons/fi";
import { SchedulePreferences } from "@/app/lib/client/coursePlanner/types";

interface Props {
  initialPrefs?: SchedulePreferences;
  onNext: (prefs: SchedulePreferences) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const Step4Preferences: React.FC<Props> = ({ initialPrefs, onNext, onBack, isSubmitting }) => {
  const [nlPrompt, setNlPrompt] = useState(
    initialPrefs?.rawPrompt || "I prefer no morning classes, want Fridays off, and like Dr. Smith."
  );
  const [noMorning, setNoMorning] = useState(initialPrefs?.noMorningClasses || false);
  const [noFriday, setNoFriday] = useState(initialPrefs?.noFridayClasses || false);
  const [maxDays, setMaxDays] = useState(initialPrefs?.maxCampusDays || 4);
  const [instructor, setInstructor] = useState(initialPrefs?.preferredInstructors?.[0] || "");
  const [dislikedInstructor, setDislikedInstructor] = useState(initialPrefs?.dislikedInstructors?.[0] || "");
  const [windowStart, setWindowStart] = useState(initialPrefs?.preferredTimeWindows?.[0]?.start || "");
  const [windowEnd, setWindowEnd] = useState(initialPrefs?.preferredTimeWindows?.[0]?.end || "");

  const handleQuickPreset = (preset: string) => {
    if (preset === "no_morning") setNoMorning(!noMorning);
    if (preset === "no_friday") setNoFriday(!noFriday);
    if (preset === "minimize_days") setMaxDays(maxDays === 3 ? 5 : 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      rawPrompt: nlPrompt,
      noMorningClasses: noMorning,
      noFridayClasses: noFriday,
      maxCampusDays: maxDays,
      preferredInstructors: instructor.trim() ? [instructor.trim()] : [],
      dislikedInstructors: dislikedInstructor.trim() ? [dislikedInstructor.trim()] : [],
      preferredTimeWindows:
        windowStart.trim() && windowEnd.trim() ? [{ start: windowStart.trim(), end: windowEnd.trim() }] : [],
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center text-primary-400">
          <FiZap className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Schedule Preferences</h2>
          <p className="text-xs text-gray-500">Tell the optimizer how you prefer your weekly class schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Natural Language Prompt Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiZap className="w-3.5 h-3.5 text-primary-400" /> Natural Language Preference Prompt
          </label>
          <textarea
            rows={3}
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. No classes before 10 AM, free Fridays, minimize days on campus..."
            className="w-full px-3.5 py-3 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Our scheduler automatically parses time bounds, day requests, and instructor preferences.</p>
        </div>

        {/* Quick Toggles */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-500 tracking-wide">Quick Preference Toggles</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleQuickPreset("no_morning")}
              className={`p-3 rounded-lg border text-left transition-colors ${
                noMorning
                  ? "border-primary-300 bg-primary-100 text-primary-400 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiSun className={`w-4 h-4 mb-1 ${noMorning ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">No Morning Classes</div>
              <div className="text-xs text-gray-500">Classes starting after 10 AM</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("no_friday")}
              className={`p-3 rounded-lg border text-left transition-colors ${
                noFriday
                  ? "border-primary-300 bg-primary-100 text-primary-400 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiCalendar className={`w-4 h-4 mb-1 ${noFriday ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">Fridays Off</div>
              <div className="text-xs text-gray-500">3-day weekends</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("minimize_days")}
              className={`p-3 rounded-lg border text-left transition-colors ${
                maxDays <= 3
                  ? "border-primary-300 bg-primary-100 text-primary-400 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiMoon className={`w-4 h-4 mb-1 ${maxDays <= 3 ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">Compact Schedule</div>
              <div className="text-xs text-gray-500">Max 3 campus days</div>
            </button>
          </div>
        </div>

        {/* Fine Tuning Controls */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Max Preferred Campus Days</label>
            <select
              value={maxDays}
              onChange={(e) => setMaxDays(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="2">2 Days per week</option>
              <option value="3">3 Days per week</option>
              <option value="4">4 Days per week</option>
              <option value="5">5 Days per week (Any)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FiUserCheck className="w-3.5 h-3.5 text-gray-400" /> Preferred Instructor
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Smith"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FiUserCheck className="w-3.5 h-3.5 text-gray-400" /> Instructor to Avoid
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Jones"
              value={dislikedInstructor}
              onChange={(e) => setDislikedInstructor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <FiSun className="w-3.5 h-3.5 text-gray-400" /> Preferred Time Window (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={windowStart}
                onChange={(e) => setWindowStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="time"
                value={windowEnd}
                onChange={(e) => setWindowEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Classes outside this window count as a compromise.</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                Generate Schedule Options <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
