import { describe, expect, it } from "vitest";
import { isGoneBlogPath } from "./gone";

describe("isGoneBlogPath", () => {
  it("matches a pruned post with or without the trailing slash", () => {
    expect(isGoneBlogPath("/blog/who-invented-homework/")).toBe(true);
    expect(isGoneBlogPath("/blog/who-invented-homework")).toBe(true);
  });

  it("leaves live posts, archives and look-alike paths alone", () => {
    expect(isGoneBlogPath("/blog/how-to-focus-on-homework/")).toBe(false);
    expect(isGoneBlogPath("/blog/")).toBe(false);
    expect(isGoneBlogPath("/blog/category/who-invented-homework/")).toBe(false);
    expect(isGoneBlogPath("/blog/who-invented-homework/amp/")).toBe(false);
    expect(isGoneBlogPath("/who-invented-homework/")).toBe(false);
  });
});
