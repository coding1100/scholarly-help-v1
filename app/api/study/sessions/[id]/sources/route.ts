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

function toPlainTextFromHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Minimum extracted characters before we treat a fetched page as "real"
// content. JS-heavy SPAs and bot walls typically strip down to a near-empty
// shell, which would otherwise be saved as a useless source.
const MIN_USABLE_URL_TEXT = 200;

const BLOCKED_SITE_MESSAGE =
  "This link couldn't be imported — the site blocks automated access or loads its content with JavaScript. Try downloading the page and uploading the file, or paste the text directly.";

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
    if (res.status === 403 || res.status === 401 || res.status === 429) {
      throw new Error(BLOCKED_SITE_MESSAGE);
    }
    if (!res.ok) {
      throw new Error(`Could not fetch URL content (HTTP ${res.status})`);
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
          "We fetched the PDF but couldn't extract readable text (it may be scanned images). Try uploading a text-based PDF.",
        );
      }
      return text;
    }

    const body = await res.text();
    if (!body.trim()) {
      throw new Error(BLOCKED_SITE_MESSAGE);
    }

    if (
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml")
    ) {
      const text = toPlainTextFromHtml(body);
      if (text.length < MIN_USABLE_URL_TEXT) {
        // A near-empty extraction means a client-rendered SPA or a bot wall.
        throw new Error(BLOCKED_SITE_MESSAGE);
      }
      return text;
    }

    return body.trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("URL fetch timed out. The site took too long to respond.");
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
    const message =
      error instanceof Error ? error.message : "Failed to add source";
    // User-actionable problems (bad file, unreachable/blocked URL) return 400 so
    // the workspace surfaces the specific guidance instead of a generic 500.
    if (
      message.includes("Unsupported file type") ||
      message.includes("too large") ||
      message.includes("Maximum size") ||
      message.includes("Invalid URL") ||
      message.includes("Only http/https") ||
      message === BLOCKED_SITE_MESSAGE ||
      message.includes("couldn't be imported") ||
      message.includes("couldn't extract readable text") ||
      message.includes("fetch timed out") ||
      message.includes("Could not fetch URL content")
    ) {
      return fail(message, 400);
    }
    return fail(message, 500);
  }
}
