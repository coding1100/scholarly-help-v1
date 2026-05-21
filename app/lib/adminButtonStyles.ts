/** Admin UI colors — use hex via Tailwind arbitrary values, not bg-red-600 etc. */
export const ADMIN_HEX = {
  primary: "#283c88",
  primaryHover: "#1f2f6a",
  danger: "#da0e0e",
  dangerHover: "#b80c0c",
  dangerBorder: "#f5c2c2",
  dangerMutedBg: "#fef2f2",
  edit: "#c99700",
  editHover: "#a67d00",
  neutral: "#6b7280",
  neutralHover: "#4b5563",
  neutralBg: "#e5e7eb",
  neutralBgHover: "#d1d5db",
  neutralText: "#374151",
  mutedText: "#4b5563",
  cancelHover: "#f3f4f6",
  cancelBg: "#dddada",
  cancelBgHover: "#d1d5db",
  cancelBorder: "#c9c9c9",
  accentBg: "#eef0f8",
  accentBorder: "#c5cce8",
  accentHover: "#dfe3f3",
} as const;

const btnBase = "inline-flex items-center justify-center gap-1.5";

export const adminBtn = {
  primary:
    `${btnBase} rounded-lg bg-[#283c88] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2f6a] disabled:opacity-50`,
  primaryLg:
    `${btnBase} rounded-md border border-transparent bg-[#283c88] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#1f2f6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#283c88] disabled:cursor-not-allowed disabled:opacity-50`,
  danger:
    `${btnBase} rounded-lg bg-[#da0e0e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b80c0c] disabled:opacity-50`,
  dangerLg:
    `${btnBase} rounded-md border border-[#f5c2c2] bg-white px-6 py-3 text-base font-medium text-[#da0e0e] shadow-sm hover:bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#da0e0e] disabled:cursor-not-allowed disabled:opacity-50`,
  cancel:
    `${btnBase} rounded-lg border border-[#c9c9c9] bg-[#dddada] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#d1d5db] disabled:opacity-50`,
  cancelLg:
    `${btnBase} rounded-lg px-4 py-2 text-sm font-medium text-[#6b7280] hover:bg-[#f3f4f6]`,
  secondary:
    `${btnBase} rounded-lg bg-[#6b7280] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b5563] disabled:opacity-50`,
  edit: `${btnBase} rounded bg-[#c99700] px-3 py-1.5 text-sm text-white hover:bg-[#a67d00]`,
  deleteSm: `${btnBase} rounded bg-[#da0e0e] px-3 py-1.5 text-sm text-white hover:bg-[#b80c0c]`,
  add: `${btnBase} mt-2 rounded-md bg-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#d1d5db]`,
  remove: `${btnBase} text-sm font-medium text-[#da0e0e] hover:text-[#b80c0c]`,
  removeLink: `${btnBase} text-sm font-medium text-[#da0e0e] hover:text-[#b80c0c]`,
  headerEdit: `${btnBase} rounded-lg border border-[#e8d9a8] bg-[#fff9e6] px-2.5 py-1.5 text-sm font-medium text-[#c99700] hover:bg-[#f5ecd0]`,
  headerDuplicate: `${btnBase} rounded-lg border border-[#c5cce8] bg-[#eef0f8] px-2.5 py-1.5 text-sm font-medium text-[#283c88] hover:bg-[#dfe3f3]`,
  duplicateIcon:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#c5cce8] bg-[#eef0f8] text-[#283c88] hover:bg-[#dfe3f3]",
  editIcon:
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e8d9a8] bg-[#fff9e6] text-[#c99700] hover:bg-[#f5ecd0]",
  logout: `${btnBase} rounded-lg bg-[#da0e0e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b80c0c]`,
} as const;
