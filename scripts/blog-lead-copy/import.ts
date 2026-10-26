/*
 * Imports per-post lead form text from the "Blog Form Copy" spreadsheet into each post's
 * leadForms overrides. Posts are matched by the slug in the "Blog URL" column. Only the
 * heading, highlight and text are stored per post; the button text and the small print
 * come from Blog Settings (the sheet's CTA columns are not used). Re-runnable: it overwrites the same fields each time and
 * keeps a post's "hide the forms" switch.
 *
 *   npx vite-node -c vitest.config.ts scripts/blog-lead-copy/import.ts -- --file=PATH.xlsm [--dry-run]
 *
 * Reads DATABASE_URL from the local environment (or ENV_FILE).
 */
import "../blog-migrate/env";
import ExcelJS from "exceljs";
import { getBlogCollections } from "@/app/lib/blog/db";
import { normalizePostLeadForms } from "@/app/lib/blog/validate";
import type { LeadFormContent, PostLeadForms } from "@/app/lib/blog/types";

const args = new Map(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => {
    const [k, ...v] = a.slice(2).split("=");
    return [k, v.length ? v.join("=") : "true"] as const;
  }),
);
const FILE = args.get("file");
const DRY = args.has("dry-run");

const COLUMNS = {
  url: "Blog URL",
  wideHeading: "Wide Form Headline",
  wideText: "Wide Form Description",
  sideHeading: "Sidebar Headline",
  sideText: "Sidebar Description",
} as const;

/** The last two words of the heading are shown in orange. */
function defaultHighlight(heading: string): string {
  return heading.trim().split(/\s+/).slice(-2).join(" ");
}

function content(heading: string, text: string): Partial<LeadFormContent> {
  return { heading, highlight: defaultHighlight(heading), text };
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "object" && "richText" in value) return value.richText.map((r) => r.text).join("").trim();
  if (typeof value === "object" && "text" in value) return String(value.text).trim();
  if (typeof value === "object" && "result" in value) return String(value.result ?? "").trim();
  return String(value).trim();
}

async function readRows(file: string) {
  const book = new ExcelJS.Workbook();
  await book.xlsx.readFile(file);
  const sheet = book.worksheets[0];
  const header = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, col) => header.set(cellText(cell.value), col));
  for (const name of Object.values(COLUMNS)) {
    if (!header.has(name)) throw new Error(`Column "${name}" not found in the first sheet.`);
  }
  const rows: { line: number; slug: string; inline: Partial<LeadFormContent>; sidebar: Partial<LeadFormContent> }[] = [];
  const problems: string[] = [];
  sheet.eachRow((row, line) => {
    if (line === 1) return;
    const get = (key: keyof typeof COLUMNS) => cellText(row.getCell(header.get(COLUMNS[key])!).value);
    const url = get("url");
    if (!url) return;
    const slug = url.match(/\/blog\/([^/?#]+)\/?(?:[?#].*)?$/)?.[1];
    if (!slug) {
      problems.push(`Row ${line}: can't read a post slug from "${url}"`);
      return;
    }
    const missing = (Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).filter((k) => !get(k));
    if (missing.length) {
      problems.push(`Row ${line} (${slug}): empty ${missing.map((k) => COLUMNS[k]).join(", ")}`);
      return;
    }
    rows.push({
      line,
      slug,
      inline: content(get("wideHeading"), get("wideText")),
      sidebar: content(get("sideHeading"), get("sideText")),
    });
  });
  return { rows, problems };
}

/** Lists what differs, e.g. "inline.heading", "sidebar.buttonLabel removed". */
function changedFields(current: PostLeadForms, next: PostLeadForms): string[] {
  const out: string[] = [];
  for (const form of ["inline", "sidebar"] as const) {
    const a: Partial<LeadFormContent> = current[form] ?? {};
    const b: Partial<LeadFormContent> = next[form] ?? {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof LeadFormContent>) {
      if (a[key] === b[key]) continue;
      out.push(`${form}.${key}${b[key] ? "" : " removed"}`);
    }
  }
  return out;
}

async function main() {
  if (!FILE) throw new Error("Pass the spreadsheet with --file=PATH");
  const { rows, problems } = await readRows(FILE);
  const c = await getBlogCollections();
  if (!c) throw new Error("No database connection (DATABASE_URL).");

  const posts = await c.posts.find({}, { projection: { slug: 1, leadForms: 1 } }).toArray();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  let changed = 0;
  let unchanged = 0;

  for (const row of rows) {
    if (seen.has(row.slug)) {
      problems.push(`Row ${row.line}: ${row.slug} appears more than once; using the first row`);
      continue;
    }
    seen.add(row.slug);
    const post = bySlug.get(row.slug);
    if (!post) {
      problems.push(`Row ${row.line}: no post with slug "${row.slug}"`);
      continue;
    }
    // Validate and trim exactly like the post editor does.
    const next: PostLeadForms = normalizePostLeadForms({ hidden: post.leadForms?.hidden, inline: row.inline, sidebar: row.sidebar });
    const fields = changedFields(normalizePostLeadForms(post.leadForms), next);
    if (!fields.length) {
      unchanged++;
      continue;
    }
    changed++;
    console.log(`${DRY ? "would update" : "update"}  ${row.slug}  (${fields.join(", ")})`);
    // updatedAt is left alone: form text is not article content, so the post's "modified" date stays.
    if (!DRY) await c.posts.updateOne({ _id: post._id }, { $set: { leadForms: next } });
  }

  const withoutRow = posts.filter((p) => !seen.has(p.slug)).map((p) => p.slug);
  console.log(`\n${DRY ? "DRY RUN — nothing written.\n" : ""}Rows: ${rows.length}, ${DRY ? "would change" : "changed"}: ${changed}, already up to date: ${unchanged}`);
  if (withoutRow.length) console.log(`Posts with no row (they use the Blog Settings text):\n  ${withoutRow.join("\n  ")}`);
  if (problems.length) console.log(`Problems:\n  ${problems.join("\n  ")}`);

  // Once Blog Settings are saved in the admin, the saved button text is used instead of the code default.
  const saved = (await c.settings.findOne({ _id: "settings" }))?.leadForms;
  if (saved) {
    console.log(
      `Blog Settings button text: in-article "${saved.inline?.buttonLabel ?? ""}", sidebar "${saved.sidebar?.buttonLabel ?? ""}" (change it in Admin → Blog → Settings if needed)`,
    );
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
