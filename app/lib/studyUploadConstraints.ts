export const STUDY_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export const STUDY_UPLOAD_ALLOWED_EXTENSIONS = [
  "pdf",
  "txt",
  "doc",
  "docx",
] as const;

export type StudyUploadExtension = (typeof STUDY_UPLOAD_ALLOWED_EXTENSIONS)[number];

export function studyUploadFileExtension(filename: string): string {
  const lower = (filename || "").toLowerCase();
  const dot = lower.lastIndexOf(".");
  return dot >= 0 ? lower.slice(dot + 1) : "";
}

export function validateStudyUploadFileClient(file: File): string | null {
  if (file.size > STUDY_UPLOAD_MAX_BYTES) {
    return "File is too large. Maximum size is 10 MB.";
  }
  const ext = studyUploadFileExtension(file.name);
  if (
    !STUDY_UPLOAD_ALLOWED_EXTENSIONS.includes(ext as StudyUploadExtension)
  ) {
    return "Unsupported file type. Allowed: .pdf, .txt, .doc, .docx";
  }
  return null;
}
