import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app", "(admin)");
const importLine = 'import AdminButton from "@/app/components/Admin/AdminButton";\n';

function ensureImport(src) {
  if (src.includes("AdminButton")) return src;
  const m = src.match(/^("use client";\s*\n)/);
  if (m) return src.replace(m[0], `${m[0]}${importLine}`);
  const m2 = src.match(/^(import[^\n]+\n)/);
  if (m2) return src.replace(m2[0], `${m2[0]}${importLine}`);
  return `${importLine}${src}`;
}

const replacements = [
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+className="text-sm text-\[#da0e0e\] hover:text-\[#b80c0c\][^"]*"\s*>\s*Remove\s*<\/button>/gs,
    '<AdminButton type="button" variant="remove" onClick={$1}>Remove</AdminButton>',
  ],
  [
    /<button\s+type="submit"\s+disabled=\{pageLoading\}\s+className="rounded-md bg-\[#283c88\] px-6 py-3 text-white hover:bg-\[#1f2f6a\] disabled:cursor-not-allowed disabled:bg-\[#9ca3af\]"\s*>\s*\{pageLoading \? 'Saving\.\.\.' : '[^']+'\}\s*<\/button>/g,
    '<AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>{pageLoading ? "Saving..." : "Save Page"}</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{handlePageDelete\}\s+disabled=\{pageLoading\}\s+className="inline-flex items-center rounded-md border border-\[#f5c2c2\][^"]*"\s*>\s*Delete\s*<\/button>/g,
    '<AdminButton type="button" variant="dangerLg" onClick={handlePageDelete} disabled={pageLoading}>Delete</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+className="mt-2 rounded-md bg-\[#e5e7eb\][^"]*"\s*>\s*\+?\s*([^<]+?)\s*<\/button>/gs,
    '<AdminButton type="button" variant="add" onClick={$1}>$2</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+className="text-sm text-\[#da0e0e\][^"]*"\s*>\s*Remove\s*<\/button>/gs,
    '<AdminButton type="button" variant="remove" onClick={$1}>Remove</AdminButton>',
  ],
  [
    /<button\s+onClick=\{([^}]+)\}\s+className="mr-2 rounded bg-\[#c99700\] px-3 py-1 text-white hover:bg-\[#a67d00\]"\s*>\s*Edit\s*<\/button>/g,
    '<AdminButton type="button" variant="edit" onClick={$1} className="mr-2">Edit</AdminButton>',
  ],
  [
    /<button\s+onClick=\{([^}]+)\}\s+className="rounded bg-\[#da0e0e\] px-3 py-1 text-white hover:bg-\[#b80c0c\]"\s*>\s*Delete\s*<\/button>/g,
    '<AdminButton type="button" variant="deleteSm" onClick={$1}>Delete</AdminButton>',
  ],
  [
    /<button\s+type="submit"\s+disabled=\{loading\}\s+className="rounded bg-\[#283c88\] px-4 py-2 text-white hover:bg-\[#1f2f6a\]"\s*>\s*\{loading \? 'Saving\.\.\.' : 'Save'\}\s*<\/button>/g,
    '<AdminButton type="submit" variant="primary" disabled={loading} loading={loading}>{loading ? "Saving..." : "Save"}</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+className="ml-2 rounded bg-\[#6b7280\] px-4 py-2 text-white hover:bg-\[#4b5563\]"\s*>\s*Cancel\s*<\/button>/g,
    '<AdminButton type="button" variant="secondary" onClick={$1} className="ml-2">Cancel</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+disabled=\{deleting \|\| pageLoading\}\s+className="inline-flex items-center rounded-md border border-\[#f5c2c2\] bg-white px-6 py-3 text-base font-medium text-\[#da0e0e\] shadow-sm hover:bg-\[#fef2f2] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"\s*>\s*\{deleting \? "Deleting…" : "Delete landing page"\}\s*<\/button>/g,
    '<AdminButton type="button" variant="dangerLg" onClick={$1} disabled={deleting || pageLoading} loading={deleting}>{deleting ? "Deleting…" : "Delete landing page"}</AdminButton>',
  ],
  [
    /<button\s+type="submit"\s+disabled=\{pageLoading\}\s+className="inline-flex items-center rounded-md border border-transparent bg-\[#283c88\] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-\[#1f2f6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-\[#283c88\] disabled:cursor-not-allowed disabled:opacity-50"\s*>\s*\{pageLoading \? \([\s\S]*?\) : \(\s*'Save Changes'\s*\)\}\s*<\/button>/g,
    '<AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>{pageLoading ? "Saving..." : "Save Changes"}</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{([^}]+)\}\s+className="mb-4 rounded bg-\[#283c88\] px-4 py-2 text-white hover:bg-\[#1f2f6a\]"\s*>\s*([^<]+)\s*<\/button>/g,
    '<AdminButton type="button" variant="primary" onClick={$1} className="mb-4">$2</AdminButton>',
  ],
];

function walk(dir) {
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) n += walk(full);
    else if (name.endsWith(".tsx")) {
      let src = fs.readFileSync(full, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        const next = src.replace(from, to);
        if (next !== src) {
          src = next;
          changed = true;
        }
      }
      if (changed) {
        src = ensureImport(src);
        fs.writeFileSync(full, src);
        n += 1;
        console.log("patched", path.relative(root, full));
      }
    }
  }
  return n;
}

console.log(`Patched ${walk(root)} admin files with AdminButton + icons.`);
