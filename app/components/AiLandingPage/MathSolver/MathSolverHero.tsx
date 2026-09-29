"use client";

import { FaRegFolderOpen, FaWhatsapp, FaArrowRight } from "react-icons/fa";
import { MathSolverEmbed } from "@/app/components/AiLandingPage/ToolLanding/ToolEmbeds";
import { LOAD_SAMPLE_PROBLEM_EVENT } from "@/app/components/AiTools/MathSolver/sampleProblem";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

function pushWhatsAppClickEvent() {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "whatsapp_click",
      whatsapp_placement: "math_solver_card",
      page_path: window.location.pathname,
    });
  } catch {
    // Never block navigation if GTM isn't available.
  }
}

function loadSampleProblem() {
  window.dispatchEvent(new Event(LOAD_SAMPLE_PROBLEM_EVENT));
}

export default function MathSolverHero() {
  return (
    <section className="bg-[#f4f5fa] px-4 pb-6 pt-14 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <FaRegFolderOpen className="text-[13px] text-slate-500 dark:text-slate-400" aria-hidden="true" />
            For working professionals earning their degree online
          </span>

          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Stuck on a math problem?
          </h1>
          <p className="mt-2 text-3xl font-bold text-[#ff5a1f] sm:text-4xl">
            See exactly how to solve it.
          </p>
          <p className="mt-4 max-w-2xl text-base text-slate-500 dark:text-slate-400">
            Working full-time and back in school?{" "}
            <span className="font-medium text-[#2b7fff]">Algebra</span>,{" "}
            <span className="font-medium text-[#0d9488]">statistics</span>,{" "}
            <span className="font-medium text-[#e11d48]">dosage calc</span>{" "}
            and{" "}
            <span className="font-medium text-[#7c3aed]">business math</span>,
            explained in plain English in seconds.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div id="math-solver-tool" className="scroll-mt-24">
            <MathSolverEmbed />
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                No problem handy?
              </div>
              <button
                type="button"
                onClick={loadSampleProblem}
                className="mt-2 inline-flex items-center gap-1.5 text-left text-sm text-[#565add] hover:underline"
              >
                Try a sample stats question and see how the steps look
                <FaArrowRight className="text-[11px] shrink-0" aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#0f1729] p-6 text-white shadow-sm">
              <div className="text-sm font-semibold">
                Working full-time while taking math classes?
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                One problem is easy. 40 a week on ALEKS or MyMathLab isn&apos;t.
                Our math experts can take the class off your plate, so you
                keep your grade and your evenings.
              </p>
              <a
                href="https://api.whatsapp.com/send?phone=14108445419"
                target="_blank"
                rel="noopener noreferrer"
                onClick={pushWhatsAppClickEvent}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#20bd5a]"
              >
                <FaWhatsapp className="text-base" aria-hidden="true" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
