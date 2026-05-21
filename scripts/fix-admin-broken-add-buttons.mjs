import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app", "(admin)", "admin");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

function fixBrokenAddButtons(content) {
  let n = 0;
  const fixed = content.replace(
    /<AdminButton\s+type="button"\s+variant="add"\s+onClick=\{([\s\S]*?)\}\s*>addArrayItem[\s\S]*?>\s*\+?\s*([^<\n]+?)\s*<\/AdminButton>/g,
    (_, onClick, label) => {
      n++;
      const clean = label.trim().replace(/^\+?\s*/, "");
      return `<AdminButton type="button" variant="add" onClick={${onClick.trim()}}>${clean}</AdminButton>`;
    },
  );
  return { fixed, n };
}

function fixSingleLineBroken(content) {
  return content.replace(
    /<AdminButton\s+type="button"\s+variant="add"\s+onClick=\{([^}]+)\}\s*>addArrayItem\([^<]*?\)\s*<\/AdminButton>/g,
    (_, onClick) =>
      `<AdminButton type="button" variant="add" onClick={${onClick}}>Add</AdminButton>`,
  );
}

let total = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  const a = fixBrokenAddButtons(original);
  const content = fixSingleLineBroken(a.fixed);
  if (content !== original) {
    fs.writeFileSync(file, content);
    total += a.n;
    console.log(path.relative(root, file), a.n);
  }
}
console.log("done, fixed blocks:", total);
