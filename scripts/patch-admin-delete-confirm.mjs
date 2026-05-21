import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.join(__dirname, "..", "app", "(admin)", "admin");

const IMPORT =
  'import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";\n';

const HOOK_LINE = "  const { confirmDelete } = useAdminConfirm();\n";

const REMOVE_PREFIX = `    if (
      !(await confirmDelete({
        variant: "remove",
        message: "Are you sure you want to remove this item?",
      }))
    )
      return;
`;

function patchFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("removeArrayItem") && !src.includes("handlePageDelete") && !src.includes("handleDelete")) {
    return false;
  }
  if (src.includes("useAdminConfirm")) return false;

  if (!src.includes(IMPORT.trim())) {
    const useClient = src.match(/^"use client";\r?\n\r?\n/m) || src.match(/^'use client';\r?\n\r?\n/m);
    if (useClient) {
      src = src.replace(useClient[0], useClient[0] + IMPORT);
    } else {
      const firstImport = src.indexOf("import ");
      src = src.slice(0, firstImport) + IMPORT + src.slice(firstImport);
    }
  }

  const fnMatch = src.match(/export default function \w+\([^)]*\)\s*\{/);
  if (!fnMatch) {
    console.warn("No component fn:", filePath);
    return false;
  }
  const insertAt = fnMatch.index + fnMatch[0].length;
  src = src.slice(0, insertAt) + "\n" + HOOK_LINE + src.slice(insertAt);

  src = src.replace(
    /const removeArrayItem = \(path: string, index: number\) => \{/g,
    "const removeArrayItem = async (path: string, index: number) => {\n" + REMOVE_PREFIX,
  );

  src = src.replace(
    /if \(!window\.confirm\(\s*[\s\S]*?\)\)\s*\{\s*return;\s*\}/g,
    (block) => {
      if (block.includes("confirmDelete")) return block;
      return `if (!(await confirmDelete({ variant: "delete", message: "Delete this duplicate landing page from the database? The public URL will stop working." }))) return;`;
    },
  );

  src = src.replace(
    /if \(!confirm\(`Are you sure you want to delete "\$\{pageData\.id\}"\? This action cannot be undone\.`\)\) \{\s*return;\s*\}/g,
    `if (!(await confirmDelete({ variant: "delete", message: \`Are you sure you want to delete "\${pageData.id}"? This action cannot be undone.\` }))) return;`,
  );

  src = src.replace(
    /if \(\s*!confirm\(\s*`Are you sure you want to delete "\$\{pageData\.id\}"\? This action cannot be undone\.`,\s*\)\s*\)\s*\{\s*return;\s*\}/g,
    `if (!(await confirmDelete({ variant: "delete", message: \`Are you sure you want to delete "\${pageData.id}"? This action cannot be undone.\` }))) return;`,
  );

  src = src.replace(
    /const handlePageDelete = async \(\) => \{/g,
    "const handlePageDelete = async () => {\n    // confirm below",
  );

  fs.writeFileSync(filePath, src);
  return true;
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name === "page.tsx") patchFile(full);
  }
}

const patched = [];
walk(adminDir);
console.log("Patched admin pages with delete confirm hook.");
