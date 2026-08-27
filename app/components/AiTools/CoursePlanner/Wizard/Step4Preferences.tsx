import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Sun, Moon, CalendarX, UserCheck, Loader2 } from "lucide-react";
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
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200/80 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Schedule Preferences</h2>
          <p className="text-sm text-gray-500">Tell the optimizer how you prefer your weekly class schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Natural Language Prompt Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary-400" /> Natural Language Preference Prompt
          </label>
          <textarea
            rows={3}
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. No classes before 10 AM, free Fridays, minimize days on campus..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Our scheduler automatically parses time bounds, day requests, and instructor preferences.</p>
        </div>

        {/* Quick Toggles */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Quick Preference Toggles</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleQuickPreset("no_morning")}
              className={`p-3 rounded-xl border text-left transition-all ${
                noMorning
                  ? "border-primary-400 bg-primary-100/50 text-primary-500 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <Sun className={`w-5 h-5 mb-1 ${noMorning ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">No Morning Classes</div>
              <div className="text-[10px] text-gray-500">Classes starting &gt; 10 AM</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("no_friday")}
              className={`p-3 rounded-xl border text-left transition-all ${
                noFriday
                  ? "border-primary-400 bg-primary-100/50 text-primary-500 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <CalendarX className={`w-5 h-5 mb-1 ${noFriday ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">Fridays Off</div>
              <div className="text-[10px] text-gray-500">3-day weekends</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset("minimize_days")}
              className={`p-3 rounded-xl border text-left transition-all ${
                maxDays <= 3
                  ? "border-primary-400 bg-primary-100/50 text-primary-500 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <Moon className={`w-5 h-5 mb-1 ${maxDays <= 3 ? "text-primary-400" : "text-gray-400"}`} />
              <div className="text-xs font-semibold">Compact Schedule</div>
              <div className="text-[10px] text-gray-500">Max 3 campus days</div>
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
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
            >
              <option value="2">2 Days per week</option>
              <option value="3">3 Days per week</option>
              <option value="4">4 Days per week</option>
              <option value="5">5 Days per week (Any)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-gray-400" /> Preferred Instructor
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Smith"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                Generate Schedule Options <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
