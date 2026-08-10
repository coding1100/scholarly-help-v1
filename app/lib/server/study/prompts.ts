import { StudyLearningMode } from "@/app/lib/server/study/types";

export const STUDENT_TUTOR_VOICE = [
  "You are a friendly academic tutor helping a student (not a researcher).",
  "Use plain English, short sentences, and everyday words.",
  "Define jargon the first time you use it.",
  "Prefer teaching: analogies, 'in simple terms', and 'what this means for you'.",
  "Never sound like a philosophy paper or textbook abstract.",
  "Stay grounded in the provided source when context is relevant.",
].join(" ");

export const TUTOR_MARKDOWN_RULES = [
  "Formatting (GitHub-flavored Markdown):",
  "- Use ### for section titles with a blank line after each heading.",
  "- Use bullet lists for steps and facts; one clear idea per bullet.",
  "- Use **bold** for key terms students must remember.",
  "- Keep paragraphs to 2–3 short sentences max.",
  "- Complete every sentence and bullet; do not trail off.",
].join("\n");

export function tutorSystemInstruction(mode: StudyLearningMode): string {
  const modeLine =
    mode === "exam"
      ? "Focus only on what helps the student pass an exam: high-yield facts, likely test angles, common traps. Do not add unrelated background from general knowledge."
      : mode === "quiz"
        ? "Frame answers to help the student practice for quizzes: clear, testable facts and quick checks."
        : "Help the student understand the material deeply but still in simple, engaging language.";

  return `${STUDENT_TUTOR_VOICE} ${modeLine} ${TUTOR_MARKDOWN_RULES}`;
}

export function buildTutorUserPrompt(input: {
  question: string;
  context: string;
  hasRelevantContext: boolean;
  mode: StudyLearningMode;
  examTopics?: string[];
  tutorContext?: string;
}): string {
  const topicsLine =
    input.examTopics && input.examTopics.length > 0
      ? `Student-selected exam focus topics: ${input.examTopics.join(", ")}`
      : "";

  const explainHint = /hardest|difficult|confus|explain|simple|bullet/i.test(
    input.question,
  )
    ? [
        "The student wants concepts explained simply.",
        "Structure: ### Simple version (1–2 sentences) → ### Step-by-step bullets → ### Quick memory trick (optional).",
        "Avoid academic jargon unless you immediately explain it.",
      ].join("\n")
    : "";

  const examHint = /exam|test|midterm|final|study guide/i.test(input.question)
    ? "Prioritize exam-relevant, high-yield points only. Skip background trivia not in the source."
    : "";

  return [
    "QUESTION:",
    input.question,
    input.tutorContext ? `STUDENT PREFERENCES:\n${input.tutorContext}` : "",
    topicsLine,
    explainHint,
    examHint,
    "",
    "SOURCE CONTEXT WITH CITATION IDS:",
    input.context || "(none)",
    "",
    "Rules:",
    "- If source context is relevant, answer from it and cite ids like [2].",
    "- GROUNDING (critical): every claim you attribute to the student's document must be",
    "  directly supported by the SOURCE CONTEXT above. Never invent, embellish, or 'recall'",
    "  document details that are not in the context — if the context doesn't say it, the",
    "  document doesn't say it (as far as you know).",
    "- If the context does not contain the answer, say so plainly first (e.g. \"Your",
    "  document's excerpts I can see don't cover this\") instead of guessing.",
    input.mode === "exam"
      ? "- Do NOT add general knowledge outside the source unless the source is empty; then say what is missing."
      : "- If source is insufficient, you may add brief general knowledge but start with exactly: Not from source:",
    "- Write like a tutor talking to a student, not a scholar writing for experts.",
    "- Use Markdown with clear headings and scannable bullets.",
    "",
    TUTOR_MARKDOWN_RULES,
    "",
    `Learning mode: ${input.mode}`,
    `Has relevant source context: ${input.hasRelevantContext ? "yes" : "no"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function notesSystemInstruction(mode: StudyLearningMode): string {
  if (mode === "exam") {
    return [
      STUDENT_TUTOR_VOICE,
      "Create exam-focused study notes only — what matters for the test, not a full textbook summary.",
      "Return valid JSON only without markdown fences.",
    ].join(" ");
  }
  if (mode === "quiz") {
    return [
      STUDENT_TUTOR_VOICE,
      "Create study notes optimized for quiz practice: clear, testable facts.",
      "Return valid JSON only without markdown fences.",
    ].join(" ");
  }
  return [
    STUDENT_TUTOR_VOICE,
    "Create clear, engaging study notes a beginner can scan quickly.",
    "Return valid JSON only without markdown fences.",
  ].join(" ");
}

export function notesUserPrompt(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
): string {
  const topicsBlock =
    examTopics.length > 0
      ? `Prioritize these student-selected topics:\n${examTopics.map((t) => `- ${t}`).join("\n")}\n`
      : "";

  if (mode === "exam") {
    return [
      "Create EXAM-FOCUSED notes as JSON:",
      '{ "title": "Exam Study Guide", "mode": "exam", "examTips": ["string"], "sections": [ { "heading": "string", "priority": "must-know" | "good-to-know", "bullets": ["string"] } ] }',
      "Rules:",
      "- 3 to 5 sections (e.g. Must Memorize, Likely Exam Questions, Common Traps, Quick Comparisons)",
      "- priority must-know for highest-yield content",
      "- 3 to 6 bullets per section; plain English; one idea per bullet",
      "- examTips: 3 to 5 short actionable tips for the exam",
      "- ONLY use facts from SOURCE TEXT; no unrelated biology/history filler",
      "- Prefer ideas that repeat, appear in headings, or sound important in the source",
      topicsBlock,
      "SOURCE TEXT:",
      sourceText,
    ].join("\n");
  }

  return [
    "Create study notes as JSON:",
    '{ "title": "Study Notes", "mode": "' + mode + '", "sections": [ { "heading": "string", "bullets": ["string"] } ] }',
    "Rules:",
    "- 3 to 6 sections with clear, student-friendly headings",
    "- 3 to 6 bullets per section; conversational plain English",
    "- No dense jargon without a quick explanation in the same bullet",
    "- Every bullet must come from SOURCE TEXT only",
    topicsBlock,
    "SOURCE TEXT:",
    sourceText,
  ].join("\n");
}

export function summarySystemInstruction(mode: StudyLearningMode): string {
  return [
    STUDENT_TUTOR_VOICE,
    "Summarize for a student with clear structure they can scan.",
    "Return valid JSON only without markdown fences (the JSON values may contain Markdown).",
  ].join(" ");
}

// --- Map-reduce summarization (for long documents) -------------------------
// "Map" each chunk into compact factual notes; the "reduce" step then folds all
// notes into the final summary, so the result reflects the WHOLE document.

export function mapChunkSystemInstruction(): string {
  return [
    STUDENT_TUTOR_VOICE,
    "You read ONE excerpt of a longer document and write down what it TEACHES —",
    "the actual ideas, arguments, findings, and explanations — in your own words.",
    "You are NOT a table-of-contents extractor.",
    "Return plain text only: a short bullet list. No preamble, no headings.",
  ].join(" ");
}

export function mapChunkUserPrompt(
  chunkText: string,
  part: number,
  total: number,
): string {
  return [
    `This is part ${part} of ${total} of a longer document.`,
    "Write concise notes on the SUBSTANCE of this excerpt — the concepts and",
    "information it actually explains — as if teaching it to a student.",
    "Rules:",
    "- 3 to 8 bullets (use '- '); one idea per bullet; paraphrase in plain English.",
    "- IGNORE and DO NOT reproduce navigational/front-matter: tables of contents,",
    "  lists of section titles, page numbers, dotted leaders (……), headers/footers,",
    "  cover-page metadata (course code, session, campus, word count).",
    "- If this excerpt is ONLY such front-matter with no real content, reply with",
    "  exactly: (no substantive content)",
    "- Explain what each section SAYS, don't just name the section.",
    "- Keep important terms, numbers, and findings; drop filler and repetition.",
    "- Do not invent anything not present in the excerpt.",
    "",
    "EXCERPT:",
    chunkText,
  ].join("\n");
}

/**
 * Reduce step: fold the per-chunk notes into the final summary JSON at the
 * target length. Reuses the same output contract/formatting rules as the
 * single-pass summary, but its input is the aggregated notes (whole document).
 */
export function reduceSummaryUserPrompt(
  aggregatedNotes: string,
  mode: StudyLearningMode,
  targetWordCount: number,
): string {
  return summaryUserPrompt(aggregatedNotes, mode, targetWordCount).replace(
    "SOURCE TEXT:",
    "These are condensed notes covering the ENTIRE document. Summarize across ALL of them (do not focus on just the first ones).\n\nSOURCE NOTES:",
  );
}

export function summaryUserPrompt(
  sourceText: string,
  mode: StudyLearningMode,
  targetWordCount: number,
): string {
  // Give the model a workable band around the computed target rather than a
  // single number, so it can land naturally without padding or truncating.
  // The target is already floored at 80 words upstream; keep the band's lower
  // bound at the floor so we never instruct the model to go below it.
  const lower = Math.max(80, Math.round(targetWordCount * 0.9));
  const upper = Math.round(targetWordCount * 1.15);

  const examNote =
    mode === "exam"
      ? 'short: "what to focus on for the exam" in 2-3 sentences.'
      : "short: a 1-2 sentence TL;DR a student can read at a glance.";

  return [
    "Summarize the SOURCE TEXT into JSON with this exact shape:",
    '{ "short": "string", "detailed": "string (Markdown)" }',
    examNote,
    `detailed: a well-formatted Markdown summary of about ${targetWordCount} words (acceptable range ${lower}-${upper}).`,
    "detailed MUST be structured Markdown, NEVER one flat paragraph:",
    "- Optionally open with a one-line ## Overview.",
    "- Then a ## Key Points section. Key Points MUST be CATEGORIZED: do NOT put a single flat bullet list under it.",
    "  Instead, group the key points into 2 or more themed sub-sections, each introduced by a ### sub-heading",
    "  that names the theme/topic (derive the sub-heading names from the actual content — e.g. ### Core Concepts,",
    "  ### Key Terms, ### Processes, ### Causes & Effects, etc.). Under EACH ### sub-heading put a bullet list (- )",
    "  of that category's points — one idea per bullet.",
    "- You may add further ## themed sections after Key Points if the content warrants it, each with bullets.",
    "- Use **bold** for the key terms a student must remember.",
    "- Keep any prose to 1-2 short sentences; prefer bullets over paragraphs.",
    "- Separate every heading, paragraph, and list with a real newline (use \\n in the JSON string).",
    "Scale depth to the length: more categories/bullets for long sources, fewer for short — but ALWAYS keep the",
    "Key Points section split into ### categorized sub-sections with bullets (never one flat list).",
    "CRITICAL: Summarize the SUBSTANCE — the ideas, arguments, and findings the document actually explains.",
    "Do NOT reproduce the table of contents or a list of section titles. Never output lines like",
    '"1. Introduction 2 1.1 Rationale 3…", page numbers, dotted leaders (……), or cover-page metadata',
    "(course code, session, campus, word count). Explain what the sections SAY, not their names.",
    "Use only SOURCE TEXT facts. Do not invent content to hit the word count.",
    "",
    "Example of the detailed value (shape only, not content):",
    '"## Overview\\n- Main idea in one line\\n\\n## Key Points\\n### Core Concepts\\n- **Term**: explanation\\n- **Term**: explanation\\n\\n### Key Processes\\n- Step one\\n- Step two\\n\\n### Why It Matters\\n- Point one\\n- Point two"',
    "",
    "SOURCE TEXT:",
    sourceText,
  ].join("\n");
}

export function flashcardsSystemInstruction(): string {
  return `${STUDENT_TUTOR_VOICE} Create flashcards for active recall. Return valid JSON only without markdown fences.`;
}

export function flashcardsUserPrompt(sourceText: string, mode: StudyLearningMode): string {
  return [
    "JSON array: { \"id\": \"card-1\", \"front\": \"question\", \"back\": \"answer\" }",
    "Rules:",
    "- 8 to 12 cards",
    "- Front: clear student-friendly question; back: short plain answer",
    "- Mix definitions, 'why', and 'how' questions",
    mode === "exam" ? "- Prioritize high-yield exam concepts" : "",
    "- Source-grounded only",
    "",
    "SOURCE TEXT:",
    sourceText,
  ]
    .filter(Boolean)
    .join("\n");
}

export function quizSystemInstruction(): string {
  return `${STUDENT_TUTOR_VOICE} Create quiz questions that help students practice for tests. Return valid JSON only without markdown fences.`;
}

export function outlineSystemInstruction(): string {
  return `${STUDENT_TUTOR_VOICE} Organize course material into a faithful chapter and topic hierarchy. Return valid JSON only without markdown fences.`;
}

export function outlineUserPrompt(sourceText: string): string {
  return [
    'Return: { "title": "string", "chapters": [{ "id": "chapter-1", "title": "string", "summary": "string", "topics": [{ "id": "topic-1", "title": "string" }] }] }',
    "Rules:",
    "- Use only structure and concepts supported by the source",
    "- Prefer explicit chapter or section headings; otherwise group related ideas conservatively",
    "- Keep the original teaching order unless it is clearly unusable",
    "- Include 1-8 useful topics per chapter",
    "- Do not invent grade weights or dates",
    "",
    "SOURCE TEXT:",
    sourceText,
  ].join("\n");
}

export function syllabusSystemInstruction(): string {
  return `${STUDENT_TUTOR_VOICE} Extract grading weights and deadlines from course material. Return valid JSON only without markdown fences. Never invent missing values.`;
}

export function syllabusUserPrompt(sourceText: string): string {
  return [
    'Return: { "gradeComponents": [{ "name": "string", "weight": number, "evidence": "short source wording" }], "deadlines": [{ "title": "string", "dueDate": "YYYY-MM-DD or null", "rawDate": "string", "confidence": "high" | "medium" | "low" }], "warnings": ["string"] }',
    "Rules:",
    "- Extract only explicitly stated weights and dates",
    "- Keep dueDate null when the year or exact date cannot be normalized safely",
    "- Put ambiguity, a missing year, and totals not equal to 100 in warnings",
    "- Evidence must be a short supporting phrase",
    "",
    "SOURCE TEXT:",
    sourceText,
  ].join("\n");
}

export function quizUserPrompt(
  sourceText: string,
  mode: StudyLearningMode,
  examTopics: string[],
  targetQuestionCount: number,
  config: {
    difficulty?: "easy" | "medium" | "hard" | "adaptive";
    questionFormat?: "mcq" | "short_answer" | "mixed";
    preAssessment?: boolean;
    academicLevel?: "high_school" | "college" | "phd";
    rubric?: string;
  } = {},
): string {
  const topicsBlock =
    examTopics.length > 0
      ? `Focus on: ${examTopics.join(", ")}`
      : "";

  // Ask for exactly the computed target (≈20% coverage of the source, min 10),
  // with a small band so the model can land naturally without padding.
  const target = Math.max(config.preAssessment ? 2 : 10, Math.round(targetQuestionCount));
  const lower = Math.max(config.preAssessment ? 2 : 10, target - 1);
  const upper = target + 2;
  const requestedDifficulty = config.difficulty || "adaptive";
  const requestedFormat = config.questionFormat || "mcq";

  return [
    `JSON array of ${lower} to ${upper} items (aim for ${target}):`,
    '{ "id": "quiz-1", "question": "string", "options": ["A","B","C","D"] or [], "correctAnswerIndex": 0, "answer": "string", "explanation": "string", "hint": "string", "simpleExplanation": "string", "topic": "string", "difficulty": "easy" | "medium" | "hard", "questionType": "recall" | "application" | "analysis", "questionFormat": "mcq" | "short_answer" }',
    "Rules:",
    config.preAssessment
      ? `- Generate about ${target} diagnostic questions across distinct core topics.`
      : `- Generate ${target} questions drawn from the MOST IMPORTANT and relevant ~20% of the material (core concepts, definitions, and high-yield facts) — never fewer than 10.`,
    requestedFormat === "mcq"
      ? "- Every item is multiple choice with exactly 4 options; correctAnswerIndex 0-3"
      : requestedFormat === "short_answer"
        ? "- Every item is short answer: options must be [], and answer must contain a concise model answer"
        : "- Mix multiple-choice and short-answer items. MCQs have exactly 4 options; short answers have options: []",
    "- Mix recall, application, and at least one 'which is NOT true' style question",
    "- Student-friendly wording; explanations teach why the answer is right",
    requestedDifficulty === "adaptive"
      ? "- Create a balanced easy/medium/hard pool suitable for adaptive delivery"
      : `- Keep questions at ${requestedDifficulty} difficulty`,
    config.preAssessment ? "- This is a placement check: sample distinct core topics and avoid obscure details" : "",
    config.academicLevel ? `- Match ${config.academicLevel.replace("_", " ")} academic depth` : "",
    config.rubric ? `- Apply this instructor/rubric focus: ${config.rubric}` : "",
    "- No duplicate or near-duplicate questions",
    "- Source-grounded only",
    topicsBlock,
  mode === "exam" ? "- Exam-ready: testable facts students must know" : "",
    "",
    "SOURCE TEXT:",
    sourceText,
  ]
    .filter(Boolean)
    .join("\n");
}
