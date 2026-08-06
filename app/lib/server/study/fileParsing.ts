import {
  STUDY_UPLOAD_ALLOWED_EXTENSIONS,
  STUDY_UPLOAD_MAX_BYTES,
  studyUploadFileExtension,
  type StudyUploadExtension,
} from "@/app/lib/studyUploadConstraints";

/** A pdf.js text item: the drawn string plus its text matrix. */
type PdfTextItem = {
  str?: string;
  width?: number;
  transform?: number[];
};

/**
 * Rebuild a page's text from its positioned items, inserting the spaces that
 * the PDF format does not store.
 *
 * WHY THIS EXISTS: pdf-parse's built-in renderer joins items on the same line
 * with `text += item.str` — no separator. A PDF has no notion of "words": it
 * draws runs of glyphs at x/y coordinates, and most generators (Word, LaTeX,
 * slide exporters) emit each word, or even each kerned fragment, as a separate
 * item. Concatenating them produced the run-together text users saw:
 * "ComprehensiveStudyGuide", "cellularrespirationservesasafundamental...".
 *
 * Spaces cannot be recovered from the letters afterwards — an all-lowercase run
 * has no boundary signal — so they must be restored here, from geometry:
 *   - a new line when the item's y (transform[5]) changes;
 *   - a space when there is a horizontal gap between the end of the previous
 *     item (x + width) and the start of this one.
 * The gap threshold is a fraction of the font size (transform[0]) so it scales
 * with the text, and items that already end/begin with whitespace are left
 * alone so we never double-space.
 */
function renderPageWithSpaces(pageData: {
  getTextContent: (opts: unknown) => Promise<{ items: PdfTextItem[] }>;
}): Promise<string> {
  return pageData
    .getTextContent({ normalizeWhitespace: true, disableCombineTextItems: false })
    .then((textContent) => {
      let text = "";
      let lastY: number | undefined;
      let lastEndX: number | undefined;

      for (const item of textContent.items) {
        const str = item.str ?? "";
        const transform = item.transform ?? [];
        const fontSize = Math.abs(transform[0] ?? 0) || 0;
        const x = transform[4] ?? 0;
        const y = transform[5];

        if (lastY !== undefined && y !== lastY) {
          // New baseline -> new line.
          text += "\n";
        } else if (lastEndX !== undefined) {
          // Same line: insert a space when the items are visually separated.
          // A quarter of the font size is comfortably below a real space width
          // (~0.25-0.5em) yet above the sub-pixel drift within a single word.
          const gap = x - lastEndX;
          const needsSpace =
            gap > Math.max(fontSize * 0.2, 0.5) &&
            !/\s$/.test(text) &&
            !/^\s/.test(str);
          if (needsSpace) text += " ";
        }

        text += str;
        lastY = y;
        lastEndX = x + (item.width ?? 0);
      }

      return text;
    });
}

/**
 * Extract text from a PDF buffer. Shared by file uploads and URL imports of
 * PDFs served over http(s).
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Import the implementation file, not the package entry: `pdf-parse/index.js`
  // runs a debug readFileSync(test pdf) when `!module.parent`, which breaks
  // under webpack.
  const pdfParseModule = (await import("pdf-parse/lib/pdf-parse.js")) as {
    default?: (data: Buffer, options?: unknown) => Promise<{ text?: string }>;
  };
  const pdfParse =
    pdfParseModule.default ??
    (pdfParseModule as unknown as (
      data: Buffer,
      options?: unknown,
    ) => Promise<{ text?: string }>);
  if (typeof pdfParse !== "function") {
    throw new Error("PDF parser is not available");
  }
  // `pagerender` overrides pdf-parse's space-losing default renderer (see above).
  const result = await pdfParse(buffer, { pagerender: renderPageWithSpaces });
  return (result?.text || "").trim();
}

export async function parseUploadedStudyFile(file: File): Promise<string> {
  const filename = (file.name || "").toLowerCase();
  const mimeType = (file.type || "").toLowerCase();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > STUDY_UPLOAD_MAX_BYTES) {
    throw new Error("File is too large. Maximum size is 10 MB.");
  }

  const ext = studyUploadFileExtension(filename);
  if (
    !STUDY_UPLOAD_ALLOWED_EXTENSIONS.includes(ext as StudyUploadExtension)
  ) {
    throw new Error("Unsupported file type. Allowed: .pdf, .txt, .doc, .docx");
  }

  // Returns the raw extracted text. Boilerplate/ToC cleanup is applied centrally
  // by cleanSourceText() at the ingestion choke point, so every source type
  // (file, URL, pasted text) is cleaned identically.
  return extractRawTextByType(buffer, ext, mimeType);
}

async function extractRawTextByType(
  buffer: Buffer,
  ext: string,
  mimeType: string,
): Promise<string> {
  if (ext === "txt" || mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  if (ext === "pdf" || mimeType === "application/pdf") {
    return parsePdfBuffer(buffer);
  }

  if (
    ext === "docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  if (ext === "doc" || mimeType === "application/msword") {
    const WordExtractor = (await import("word-extractor")).default;
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    return (doc.getBody() || "").trim();
  }

  throw new Error("Unsupported file type. Allowed: .pdf, .txt, .doc, .docx");
}
