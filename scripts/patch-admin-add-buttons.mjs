import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app", "(admin)");
const ADD_CLASS =
  'className="mt-2 rounded-md bg-[#e5e7eb] px-4 py-2 text-[#374151] hover:bg-[#d1d5db]"';
const importLine = 'import AdminButton from "@/app/components/Admin/AdminButton";\n';

function ensureImport(src) {
  if (src.includes("AdminButton")) return src;
  const m = src.match(/^("use client";\s*\n)/);
  if (m) return src.replace(m[0], `${m[0]}${importLine}`);
  return `${importLine}${src}`;
}

function patchAddButtons(src) {
  const needle = ADD_CLASS;
  let out = "";
  let i = 0;
  let n = 0;
  while (i < src.length) {
    const start = src.indexOf("<button", i);
    if (start === -1) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, start);
    const classIdx = src.indexOf(needle, start);
    if (classIdx === -1 || classIdx > start + 800) {
      const end = src.indexOf("</button>", start);
      out += src.slice(start, end + 9);
      i = end + 9;
      continue;
    }
    const close = src.indexOf("</button>", classIdx);
    const block = src.slice(start, close + 9);
    const onMatch = block.match(/onClick=\{([\s\S]*?)\}\s+className=/);
    const labelMatch = block.match(/>\s*\+?\s*([^<]+?)\s*<\/button>/);
    if (onMatch && labelMatch) {
      const label = labelMatch[1].trim().replace(/^\+\s*/, "");
      out += `<AdminButton type="button" variant="add" onClick={${onMatch[1]}}>${label}</AdminButton>`;
      n += 1;
    } else {
      out += block;
    }
    i = close + 9;
  }
  return [out, n];
}

function walk(dir) {
  let files = 0;
  let buttons = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      const [f, b] = walk(full);
      files += f;
      buttons += b;
    } else if (name.endsWith(".tsx")) {
      let src = fs.readFileSync(full, "utf8");
      if (!src.includes(ADD_CLASS)) continue;
      const [next, n] = patchAddButtons(src);
      if (n > 0) {
        fs.writeFileSync(full, ensureImport(next));
        files += 1;
        buttons += n;
        console.log(path.relative(root, full), n);
      }
    }
  }
  return [files, buttons];
}

const [f, b] = walk(root);
console.log(`Patched ${b} add buttons in ${f} files.`);
