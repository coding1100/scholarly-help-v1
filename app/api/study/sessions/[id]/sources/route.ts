import { NextRequest } from "next/server";
import { addSource, getSession } from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import {
  parsePdfBuffer,
  parseUploadedStudyFile,
} from "@/app/lib/server/study/fileParsing";
import { StudySourceKind } from "@/app/lib/server/study/types";

export const dynamic = "force-dynamic";

const ALLOWED_SOURCE_KINDS = new Set<StudySourceKind>([
  "text",
  "url",
  "file",
  "youtube",
]);

// Non-content elements whose TEXT should be dropped entirely (not just the
// tags) — navigation, chrome, menus, forms, media captions, etc.
const BOILERPLATE_TAGS =
  "script|style|noscript|nav|header|footer|aside|form|button|select|option|figure|figcaption|svg|iframe|template";

// class/id substrings that mark a container as boilerplate (nav bars, sidebars,
// tables of contents, cookie banners, comments, etc.).
const BOILERPLATE_ATTR =
  /(^|[\s_-])(nav|navbar|menu|sidebar|side-bar|toc|table-of-contents|breadcrumb|footer|header|masthead|banner|cookie|consent|comment|related|recirc|promo|advert|ad-|social|share|subscribe|newsletter|pagination|skip-link|sr-only|screen-reader|infobox|metadata|references|reflist|catlinks|noprint|mw-jump|mw-editsection|vector-)/i;

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–");
}

/** True for a line that is navigation/ToC residue rather than real prose. */
function isBoilerplateLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  // Reader-mode / wiki chrome.
  if (/^(toggle|jump to|edit|\[edit\]|view source|contents|main menu|navigation|from wikipedia)\b/i.test(t))
    return true;
  // Dotted leaders from a printed ToC ("Abstract .......... 11").
  if (/\.{4,}\s*\d*\s*$/.test(t)) return true;
  // A line made mostly of "N.N Title" numbered ToC entries with no sentence.
  const tocEntries = t.match(/\b\d+(\.\d+)*\s+[A-Z][^.!?]*/g);
  if (tocEntries && tocEntries.length >= 3 && !/[.!?]\s/.test(t)) return true;
  // Very short fragments that are almost certainly a link/menu label, not prose.
  if (t.length < 3) return true;
  return false;
}

function toPlainTextFromHtml(html: string): string {
  let doc = html;

  // 1) Prefer the main content region when the page marks one, so we never even
  //    look at surrounding chrome.
  const mainMatch =
    doc.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    doc.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    doc.match(/<[^>]*\brole=["']?main["']?[^>]*>([\s\S]*?)<\/[a-z]+>/i);
  if (mainMatch?.[1] && mainMatch[1].length > 500) {
    doc = mainMatch[1];
  }

  // 2) Remove boilerplate elements together with their inner text.
  doc = doc.replace(
    new RegExp(`<(${BOILERPLATE_TAGS})\\b[^>]*>[\\s\\S]*?<\\/\\1>`, "gi"),
    " ",
  );

  // 3) Drop any element whose class/id looks like boilerplate (open tag → close).
  //    Best-effort, non-nested: covers the common single-level nav/sidebar div.
  doc = doc.replace(
    /<(div|section|ul|ol|span|table|tr|td)\b[^>]*(?:class|id)=["'][^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
    (match) => {
      const attr = match.match(/(?:class|id)=["']([^"']*)["']/i)?.[1] || "";
      return BOILERPLATE_ATTR.test(attr) ? " " : match;
    },
  );

  // 4) Turn block boundaries into newlines so we can filter line-by-line.
  doc = doc
    .replace(/<\/(p|div|li|h[1-6]|section|article|br|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  // 5) Strip remaining tags + decode entities.
  const text = decodeBasicEntities(doc.replace(/<[^>]+>/g, " "));

  // 6) Line-level filtering to remove ToC/nav residue, then collapse whitespace.
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter((l) => l && !isBoilerplateLine(l));

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Minimum extracted characters before we treat a fetched page as "real"
// content. JS-heavy SPAs and bot walls typically strip down to a near-empty
// shell, which would otherwise be saved as a useless source.
const MIN_USABLE_URL_TEXT = 200;

// A stable marker the POST handler uses to map these failures to a 400 and to
// tell, at a glance, that the URL simply can't be parsed (vs. a server error).
const SITE_RESTRICTED_TAG = "[site-restricted]";

/**
 * The site actively prevents automated reading (bot wall, login wall, rate
 * limit) or renders its content with JavaScript so there's nothing to extract.
 * Names the host so the user knows exactly which link was rejected.
 */
function siteRestrictedMessage(host: string): string {
  return `${SITE_RESTRICTED_TAG} We can't read content from ${host} — this site restricts automated access (or loads its content with JavaScript), so its data can't be parsed. Please open the page, copy the text, and paste it using the "Text" option instead — or upload the file directly.`;
}

async function fetchUrlText(url: string) {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL in source name");
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http/https URLs are supported");
  }

  const host = parsedUrl.hostname;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(parsedUrl.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: {
        // A real browser UA — some sites (incl. CDNs) reject obvious bot agents.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/pdf,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });
    // 401/403/429 = the site is deliberately refusing automated access.
    if (res.status === 403 || res.status === 401 || res.status === 429) {
      throw new Error(siteRestrictedMessage(host));
    }
    if (!res.ok) {
      throw new Error(
        `We couldn't reach ${host} (the site returned HTTP ${res.status}). Check the link and try again.`,
      );
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const looksLikePdf =
      contentType.includes("application/pdf") ||
      parsedUrl.pathname.toLowerCase().endsWith(".pdf");

    // PDFs served over a URL must be parsed as binary, not read as text — the
    // previous text()/HTML-strip path returned unusable binary garbage.
    if (looksLikePdf) {
      const arrayBuffer = await res.arrayBuffer();
      const text = await parsePdfBuffer(Buffer.from(arrayBuffer));
      if (text.length < MIN_USABLE_URL_TEXT) {
        throw new Error(
          `We fetched the PDF from ${host} but couldn't extract readable text (it may be a scanned/image-only PDF). Try uploading a text-based PDF instead.`,
        );
      }
      return text;
    }

    const body = await res.text();
    if (!body.trim()) {
      throw new Error(siteRestrictedMessage(host));
    }

    if (
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml")
    ) {
      const text = toPlainTextFromHtml(body);
      if (text.length < MIN_USABLE_URL_TEXT) {
        // A near-empty extraction means a client-rendered SPA or a bot wall.
        throw new Error(siteRestrictedMessage(host));
      }
      return text;
    }

    return body.trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `${host} took too long to respond, so the import timed out. Try again, or paste the text directly.`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = getAuthenticatedUserId(request);
    if (!userId) {
      return fail("Unauthorized", 401);
    }
    const session = await getSession(params.id);
    if (!session) {
      return fail("Session not found", 404);
    }
    if (session.userId !== userId) {
      return fail("Forbidden", 403);
    }

    const contentType = request.headers.get("content-type") || "";
    let kind: StudySourceKind = "text";
    let name = "";
    let text = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      kind = (form.get("kind")?.toString() as StudySourceKind) || "file";
      name = (form.get("name")?.toString() || "").trim();
      text = (form.get("text")?.toString() || "").trim();
      const file = form.get("file");

      if (!text && file instanceof File) {
        text = await parseUploadedStudyFile(file);
        if (!name) {
          name = file.name;
        }
      }
    } else {
      const body = (await request.json()) as {
        kind?: StudySourceKind;
        name?: string;
        text?: string;
      };
      kind = body?.kind || "text";
      name = (body?.name || "").trim();
      text = (body?.text || "").trim();
    }

    if (!ALLOWED_SOURCE_KINDS.has(kind)) {
      return fail("Invalid source kind");
    }
    if (!name) {
      return fail("name is required");
    }
    if (kind === "url" && !text) {
      text = await fetchUrlText(name);
    }
    if (!text) {
      return fail("text is required");
    }

    const source = await addSource(params.id, kind, name, text);
    return ok(source, 201);
  } catch (error) {
    console.error("study.source.POST", error);
    const rawMessage =
      error instanceof Error ? error.message : "Failed to add source";
    // The internal site-restricted tag is for our own classification only —
    // never show it to the user.
    const isSiteRestricted = rawMessage.includes(SITE_RESTRICTED_TAG);
    const message = rawMessage.replace(SITE_RESTRICTED_TAG, "").trim();

    // User-actionable problems (bad file, unreachable/blocked/unparseable URL)
    // return 400 so the workspace surfaces the specific guidance instead of a
    // generic 500.
    if (
      isSiteRestricted ||
      message.includes("Unsupported file type") ||
      message.includes("too large") ||
      message.includes("Maximum size") ||
      message.includes("Invalid URL") ||
      message.includes("Only http/https") ||
      message.includes("couldn't extract readable text") ||
      message.includes("took too long to respond") ||
      message.includes("We couldn't reach")
    ) {
      return fail(message, 400);
    }
    return fail(message, 500);
  }
}
