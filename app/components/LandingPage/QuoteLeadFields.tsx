import { MdLock } from "react-icons/md";

export const quoteInputClass =
  "block h-12 w-full rounded-md border border-transparent bg-white px-4 text-sm text-[#111111] placeholder-[#6B7280] outline-none transition focus:border-[#ff641a] focus:ring-2 focus:ring-[#ff641a]/30";

export const quoteButtonClass =
  "flex h-12 items-center justify-center rounded-md border border-transparent bg-[#ff641a] px-6 text-sm font-bold uppercase tracking-wide text-white transition duration-300 hover:border-[#ff641a] hover:bg-white hover:text-[#ff641a] disabled:cursor-wait disabled:opacity-80";

export const CLASS_DETAILS_PLACEHOLDER = "Class details (e.g. CHEM 101, Orgo I) *";
export const PHONE_PLACEHOLDER = "Mobile No to Text Your Quote *";

/** Small print under the quote lead forms. */
export function QuoteLeadNote({ text }: { text: string }) {
  return (
    <p className="flex items-center justify-center gap-1 text-xs text-white/75">
      <MdLock aria-hidden className="text-[#F5B544]" />
      {text}
    </p>
  );
}

export function QuoteLeadError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-center text-sm font-medium text-[#FFB59A]">
      {message}
    </p>
  );
}
