import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const adminDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "(admin)",
  "admin",
);

const files = [
  "assignment/page.tsx",
  "essay-writing/page.tsx",
  "homework/page.tsx",
  "exam/page.tsx",
  "online-class/page.tsx",
].map((f) => path.join(adminDir, f));

/** Fix half-patched AdminButton blocks that leak updatePageData into children */
const brokenAdd = /<AdminButton\s+type="button"\s+variant="add"\s+onClick=\{([\s\S]*?)\}\s*>updatePageData\([\s\S]*?className="mt-2[^"]*"\s*>\s*\+?\s*([^<]+?)<\/AdminButton>/g;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, "utf8");
  const next = original.replace(brokenAdd, (_, onClick, label) => {
    const clean = label.trim().replace(/^\+?\s*/, "");
    return `<AdminButton type="button" variant="add" onClick={${onClick.trim()}}>${clean}</AdminButton>`;
  });
  if (next !== original) {
    fs.writeFileSync(file, next);
    console.log("fixed:", path.basename(path.dirname(file)) + "/" + path.basename(file));
  }
}
