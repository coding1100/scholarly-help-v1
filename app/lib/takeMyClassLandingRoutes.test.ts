import { describe, expect, it } from "vitest";
import {
  isTakeMyClassHeaderRoute,
  isTakeMyClassLandingPage,
  isTakeMyClassLayoutPage,
  isTextCtaLandingPage,
  pathnameIncludesTakeMyClass,
} from "./takeMyClassLandingRoutes";

describe("/tools-signup route helpers", () => {
  it("treats /tools-signup as the /take-my-class layout", () => {
    for (const path of ["/tools-signup", "/tools-signup/"]) {
      expect(isTakeMyClassLayoutPage(path)).toBe(true);
      expect(isTakeMyClassLandingPage(path)).toBe(true);
      expect(isTakeMyClassHeaderRoute(path)).toBe(true);
      expect(pathnameIncludesTakeMyClass(path)).toBe(true);
    }
    expect(isTakeMyClassLayoutPage("/take-my-class/")).toBe(true);
    expect(isTakeMyClassLayoutPage("/take-my-class-3/")).toBe(false);
  });

  it("uses text-message CTAs on /tools-signup only", () => {
    expect(isTextCtaLandingPage("/tools-signup/")).toBe(true);
    expect(isTextCtaLandingPage("/take-my-class/")).toBe(false);
    expect(isTextCtaLandingPage("/thank-you/")).toBe(false);
  });
});
