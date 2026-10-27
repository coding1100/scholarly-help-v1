import { describe, expect, it } from "vitest";
import { STUDY_GUIDES } from "./studyGuidesContent";

describe("STUDY_GUIDES", () => {
  const entries = Object.entries(STUDY_GUIDES);

  it("keys pages by pathname without a trailing slash", () => {
    for (const [path] of entries) expect(path).toMatch(/^\/[a-z-]+(\/[a-z-]+)?$/);
  });

  it("gives every page three blog cards and a button", () => {
    for (const [path, content] of entries) {
      expect(content.cards, path).toHaveLength(3);
      for (const card of content.cards) {
        expect(card.href, path).toMatch(/^\/blog\/[a-z0-9-]+\/$/);
        for (const text of [card.category, card.title, card.description]) expect(text.trim(), path).not.toBe("");
      }
      expect(content.button.label.trim(), path).not.toBe("");
      expect(content.button.href, path).toMatch(/^\/blog\//);
    }
  });
});
