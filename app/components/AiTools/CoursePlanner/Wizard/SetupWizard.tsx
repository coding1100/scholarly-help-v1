import React, { useEffect, useState } from "react";
import { Semester, CourseCatalogItem, ScheduleOption, SchedulePreferences, PolicyPreset } from "@/app/lib/client/coursePlanner/types";
import { CoursePlannerService } from "@/app/lib/client/coursePlanner/service";
import { useGuestGate } from "@/app/lib/client/useGuestGate";
import GuestAuthGateModal from "@/app/components/AiTools/GuestGate/GuestAuthGateModal";
import { Step1SemesterInfo } from "./Step1SemesterInfo";
import { Step2CoursePool } from "./Step2CoursePool";
import { Step3CatalogSections } from "./Step3CatalogSections";
import { Step4Preferences } from "./Step4Preferences";
import { Step5ScheduleOptions } from "./Step5ScheduleOptions";
import { Step6FinalizePolicy } from "./Step6FinalizePolicy";

interface Props {
  activeSemester: Semester | null;
  priorSemesters: Semester[];
  onComplete: () => void;
}

export const SetupWizard: React.FC<Props> = ({ activeSemester, priorSemesters, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [semesterData, setSemesterData] = useState<Partial<Semester>>(
    activeSemester || { name: "Fall 2026 Semester", term: "Fall", year: 2026, creditTarget: 15 }
  );
  const [currentSemesterId, setCurrentSemesterId] = useState<string>(activeSemester?.id || "");
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [prefs, setPrefs] = useState<SchedulePreferences>({});
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ScheduleOption | null>(null);

  // Every backend call in this wizard used to be unawaited/uncaught from the
  // caller's perspective: a failure was an unhandled promise rejection with
  // no visible error and no way to tell the UI wasn't just "still working."
  // wizardError + isSubmitting give every step a consistent error banner and
  // a way to disable its own submit button during a real network call.
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { gateOpen, closeGate, guardAiClick } = useGuestGate();

  // Returns true on success, false on failure — callers that need to know
  // whether their own follow-up action (e.g. clearing a form) is safe to
  // run should check this rather than diffing state after the await, since
  // a stale closure over props/state from before the call won't reflect
  // what actually happened.
  const runStep = async (fn: () => Promise<void>): Promise<boolean> => {
    setIsSubmitting(true);
    setWizardError(null);
    try {
      await fn();
      return true;
    } catch (err: any) {
      setWizardError(
        err?.response?.data?.message ||
          (err?.response?.status
            ? `That action failed (${err.response.status}). Please try again.`
            : "That action failed. Please check your connection and try again.")
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resuming a draft semester previously left `courses` at its initial `[]`
  // forever — the backend already has courses for this semester, but Step 2
  // rendered an empty pool, inviting duplicate re-creation.
  useEffect(() => {
    if (activeSemester?.id) {
      runStep(async () => {
        setCourses(await CoursePlannerService.getCourses(activeSemester.id));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSemester?.id]);

  // Step 1: Semester Info submit
  const handleStep1 = (data: Partial<Semester>) =>
    runStep(async () => {
      let sem: Semester;
      if (currentSemesterId) {
        sem = await CoursePlannerService.updateSemester(currentSemesterId, data);
      } else {
        sem = await CoursePlannerService.createSemester({
          name: data.name || "Fall 2026",
          term: data.term || "Fall",
          year: data.year || 2026,
          startDate: data.startDate || "2026-09-01",
          endDate: data.endDate || "2026-12-20",
          creditTarget: data.creditTarget || 15,
        });
        setCurrentSemesterId(sem.id);
      }
      setSemesterData(sem);
      setStep(2);
    });

  // Step 2: Course pool handlers
  const handleAddCourse = (courseData: Omit<CourseCatalogItem, "id" | "semesterId">) =>
    runStep(async () => {
      if (!currentSemesterId) return;
      const newCrs = await CoursePlannerService.addCourse({ ...courseData, semesterId: currentSemesterId });
      setCourses((prev) => [...prev, newCrs]);
    });

  const handleDeleteCourse = (id: string) =>
    runStep(async () => {
      await CoursePlannerService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    });

  // Step 3: Catalog section update handlers
  const handleUpdateCourseSections = (courseId: string, sections: any[]) =>
    runStep(async () => {
      const updated = await CoursePlannerService.updateCourse(courseId, { sections });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
    });

  const handleToggleRequired = (courseId: string, isRequired: boolean) =>
    runStep(async () => {
      const updated = await CoursePlannerService.updateCourse(courseId, { isRequired, isElective: !isRequired });
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
    });

  const handleImportRetake = (sourceSemesterId: string) =>
    runStep(async () => {
      if (!currentSemesterId) return;
      const imported = await CoursePlannerService.importRetakeCourses(currentSemesterId, sourceSemesterId);
      setCourses((prev) => [...prev, ...imported]);
    });

  // Step 4: Schedule preferences submit — this is the wizard's actual AI
  // generation call, so guests get gated here just like every other tool.
  const handleStep4 = (newPrefs: SchedulePreferences) =>
    guardAiClick(async () => {
      await runStep(async () => {
        if (!currentSemesterId) return;
        setPrefs(newPrefs);
        const options = await CoursePlannerService.generateSchedules(currentSemesterId, newPrefs);
        setScheduleOptions(options);
        if (options.length > 0) {
          setSelectedOption(options[0]);
        }
        setStep(5);
      });
    });

  // Step 5: Option selected
  const handleSelectOption = (opt: ScheduleOption) => {
    setSelectedOption(opt);
    setStep(6);
  };

  // Step 6: Finalize
  const handleFinalize = (preset: PolicyPreset, overrides: Record<string, number>) =>
    runStep(async () => {
      if (!selectedOption || !currentSemesterId) return;
      await CoursePlannerService.finalizeSchedule(currentSemesterId, selectedOption, preset, overrides);
      onComplete();
    });

  const stepTitles = [
    "Semester Setup",
    "Course Pool",
    "Sections & Catalog",
    "Preferences",
    "Schedule Generator",
    "Finalize Policy",
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Wizard Progress Steps Bar */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full font-semibold text-xs flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary-400 text-white ring-4 ring-primary-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? "✓" : stepNum}
                </div>
                <span
                  className={`text-xs font-semibold hidden md:inline ${
                    isCurrent ? "text-primary-400 font-bold" : "text-gray-500"
                  }`}
                >
                  {title}
                </span>
                {idx < stepTitles.length - 1 && <div className="w-4 h-0.5 bg-gray-200 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      {wizardError && (
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{wizardError}</span>
          <button onClick={() => setWizardError(null)} className="text-red-400 hover:text-red-600 font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Render Active Wizard Step */}
      {step === 1 && <Step1SemesterInfo initialData={semesterData} onNext={handleStep1} isSubmitting={isSubmitting} />}
      {step === 2 && (
        <Step2CoursePool
          courses={courses}
          onAddCourse={handleAddCourse}
          onDeleteCourse={handleDeleteCourse}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3CatalogSections
          courses={courses}
          priorSemesters={priorSemesters}
          onUpdateCourseSections={handleUpdateCourseSections}
          onToggleRequired={handleToggleRequired}
          onImportRetake={handleImportRetake}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4Preferences initialPrefs={prefs} onNext={handleStep4} onBack={() => setStep(3)} isSubmitting={isSubmitting} />
      )}
      {step === 5 && (
        <Step5ScheduleOptions
          semesterId={currentSemesterId}
          courses={courses}
          options={scheduleOptions}
          onSelectOption={handleSelectOption}
          onBack={() => setStep(4)}
        />
      )}
      {step === 6 && selectedOption && (
        <Step6FinalizePolicy
          semester={semesterData as Semester}
          selectedOption={selectedOption}
          courses={courses}
          onFinalize={handleFinalize}
          onBack={() => setStep(5)}
          isSubmitting={isSubmitting}
        />
      )}

      <GuestAuthGateModal open={gateOpen} onClose={closeGate} />
    </div>
  );
};
