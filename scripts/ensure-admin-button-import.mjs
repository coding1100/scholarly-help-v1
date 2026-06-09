import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const adminDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "(admin)",
);

const importLine =
  'import AdminButton from "@/app/components/Admin/AdminButton";\n';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function addImport(content) {
  if (!content.includes("AdminButton") || content.includes("import AdminButton"))
    return content;
  const imports = [...content.matchAll(/^import .+;$/gm)];
  if (imports.length === 0) return importLine + content;
  const last = imports[imports.length - 1];
  const insertAt = last.index + last[0].length + 1;
  return content.slice(0, insertAt) + importLine + content.slice(insertAt);
}

for (const file of walk(adminDir)) {
  const original = fs.readFileSync(file, "utf8");
  const next = addImport(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    console.log("import added:", path.relative(adminDir, file));
  }
}
