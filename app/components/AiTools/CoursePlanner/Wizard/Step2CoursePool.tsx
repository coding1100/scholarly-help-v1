import React, { useState } from "react";
import { FiUpload, FiPlus, FiTrash2, FiArrowRight, FiArrowLeft, FiLoader, FiZap } from "react-icons/fi";
import { CourseCatalogItem, CourseSection, ExtractedSyllabusCourse } from "@/app/lib/client/coursePlanner/types";
import { CoursePlannerService } from "@/app/lib/client/coursePlanner/service";

const EXTRACT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
const VALID_DAYS: CourseSection["days"][number][] = ["M", "T", "W", "Th", "F", "Sa", "Su"];
const MAX_SYLLABUS_WORDS = 1500;

// Maps common day spellings the LLM might still return (full names,
// three-letter abbreviations, different casing) onto the app's exact day
// tokens, so a value like "Friday" or "fri" resolves correctly instead of
// being silently discarded by a strict token match.
const DAY_ALIASES: Record<string, CourseSection["days"][number]> = {
  m: "M", mon: "M", monday: "M",
  t: "T", tue: "T", tues: "T", tuesday: "T",
  w: "W", wed: "W", wednesday: "W",
  th: "Th", thu: "Th", thur: "Th", thurs: "Th", thursday: "Th",
  f: "F", fri: "F", friday: "F",
  sa: "Sa", sat: "Sa", saturday: "Sa",
  su: "Su", sun: "Su", sunday: "Su",
};

// The LLM response is loosely typed JSON at the API boundary — normalize
// "days" defensively rather than trusting it matches the narrow union. A
// value that can't be parsed at all must NOT silently default to a
// fabricated M/W/F schedule (a previous version did this, and a
// Friday-only section from the syllabus was extracted as also meeting
// Monday/Wednesday) — an empty/unrecognized value is left empty so the UI
// can flag it instead of inventing meeting days.
const normalizeDays = (days: unknown): CourseSection["days"] => {
  if (!Array.isArray(days)) return [];
  const valid = days
    .map((d) => (typeof d === "string" ? DAY_ALIASES[d.trim().toLowerCase()] : undefined))
    .filter((d): d is CourseSection["days"][number] => !!d && VALID_DAYS.includes(d));
  return Array.from(new Set(valid));
};

// A course pool entry as it's POSTed to create a course — sections have no
// `id`/`courseId` yet (the backend assigns both once the parent course
// document exists), matching CreateCourseDto/CourseSectionDto exactly.
type NewPoolCourse = Omit<CourseCatalogItem, "id" | "semesterId" | "sections"> & {
  sections: Omit<CourseSection, "id" | "courseId">[];
};

// Extraction only guarantees a course's identity/timing fields (per the LLM
// schema on the backend) — fill in the rest so it's a valid pool entry.
const toPoolCourse = (
  c: ExtractedSyllabusCourse,
  colorIdx: number
): NewPoolCourse => ({
  code: (c.code || "").toUpperCase() || `COURSE${colorIdx + 1}`,
  title: c.title || "Untitled Course",
  credits: c.credits ?? 3,
  color: EXTRACT_COLORS[colorIdx % EXTRACT_COLORS.length],
  isRequired: c.isRequired ?? true,
  isElective: !(c.isRequired ?? true),
  instructor: c.instructor,
  // No `id`/`courseId` here — same as the manual-entry path just below,
  // the backend's CourseSectionDto rejects both on create
  // (forbidNonWhitelisted) since it assigns its own section id once the
  // parent course document exists, and courseId is unknown until then too.
  // A previous version of this mapping set `courseId: ""`, which is still a
  // present (whitelisted-violating) property from the DTO's perspective —
  // `forbidNonWhitelisted` rejects it whether it's empty or not — and that
  // silently broke every AI-extracted course from ever saving.
  sections: (c.sections && c.sections.length > 0
    ? c.sections
    : [{ sectionNumber: "01", instructor: c.instructor || "Staff", days: ["M", "W", "F"] as CourseSection["days"], startTime: "09:00", endTime: "10:00" }]
  ).map((s) => ({
    sectionNumber: s.sectionNumber || "01",
    instructor: s.instructor || c.instructor || "Staff",
    days: normalizeDays(s.days),
    startTime: s.startTime || "09:00",
    endTime: s.endTime || "10:00",
    location: s.location,
  })),
});

interface Props {
  courses: CourseCatalogItem[];
  onAddCourse: (course: NewPoolCourse) => Promise<boolean>;
  onDeleteCourse: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  /** Gates the AI syllabus-extraction calls (text + file) for guest users,
   * same as every other AI action in this tool. */
  guardAiClick: (run: () => void | Promise<void>) => boolean;
}

export const Step2CoursePool: React.FC<Props> = ({
  courses,
  onAddCourse,
  onDeleteCourse,
  onNext,
  onBack,
  guardAiClick,
}) => {
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");
  const [syllabusText, setSyllabusText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);
  const syllabusWordCount = syllabusText.trim() ? syllabusText.trim().split(/\s+/).length : 0;
  const isSyllabusOverLimit = syllabusWordCount > MAX_SYLLABUS_WORDS;

  // Manual course form
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(3);
  const [instructor, setInstructor] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [isElective, setIsElective] = useState(false);
  const [color, setColor] = useState("#3b82f6");

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

  // onAddCourse (SetupWizard.handleAddCourse) already catches failures and
  // surfaces them via the wizard-level error banner, and resolves to
  // true/false so the form only clears once the course actually persisted.
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const succeeded = await onAddCourse({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      credits,
      instructor: instructor.trim(),
      isRequired,
      isElective,
      color,
      sections: [
        {
          // No `id`/`courseId` here — the backend assigns both once the
          // parent course document exists (CourseSectionDto's `id` is
          // optional and courseId isn't a field on it at all;
          // forbidNonWhitelisted rejects any property the DTO doesn't
          // declare).
          sectionNumber: "01",
          instructor: instructor.trim() || "Staff",
          days: ["M", "W", "F"],
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    });
    if (succeeded) {
      setCode("");
      setTitle("");
      setInstructor("");
    }
  };

  const ALLOWED_EXTRACT_EXTENSIONS = [".pdf", ".docx"];
  const MAX_EXTRACT_FILE_SIZE = 5 * 1024 * 1024; // matches the backend's limit

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dotIndex = file.name.lastIndexOf(".");
    const ext = dotIndex === -1 ? "" : file.name.toLowerCase().slice(dotIndex);
    if (!ALLOWED_EXTRACT_EXTENSIONS.includes(ext)) {
      setExtractionError("Only .pdf and .docx files are supported.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_EXTRACT_FILE_SIZE) {
      setExtractionError("File is too large — the limit is 5MB.");
      e.target.value = "";
      return;
    }

    guardAiClick(async () => {
      setIsExtracting(true);
      setExtractionError(null);
      setExtractionNotice(null);

      try {
        const result = await CoursePlannerService.extractSyllabusFile(file);
        if (!result.courses || result.courses.length === 0) {
          throw new Error("No courses could be extracted from that file. Try pasting the syllabus text instead.");
        }
        if (result.truncated) {
          setExtractionNotice(
            "This document was longer than we could fully process — some courses or assignments near the end may have been missed."
          );
        }
        await addExtractedCourses(result.courses);
      } catch (err: any) {
        setExtractionError(
          err?.response?.data?.message || err?.message || "Syllabus parsing failed. Please try again."
        );
      } finally {
        setIsExtracting(false);
        e.target.value = "";
      }
    });
  };

  // Adds every extracted course one at a time (not fire-and-forget) so a
  // failure on one doesn't silently drop it — if some succeed and some
  // fail, the error message says exactly how many made it in.
  const addExtractedCourses = async (extracted: ExtractedSyllabusCourse[]) => {
    let addedCount = 0;
    let missingDaysCount = 0;
    for (let i = 0; i < extracted.length; i++) {
      const pooled = toPoolCourse(extracted[i], courses.length + i);
      if (pooled.sections.some((s) => s.days.length === 0)) missingDaysCount++;
      const succeeded = await onAddCourse(pooled);
      if (succeeded) addedCount++;
    }
    if (addedCount < extracted.length) {
      setExtractionError(
        `Added ${addedCount} of ${extracted.length} extracted courses, the rest failed to save. Check the pool below and re-add any missing ones manually.`
      );
    }
    if (missingDaysCount > 0) {
      setExtractionNotice(
        (prev) =>
          `${prev ? prev + " " : ""}${missingDaysCount} section${missingDaysCount > 1 ? "s" : ""} could not have their meeting days confidently read from the syllabus, please set them manually in the next step.`
      );
    }
  };

  const handleTextExtract = () => {
    if (!syllabusText.trim() || isSyllabusOverLimit || isExtracting) return;

    guardAiClick(async () => {
      setIsExtracting(true);
      setExtractionError(null);
      setExtractionNotice(null);

      try {
        const result = await CoursePlannerService.extractSyllabusText(syllabusText);
        if (!result.courses || result.courses.length === 0) {
          throw new Error("No courses could be extracted from that text. Try adding more detail or use manual entry.");
        }
        if (result.truncated) {
          setExtractionNotice(
            "This text was longer than we could fully process — some courses or assignments near the end may have been missed."
          );
        }
        await addExtractedCourses(result.courses);
        setSyllabusText("");
      } catch (err: any) {
        setExtractionError(
          err?.response?.data?.message || err?.message || "Syllabus parsing failed. Please try again."
        );
      } finally {
        setIsExtracting(false);
      }
    });
  };

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Build Course Pool</h2>
          <p className="text-xs text-gray-500">Extract from syllabus PDF/text or manually add courses</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Selected Credit Load</span>
          <span className="text-base font-semibold text-primary-400">{totalCredits} credits ({courses.length} courses)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "ai"
              ? "bg-primary-400 text-white"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
         AI Syllabus Extraction
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "manual"
              ? "bg-primary-400 text-white"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          <FiPlus className="w-4 h-4" /> Manual Entry
        </button>
      </div>

      {/* AI Extraction Tab */}
      {activeTab === "ai" && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-lg p-8 text-center transition-colors bg-gray-50">
            <FiUpload className="w-6 h-6 text-primary-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">Upload Syllabus PDF or Document</p>
            <p className="text-xs text-gray-400 mb-4">Supports .pdf and .docx formats up to 5MB</p>
            <label className="inline-flex items-center px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
              <span>Choose File</span>
              <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400">Or Paste Syllabus Text</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <textarea
              rows={4}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste course syllabus content, schedule descriptions, exam dates..."
              aria-invalid={isSyllabusOverLimit}
              aria-describedby={isSyllabusOverLimit ? "syllabus-word-count syllabus-word-error" : "syllabus-word-count"}
              className="w-full px-3.5 py-3 rounded-lg border border-gray-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-800 text-sm"
            />
            <p id="syllabus-word-count" className={`mt-1 text-right text-xs ${isSyllabusOverLimit ? "text-red-600" : "text-gray-500"}`}>
              {syllabusWordCount.toLocaleString("en-US")} / 1,500 words
            </p>
            {isSyllabusOverLimit && (
              <p id="syllabus-word-error" role="alert" className="mt-2 text-xs font-semibold text-red-600">
                Syllabus text exceeds the 1,500-word limit. Please remove {(syllabusWordCount - MAX_SYLLABUS_WORDS).toLocaleString("en-US")} words to extract courses.
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleTextExtract}
                disabled={isExtracting || !syllabusText.trim() || isSyllabusOverLimit}
                className="px-4 py-2 bg-primary-400 hover:bg-primary-300 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <FiLoader className="w-3.5 h-3.5 animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <FiZap className="w-3.5 h-3.5" /> Extract Courses via AI
                  </>
                )}
              </button>
            </div>
          </div>

          {extractionNotice && (
            <div className="p-3 bg-primary-100 border border-primary-200 rounded-lg text-primary-400 text-xs font-semibold">
              {extractionNotice}
            </div>
          )}

          {extractionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
              {extractionError}
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Tab */}
      {activeTab === "manual" && (
        <form onSubmit={handleManualAdd} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Course Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CS 101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Intro to Computer Science"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value, 10) || 3)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Instructor</label>
              <input
                type="text"
                placeholder="e.g. Dr. Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Color Tag</label>
              <div className="flex items-center gap-1.5 pt-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-colors ${
                      color === c ? "border-gray-800" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => {
                  setIsRequired(e.target.checked);
                  if (e.target.checked) setIsElective(false);
                }}
                className="rounded text-primary-400"
              />
              Required Course
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={isElective}
                onChange={(e) => {
                  setIsElective(e.target.checked);
                  if (e.target.checked) setIsRequired(false);
                }}
                className="rounded text-primary-400"
              />
              Elective Course
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-300 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FiPlus className="w-4 h-4" /> Add Course to Pool
            </button>
          </div>
        </form>
      )}

      {/* Active Pool List */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center justify-between">
          <span>Active Course Pool ({courses.length})</span>
          <span className="text-xs font-normal text-gray-400">Identity distinct from sections</span>
        </h3>

        {courses.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs">
            No courses in pool yet. Upload a syllabus or add manually above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{c.code}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-semibold text-xs rounded-full ring-1 ring-gray-200">
                        {c.credits} cr
                      </span>
                      {c.isRequired && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-400 font-semibold text-xs rounded-full ring-1 ring-primary-300">
                          Required
                        </span>
                      )}
                      {c.isElective && (
                        <span className="px-2 py-0.5 bg-secondary-200/40 text-secondary-500 font-semibold text-xs rounded-full ring-1 ring-secondary-200">
                          Elective
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{c.title}</p>
                    {c.instructor && <p className="text-xs text-gray-400">Prof. {c.instructor}</p>}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteCourse(c.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors hover:bg-gray-50 flex items-center gap-2"
        >
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={onNext}
          disabled={courses.length === 0}
          className="px-5 py-2.5 bg-primary-400 hover:bg-primary-300 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center gap-2"
        >
          Configure Sections & Catalog <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
