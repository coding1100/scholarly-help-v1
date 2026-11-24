import { describe, expect, it } from "vitest";
import {
  isTakeMyClassHeaderRoute,
  isTakeMyClassLandingPage,
  isTakeMyClassLayoutPage,
  isTextCtaLandingPage,
  pathnameIncludesTakeMyClass,
  usesStepQuoteForm,
  usesTextMeQuoteCta,
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
    expect(isTakeMyClassLayoutPage("/take-my-class-4/")).toBe(false);
  });

  it("uses text-message CTAs on /tools-thank-you only", () => {
    expect(isTextCtaLandingPage("/tools-thank-you/")).toBe(true);
    expect(isTextCtaLandingPage("/take-my-class/")).toBe(false);
    expect(isTextCtaLandingPage("/thank-you/")).toBe(false);
  });
});

describe("/take-my-class-3 route helpers", () => {
  it("renders the /take-my-class layout with the two-step quote form", () => {
    for (const path of ["/take-my-class-3", "/take-my-class-3/"]) {
      expect(isTakeMyClassLayoutPage(path)).toBe(true);
      expect(isTakeMyClassHeaderRoute(path)).toBe(true);
      expect(usesStepQuoteForm(path)).toBe(true);
    }
    expect(usesStepQuoteForm("/take-my-class/")).toBe(false);
    expect(usesStepQuoteForm("/tools-thank-you/")).toBe(false);
  });
});

describe("Text Me Free Quote CTAs", () => {
  it("applies to /take-my-class and /take-my-class-3 only", () => {
    for (const path of ["/take-my-class", "/take-my-class/", "/take-my-class-3/"]) {
      expect(usesTextMeQuoteCta(path)).toBe(true);
    }
    for (const path of ["/tools-thank-you/", "/take-my-class-4/", "/landing/take-my-class/", "/"]) {
      expect(usesTextMeQuoteCta(path)).toBe(false);
    }
  });
});
