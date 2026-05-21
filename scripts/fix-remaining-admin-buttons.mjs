import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const adminDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "(admin)",
);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const replacements = [
  [
    /<button\s+type="submit"\s+disabled=\{pageLoading\}\s+className="inline-flex items-center rounded-md border border-transparent bg-\[#283c88\][\s\S]*?<\/button>/g,
    '<AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>{pageLoading ? "Saving..." : "Save Changes"}</AdminButton>',
  ],
  [
    /<button\s+type="button"\s+onClick=\{\(\) => \{\s*const next = \(pageData\.priceSection\?\.benefits \|\| \[\]\)\.filter\(\(_: string, i: number\) => i !== index\);\s*updatePageData\('priceSection\.benefits', next\);\s*\}\}\s+className="text-sm text-\[#da0e0e\] hover:text-\[#b80c0c\] whitespace-nowrap"\s*>\s*Remove\s*<\/button>/g,
    `<AdminButton type="button" variant="remove" className="whitespace-nowrap" onClick={() => {
                      const next = (pageData.priceSection?.benefits || []).filter((_: string, i: number) => i !== index);
                      updatePageData('priceSection.benefits', next);
                    }}>Remove</AdminButton>`,
  ],
  [
    /<button\s+type="button"\s+onClick=\{\(\) => \{\s*const next = \(\s*pageData\.priceSection\?\.benefits \|\| \[\]\s*\)\.filter\(\(_: string, i: number\) => i !== index\);\s*updatePageData\("priceSection\.benefits", next\);\s*\}\}\s+className="text-sm text-\[#da0e0e\] hover:text-\[#b80c0c\] whitespace-nowrap"\s*>\s*Remove\s*<\/button>/g,
    `<AdminButton type="button" variant="remove" className="whitespace-nowrap" onClick={() => {
                        const next = (pageData.priceSection?.benefits || []).filter((_: string, i: number) => i !== index);
                        updatePageData("priceSection.benefits", next);
                      }}>Remove</AdminButton>`,
  ],
  [
    /<button\s+type="button"\s+onClick=\{\(\) => addArrayItem\('success\.slides', \{ id: Date\.now\(\), image: '' \}\)\}\s+className="mt-2 rounded-md bg-\[#e5e7eb\][^"]*hidden[^"]*"\s*>\s*\+ Add Slide\s*<\/button>/g,
    `<AdminButton type="button" variant="add" className="hidden" onClick={() => addArrayItem('success.slides', { id: Date.now(), image: '' })}>Add Slide</AdminButton>`,
  ],
  [
    /<button\s+onClick=\{\(\) => setEditingPage\(\{ category: '', title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published' \}\)\}\s+className="mb-4 rounded bg-\[#283c88\][^"]*"\s*>\s*Add New Page\s*<\/button>/g,
    `<AdminButton type="button" variant="primary" className="mb-4" onClick={() => setEditingPage({ category: '', title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published' })}>Add New Page</AdminButton>`,
  ],
  [
    /<button\s+type="button"\s+onClick=\{\(\) => void handleDelete\(page\)\}\s+className="rounded bg-\[#da0e0e\][^"]*"\s*>\s*Delete\s*<\/button>/g,
    '<AdminButton type="button" variant="deleteSm" onClick={() => void handleDelete(page)}>Delete</AdminButton>',
  ],
];

for (const file of walk(adminDir)) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [re, rep] of replacements) {
    const next = content.replace(re, rep);
    if (next !== content) {
      content = next;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log("fixed:", path.relative(adminDir, file));
  }
}
