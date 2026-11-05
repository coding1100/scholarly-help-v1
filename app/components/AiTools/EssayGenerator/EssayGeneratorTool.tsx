"use client";

import EssayStudio from "../EssayStudio/EssayStudio";

/**
 * AI Essay Generator - Now powered by the unified Essay Studio & Writing Suite.
 * Merges Thesis Generation, Outline Building, Draft Generation, AI Detection & Essay Grading.
 */
export default function EssayGeneratorTool({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return <EssayStudio embedded={embedded} />;
}
