import { NextRequest } from "next/server";
import { addSource, getSession } from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import {
  parsePdfBuffer,
  parseUploadedStudyFile,
} from "@/app/lib/server/study/fileParsing";
import { extractReadableTextFromHtml } from "@/app/lib/server/study/htmlExtract";
import { StudySourceKind } from "@/app/lib/server/study/types";

export const dynamic = "force-dynamic";

const ALLOWED_SOURCE_KINDS = new Set<StudySourceKind>([
  "text",
  "url",
  "file",
  "youtube",
]);


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
      const text = extractReadableTextFromHtml(body);
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
