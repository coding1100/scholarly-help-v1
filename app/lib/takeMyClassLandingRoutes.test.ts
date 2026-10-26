import { describe, expect, it } from "vitest";
import {
  isTakeMyClassHeaderRoute,
  isTakeMyClassLandingPage,
  isTakeMyClassLayoutPage,
  isTextCtaLandingPage,
  pathnameIncludesTakeMyClass,
} from "./takeMyClassLandingRoutes";

describe("/tools-thank-you route helpers", () => {
  it("treats /tools-thank-you as the /take-my-class layout", () => {
    for (const path of ["/tools-thank-you", "/tools-thank-you/"]) {
      expect(isTakeMyClassLayoutPage(path)).toBe(true);
      expect(isTakeMyClassLandingPage(path)).toBe(true);
      expect(isTakeMyClassHeaderRoute(path)).toBe(true);
      expect(pathnameIncludesTakeMyClass(path)).toBe(true);
    }
    expect(isTakeMyClassLayoutPage("/take-my-class/")).toBe(true);
    expect(isTakeMyClassLayoutPage("/take-my-class-3/")).toBe(false);
  });

  it("uses text-message CTAs on /tools-thank-you only", () => {
    expect(isTextCtaLandingPage("/tools-thank-you/")).toBe(true);
    expect(isTextCtaLandingPage("/take-my-class/")).toBe(false);
    expect(isTextCtaLandingPage("/thank-you/")).toBe(false);
  });
});
