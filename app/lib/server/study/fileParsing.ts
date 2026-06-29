import {
  STUDY_UPLOAD_ALLOWED_EXTENSIONS,
  STUDY_UPLOAD_MAX_BYTES,
  studyUploadFileExtension,
  type StudyUploadExtension,
} from "@/app/lib/studyUploadConstraints";

/**
 * Extract text from a PDF buffer. Shared by file uploads and URL imports of
 * PDFs served over http(s).
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Import the implementation file, not the package entry: `pdf-parse/index.js`
  // runs a debug readFileSync(test pdf) when `!module.parent`, which breaks
  // under webpack.
  const pdfParseModule = (await import("pdf-parse/lib/pdf-parse.js")) as {
    default?: (data: Buffer) => Promise<{ text?: string }>;
  };
  const pdfParse =
    pdfParseModule.default ??
    (pdfParseModule as unknown as (data: Buffer) => Promise<{ text?: string }>);
  if (typeof pdfParse !== "function") {
    throw new Error("PDF parser is not available");
  }
  const result = await pdfParse(buffer);
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
