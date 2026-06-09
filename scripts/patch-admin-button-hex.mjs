import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app", "(admin)");

const replacements = [
  [
    /inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed/g,
    "inline-flex items-center rounded-md border border-[#f5c2c2] bg-white px-6 py-3 text-base font-medium text-[#da0e0e] shadow-sm hover:bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#da0e0e] disabled:cursor-not-allowed disabled:opacity-50",
  ],
  [
    /inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50/g,
    "inline-flex items-center rounded-md border border-[#f5c2c2] bg-white px-6 py-3 text-base font-medium text-[#da0e0e] shadow-sm hover:bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
  ],
  [
    /inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-\[#283c88\] hover:bg-\[#283c88\] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed/g,
    "inline-flex items-center rounded-md border border-transparent bg-[#283c88] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#1f2f6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#283c88] disabled:cursor-not-allowed disabled:opacity-50",
  ],
  ["text-red-600 hover:text-red-800 text-sm", "text-sm text-[#da0e0e] hover:text-[#b80c0c]"],
  ["mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", "mt-2 rounded-md bg-[#e5e7eb] px-4 py-2 text-[#374151] hover:bg-[#d1d5db]"],
  ["mb-4 px-4 py-2 bg-blue-600 text-white rounded", "mb-4 rounded bg-[#283c88] px-4 py-2 text-white hover:bg-[#1f2f6a]"],
  ["mr-2 px-3 py-1 bg-yellow-500 text-white rounded", "mr-2 rounded bg-[#c99700] px-3 py-1 text-white hover:bg-[#a67d00]"],
  ["px-3 py-1 bg-red-500 text-white rounded", "rounded bg-[#da0e0e] px-3 py-1 text-white hover:bg-[#b80c0c]"],
  ["px-4 py-2 bg-blue-600 text-white rounded", "rounded bg-[#283c88] px-4 py-2 text-white hover:bg-[#1f2f6a]"],
  ["ml-2 px-4 py-2 bg-gray-500 text-white rounded", "ml-2 rounded bg-[#6b7280] px-4 py-2 text-white hover:bg-[#4b5563]"],
  ["bg-[#da0e0e] hover:bg-red-700", "bg-[#da0e0e] hover:bg-[#b80c0c]"],
  ["bg-blue-100 text-blue-700", "bg-[#eef0f8] text-[#283c88]"],
  ["hover:bg-blue-100 hover:text-blue-900", "hover:bg-[#dfe3f3] hover:text-[#1f2f6a]"],
  ["bg-blue-50 border border-blue-200", "bg-[#eef0f8] border border-[#c5cce8]"],
  ["text-blue-800", "text-[#283c88]"],
  [
    "px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed",
    "rounded-md bg-[#283c88] px-6 py-3 text-white hover:bg-[#1f2f6a] disabled:cursor-not-allowed disabled:bg-[#9ca3af]",
  ],
];

function walk(dir) {
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) n += walk(full);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      let src = fs.readFileSync(full, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        const next = typeof from === "string" ? src.replaceAll(from, to) : src.replace(from, to);
        if (next !== src) {
          src = next;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, src);
        n += 1;
      }
    }
  }
  return n;
}

console.log(`Patched ${walk(root)} admin files with hex button colors.`);
