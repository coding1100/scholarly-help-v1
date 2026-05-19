import { NextRequest } from "next/server";
import { addSource, getSession } from "@/app/lib/server/study/repo";
import { fail, getAuthenticatedUserId, ok } from "@/app/lib/server/study/http";
import { parseUploadedStudyFile } from "@/app/lib/server/study/fileParsing";
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
        "User-Agent":
          "Mozilla/5.0 (compatible; ScholarlyHelpBot/1.0; +https://scholarly-help.com)",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Could not fetch URL content (${res.status})`);
    }
    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const body = await res.text();
    if (!body.trim()) {
      throw new Error("URL returned empty content");
    }
    if (contentType.includes("text/html")) {
      return toPlainTextFromHtml(body);
    }
    return body.trim();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("URL fetch timed out");
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
    if (
      message.includes("Unsupported file type") ||
      message.includes("too large") ||
      message.includes("Maximum size")
    ) {
      return fail(message, 400);
    }
    return fail(message, 500);
  }
}
