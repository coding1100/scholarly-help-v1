import type { FC, SVGProps } from "react";

const s = "h-4 w-4 shrink-0";

export const IconPlus: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
  </svg>
);

export const IconTrash: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const IconX: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const IconCheck: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export const IconSave: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

export const IconPencil: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const IconLogout: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
);

export const IconCopy: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

export const IconSpinner: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg className={`${s} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);
