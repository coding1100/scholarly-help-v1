import { MdLock } from "react-icons/md";
import { normalizePathname } from "@/app/lib/takeMyClassLandingRoutes";

export const quoteInputClass =
  "block h-12 w-full rounded-md border border-transparent bg-white px-4 text-sm text-[#111111] placeholder-[#6B7280] outline-none transition focus:border-[#ff641a] focus:ring-2 focus:ring-[#ff641a]/30";

export const quoteButtonClass =
  "flex h-12 items-center justify-center rounded-md border border-transparent bg-[#ff641a] px-6 text-sm font-bold uppercase tracking-wide text-white transition duration-300 hover:border-[#ff641a] hover:bg-white hover:text-[#ff641a] disabled:cursor-wait disabled:opacity-80";

type DetailsField = { label: string; placeholder: string };

const CLASS_DETAILS: DetailsField = {
  label: "Class details",
  placeholder: "Class details (e.g. CHEM 101, Orgo I) *",
};

const SERVICE_DETAILS: [keyword: string, field: DetailsField][] = [
  ["exam", { label: "Exam details", placeholder: "Exam details (e.g. CHEM 101 final, ATI TEAS) *" }],
  ["assignment", { label: "Assignment details", placeholder: "Assignment details (e.g. MATH 201 problem set) *" }],
  ["homework", { label: "Homework details", placeholder: "Homework details (e.g. Calculus I, 20 problems) *" }],
  ["essay", { label: "Essay details", placeholder: "Essay details (e.g. 1,500-word history essay) *" }],
];

/** The first field of the quote forms, named after the page's service. */
export function getDetailsField(pathname: string | null | undefined): DetailsField {
  const service = normalizePathname(pathname).split("/")[1] ?? "";
  return SERVICE_DETAILS.find(([keyword]) => service.includes(keyword))?.[1] ?? CLASS_DETAILS;
}
export const PHONE_PLACEHOLDER = "Mobile No to Text Your Quote *";

/** Small print under the quote lead forms. */
export function QuoteLeadNote({
  text,
  className = "justify-center text-white/75",
}: {
  text: string;
  /** Alignment and text colour; the default suits the dark sections. */
  className?: string;
}) {
  return (
    <p className={`flex items-center gap-1 text-xs ${className}`}>
      <MdLock aria-hidden className="text-[#F5B544]" />
      {text}
    </p>
  );
}

export function QuoteLeadError({
  message,
  className = "text-[#FFB59A]",
}: {
  message: string;
  /** Text colour; the default suits the dark sections. */
  className?: string;
}) {
  if (!message) return null;
  return (
    <p role="alert" className={`text-center text-sm font-medium ${className}`}>
      {message}
    </p>
  );
}
