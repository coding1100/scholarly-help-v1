"use client";

import {
  Document as DocxDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export function sanitizeFilename(name: string): string {
  const base = (name || "document").trim() || "document";
  return base.replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "_").slice(0, 160);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Convert editor HTML to LaTeX body (article preamble added in caller if needed). */
export function htmlToLaTeX(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const processNode = (node: Node, inTable = false): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || "";
      text = text
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/{/g, "\\{")
        .replace(/}/g, "\\}")
        .replace(/\$/g, "\\$")
        .replace(/#/g, "\\#")
        .replace(/&/g, "\\&")
        .replace(/%/g, "\\%")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/_/g, "\\_")
        .replace(/~/g, "\\textasciitilde{}");
      return text;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    if (
      inTable &&
      (tagName === "tr" || tagName === "td" || tagName === "th")
    ) {
      return "";
    }

    const isTable = tagName === "table";
    let content = "";
    Array.from(element.childNodes).forEach((child) => {
      content += processNode(child, isTable || inTable);
    });

    switch (tagName) {
      case "h1":
        return `\\section{${content}}\n\n`;
      case "h2":
        return `\\subsection{${content}}\n\n`;
      case "h3":
        return `\\subsubsection{${content}}\n\n`;
      case "p":
        return content ? `${content}\n\n` : "\n";
      case "strong":
      case "b":
        return `\\textbf{${content}}`;
      case "em":
      case "i":
        return `\\textit{${content}}`;
      case "u":
        return `\\underline{${content}}`;
      case "code":
        return `\\texttt{${content}}`;
      case "ul":
        return `\\begin{itemize}\n${content}\\end{itemize}\n\n`;
      case "ol":
        return `\\begin{enumerate}\n${content}\\end{enumerate}\n\n`;
      case "li":
        return `\\item ${content}\n`;
      case "table": {
        const rows: string[] = [];
        const tableRows = element.querySelectorAll("tr");
        tableRows.forEach((row) => {
          const cells = row.querySelectorAll("td, th");
          const rowContent = Array.from(cells)
            .map((cell) => {
              let cellContent = "";
              Array.from(cell.childNodes).forEach((child) => {
                cellContent += processNode(child);
              });
              return cellContent.trim();
            })
            .join(" & ");
          if (rowContent) {
            rows.push(rowContent);
          }
        });
        if (rows.length === 0) return "";
        const numCols =
          tableRows[0]?.querySelectorAll("td, th").length || 1;
        const colSpec = "l".repeat(numCols);
        return `\\begin{table}[h]\n\\centering\n\\begin{tabular}{${colSpec}}\n${rows.join(
          " \\\\\n",
        )} \\\\\n\\end{tabular}\\end{table}\n\n`;
      }
      case "tr":
        return content ? `${content}\n` : "";
      case "td":
      case "th":
        return content;
      case "br":
        return " \\\\\n";
      default:
        return content;
    }
  };

  let latex = "";
  Array.from(tempDiv.childNodes).forEach((node) => {
    latex += processNode(node);
  });

  latex = latex.replace(/& \n/g, "\n").replace(/& $/gm, "");
  return latex.trim();
}

/** Escape plain document title for use inside \\title{...}. */
export function escapePlainTextForLaTeX(text: string): string {
  return (text || "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\textasciitilde{}");
}

export function buildFullLaTeXDocument(body: string, title: string): string {
  const safeTitle = escapePlainTextForLaTeX(
    (title || "Untitled").trim() || "Untitled",
  );
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{geometry}
\\geometry{margin=2.5cm}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\title{${safeTitle}}
\\begin{document}
\\maketitle
${body}
\\end{document}
`;
}

function htmlToDocxParagraphs(html: string): Paragraph[] {
  const div = document.createElement("div");
  div.innerHTML = html;
  const out: Paragraph[] = [];

  type BlockHeading =
    | typeof HeadingLevel.HEADING_1
    | typeof HeadingLevel.HEADING_2
    | typeof HeadingLevel.HEADING_3;

  const addBlock = (text: string, heading?: BlockHeading) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (!t) return;
    const children = [new TextRun({ text: t })];
    if (heading !== undefined) {
      out.push(
        new Paragraph({
          heading,
          spacing: { after: 200 },
          children,
        }),
      );
    } else {
      out.push(
        new Paragraph({
          spacing: { after: 200 },
          children,
        }),
      );
    }
  };

  const walk = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "h1") {
      addBlock(el.textContent || "", HeadingLevel.HEADING_1);
      return;
    }
    if (tag === "h2") {
      addBlock(el.textContent || "", HeadingLevel.HEADING_2);
      return;
    }
    if (tag === "h3") {
      addBlock(el.textContent || "", HeadingLevel.HEADING_3);
      return;
    }
    if (tag === "p") {
      addBlock(el.textContent || "");
      return;
    }
    if (tag === "li") {
      addBlock(`• ${el.textContent || ""}`);
      return;
    }
    if (tag === "tr") {
      const cells = Array.from(el.querySelectorAll("td, th"))
        .map((c) => c.textContent?.trim())
        .filter(Boolean)
        .join(" \t ");
      if (cells) addBlock(cells);
      return;
    }

    const containerTags = [
      "div",
      "article",
      "body",
      "ul",
      "ol",
      "table",
      "thead",
      "tbody",
      "colgroup",
      "section",
      "blockquote",
    ];
    if (containerTags.includes(tag)) {
      el.childNodes.forEach(walk);
    }
  };

  Array.from(div.childNodes).forEach(walk);

  const plainFallback = div.textContent?.trim();
  if (out.length === 0 && plainFallback) {
    addBlock(plainFallback);
  }

  return out;
}

export async function buildDocxBlob(
  html: string,
  documentTitle: string,
): Promise<Blob> {
  const displayTitle = (documentTitle || "").trim() || "Document";

  const bodyParagraphs = htmlToDocxParagraphs(html);
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 360 },
      children: [new TextRun({ text: displayTitle })],
    }),
    ...(bodyParagraphs.length > 0
      ? bodyParagraphs
      : [
          new Paragraph({
            children: [
              new TextRun({
                text: "(No body content yet — type in the editor first.)",
                italics: true,
              }),
            ],
          }),
        ]),
  ];

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function savePdfFromHtml(html: string, baseName: string) {
  // Render HTML to canvas first (reliable layout), then paginate into A4.
  // jsPDF.html() tends to produce odd scaling/line breaks for rich editor HTML.
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.zIndex = "-1";
  wrapper.style.background = "#ffffff";

  // A4 content width at 96dpi ≈ 794px. Use a fixed width so wrapping is stable.
  wrapper.style.width = "794px";
  wrapper.style.padding = "72px 64px"; // ~1in-ish margins in px
  wrapper.style.boxSizing = "border-box";
  wrapper.style.fontFamily = "Georgia, 'Times New Roman', serif";
  wrapper.style.fontSize = "12pt";
  wrapper.style.lineHeight = "1.6";
  wrapper.style.color = "#111827";

  wrapper.innerHTML = `
    <style>
      .pdf-root { color: #111827; }
      .pdf-root * { box-sizing: border-box; }
      .pdf-root h1 { font-size: 20pt; font-weight: 700; margin: 0 0 12pt 0; line-height: 1.25; }
      .pdf-root h2 { font-size: 16pt; font-weight: 700; margin: 16pt 0 10pt 0; line-height: 1.28; }
      .pdf-root h3 { font-size: 13.5pt; font-weight: 700; margin: 14pt 0 8pt 0; line-height: 1.3; }
      .pdf-root p  { margin: 0 0 10pt 0; }
      .pdf-root strong { font-weight: 700; }
      .pdf-root em { font-style: italic; }
      .pdf-root u { text-decoration: underline; }
      .pdf-root a { color: #1d4ed8; text-decoration: underline; }
      .pdf-root code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 10.5pt; }
      .pdf-root pre { background: #f3f4f6; padding: 10pt; border-radius: 6pt; overflow: hidden; }
      .pdf-root ul, .pdf-root ol { margin: 0 0 10pt 18pt; padding: 0; }
      .pdf-root li { margin: 0 0 4pt 0; }
      .pdf-root table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
      .pdf-root th, .pdf-root td { border: 1px solid #e5e7eb; padding: 6pt 8pt; vertical-align: top; }
      .pdf-root th { background: #f9fafb; font-weight: 700; }
      .pdf-root img { max-width: 100%; height: auto; }
      .pdf-root { word-break: break-word; overflow-wrap: anywhere; }
    </style>
    <div class="pdf-root">${html}</div>
  `;

  document.body.appendChild(wrapper);

  const safe = sanitizeFilename(baseName);

  try {
    const canvas = await html2canvas(wrapper, {
      scale: Math.min(2, (window.devicePixelRatio || 1) * 2),
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Use px units so we can paginate precisely based on canvas pixels.
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
      compress: true,
      hotfixes: ["px_scaling"],
    } as any);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 32; // px
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    // Scale canvas to fit printable width.
    const imgWidth = printableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgHeight;
    let y = margin;

    pdf.addImage(imgData, "JPEG", margin, y, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= printableHeight;

    while (heightLeft > 1) {
      pdf.addPage();
      // Move the big image up so the next slice appears on the page.
      y = margin - (imgHeight - heightLeft);
      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        y,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      heightLeft -= printableHeight;
    }

    pdf.save(`${safe}.pdf`);
  } finally {
    wrapper.remove();
  }
}
