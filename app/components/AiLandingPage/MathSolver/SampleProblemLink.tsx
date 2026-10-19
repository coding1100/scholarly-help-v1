"use client";

import { FaArrowRight } from "react-icons/fa";
import { LOAD_SAMPLE_PROBLEM_EVENT } from "@/app/components/AiTools/MathSolver/sampleProblem";

/** Loads a sample problem into the embedded math solver. */
export default function SampleProblemLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(LOAD_SAMPLE_PROBLEM_EVENT))}
      className="-mt-1 mb-1.5 inline-flex items-center gap-1.5 self-start text-left text-[13px] text-[#5B4FE0] hover:underline md:mb-[18px] md:self-center"
    >
      No problem handy? Try a sample stats question
      <FaArrowRight className="shrink-0 text-[11px]" aria-hidden="true" />
    </button>
  );
}
