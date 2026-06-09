declare module "pdf-parse" {
  interface PdfParseResult {
    numpages?: number;
    text?: string;
  }
  function pdfParse(data: Buffer): Promise<PdfParseResult>;
  export = pdfParse;
}

/** Real implementation; avoid package root `index.js` (debug harness breaks in Next/webpack). */
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    numpages?: number;
    text?: string;
  }
  function pdfParse(data: Buffer, options?: unknown): Promise<PdfParseResult>;
  export = pdfParse;
}

declare module "word-extractor" {
  class WordExtractor {
    extract(source: string | Buffer): Promise<{
      getBody(): string;
    }>;
  }
  export default WordExtractor;
}
