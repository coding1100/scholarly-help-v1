import { describe, expect, it } from "vitest";
import { isGonePagePath } from "./gonePages";

describe("isGonePagePath", () => {
  it("matches a removed page with or without the trailing slash", () => {
    expect(isGonePagePath("/math-solver/")).toBe(true);
    expect(isGonePagePath("/math-solver")).toBe(true);
    expect(isGonePagePath("/pythagoras-solver/")).toBe(true);
    expect(isGonePagePath("/tools/pythagoras-solver/")).toBe(true);
  });

  it("leaves the math tool, its landing page and look-alike paths alone", () => {
    expect(isGonePagePath("/tools/math-solver/")).toBe(false);
    expect(isGonePagePath("/tools/ai-math-helper/")).toBe(false);
    expect(isGonePagePath("/math-solver/extra/")).toBe(false);
    expect(isGonePagePath("/")).toBe(false);
  });
});
