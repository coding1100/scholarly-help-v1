import React, { useState } from "react";
import { FiCalendar, FiTarget, FiArrowRight, FiLoader } from "react-icons/fi";
import { Semester } from "@/app/lib/client/coursePlanner/types";

interface Props {
  initialData?: Partial<Semester>;
  onNext: (data: { name: string; term: Semester["term"]; year: number; creditTarget: number; startDate: string; endDate: string }) => void;
  isSubmitting?: boolean;
}

export const Step1SemesterInfo: React.FC<Props> = ({ initialData, onNext, isSubmitting }) => {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState(initialData?.name || "Fall 2026 Semester");
  const [term, setTerm] = useState<Semester["term"]>(initialData?.term || "Fall");
  const [year, setYear] = useState<number>(initialData?.year || currentYear);
  const [creditTarget, setCreditTarget] = useState<number>(initialData?.creditTarget || 15);
  const [startDate, setStartDate] = useState(initialData?.startDate || `${currentYear}-09-01`);
  const [endDate, setEndDate] = useState(initialData?.endDate || `${currentYear}-12-20`);
  const [validationError, setValidationError] = useState<string | null>(null);

  const MIN_YEAR = currentYear - 1;
  const MAX_YEAR = currentYear + 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Semester name is required.");
      return;
    }
    if (year < MIN_YEAR || year > MAX_YEAR) {
      setValidationError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}.`);
      return;
    }
    if (startDate && endDate && startDate >= endDate) {
      setValidationError("End date must be after the start date.");
      return;
    }
    setValidationError(null);
    onNext({ name, term, year, creditTarget, startDate, endDate });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Semester Setup</h2>
        <p className="text-xs text-gray-500">Define your term dates and target credit load</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Semester Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Fall 2026 Semester"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Term</label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value as Semester["term"])}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm bg-white"
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Year</label>
            <input
              type="number"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-gray-400" /> Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-gray-400" /> End Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <FiTarget className="w-3.5 h-3.5 text-primary-400" /> Target Credit Load
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="6"
              max="24"
              step="1"
              value={creditTarget}
              onChange={(e) => setCreditTarget(parseInt(e.target.value, 10))}
              className="flex-1 accent-primary-400 cursor-pointer"
            />
            <span className="w-16 px-3 py-1.5 bg-primary-100 text-primary-400 font-semibold text-center rounded-lg text-sm ring-1 ring-primary-300">
              {creditTarget} hrs
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Recommended load is 12 to 18 credits per semester.</p>
        </div>

        {validationError && (
          <p className="text-xs font-semibold text-red-600">{validationError}</p>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Continue to Course Pool <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
